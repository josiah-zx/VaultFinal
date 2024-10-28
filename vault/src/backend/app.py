from datetime import datetime
from flask import Flask, jsonify, request, send_file, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_cors import cross_origin
import logging
import os
# import sqlite3 (unused)



app = Flask(__name__)
app.secret_key = os.urandom(24)

# Allows cross-site usage
# Do not remove at all costs 
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  
app.config['SESSION_COOKIE_SECURE'] = True 

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'vault_database.db?timeout=30')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
bcrypt = Bcrypt(app)



UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
        logging.FileHandler("app.log")  # Log to a file named app.log
    ]
)
logger = logging.getLogger(__name__)

# Creates the database with multiple tables
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationship to posts
    posts = db.relationship('Post', backref='author', lazy=True)

# Define the Post model
class Post(db.Model):
    __tablename__ = 'posts'
    post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    open_at = db.Column(db.DateTime, nullable=False) 

# Define the Follower model
class Follower(db.Model):
    __tablename__ = 'followers'
    follower_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Define the Message model
class Message(db.Model):
    __tablename__ = 'messages'
    message_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read_status = db.Column(db.Boolean, default=False)
    attachment_url = db.Column(db.String(255), nullable=True)

    # relations to User for querying

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')

# Initialize the database
with app.app_context():
    posts = Post.query.all()
    for post in posts:
        print(post.open_at)
    db.create_all()

# Returns all the users in the users table
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [
        {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_pic": user.profile_pic,
            "bio": user.bio,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        } for user in users
    ]
    return jsonify(users_list)


# Login handling
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    # Find user by username or email
    if '@' in username:
        user = User.query.filter_by(email=username).first()
    else:
        user = User.query.filter_by(username=username).first()

    # Check if user exists and password is correct
    if user is None or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"status": "failure", "message": "Username or password incorrect."}), 401

    # Set user ID in session and make it permanent
    session['user_id'] = user.user_id
    session['username'] = user.username
    session.permanent = True

    return jsonify({
        "status": "success",
        "message": "Login successful!",
        "username": user.username,
        "email": user.email
    }), 200



# Registration handling
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    firstName = data['firstName']
    lastName = data['lastName']
    email = data['email']
    username = data['username']
    password = data['password']
    confirmedPassword = data['confirmedPassword']

    # Check if the username or email is already taken
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({"status": "failure", "message": "Username or email already taken"}), 409

    # Check if passwords match
    if password != confirmedPassword:
        return jsonify({"status": "failure", "message": "Passwords do not match."}), 401

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user
    new_user = User(username=username, email=email, password=hashed_password, first_name=firstName, last_name=lastName)
    db.session.add(new_user)
    db.session.commit()

    # Set session variables with the new user details
    session['user_id'] = new_user.user_id
    session['username'] = new_user.username
    session.permanent = True  # Optional: Makes the session permanent until the user logs out

    # Return the success response with user details
    return jsonify({
        "status": "success",
        "message": "Account created!",
        "username": username,
        "email": email
    }), 201

@app.route('/session-user', methods=['GET'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def get_session_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email  
            }), 200
    return jsonify({"error": "User not logged in"}), 401


# Retrieve single user by ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)

    if user:
        user_data = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_pic": user.profile_pic,
            "bio": user.bio,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        return jsonify(user_data), 200
    else:
        return jsonify({"error": "User not found"}), 404

# Update user profile information
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Update user details
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.profile_pic = data.get('profile_pic', user.profile_pic)
    user.bio = data.get('bio', user.bio)
    user.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({"message": "User profile updated!"}), 200

@app.route('/settings', methods=['POST'])
def update_settings():
    data = request.json  # Get the JSON data from the request
    username = data.get('username')  # Username from the form
    email = data.get('email')  # Email from the form
    notifications_enabled = data.get('notificationsEnabled')  # Notifications preference from the form

    # Retrieve the user from the database using the username (assuming username is unique)
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"status": "failure", "message": "User not found"}), 404

    # Update the user's email and notification preferences
    user.email = email
    # Assuming you want to store notificationsEnabled in the User model
    # user.notifications_enabled = notifications_enabled

    db.session.commit()  # Commit the changes to the database

    return jsonify({"status": "success", "message": "Settings updated successfully!"}), 200


@app.route('/posts', methods=['POST'])
def create_post():
    data = request.form
    logger.info("Received request to create post with data: %s", data)

    # Retrieve the file and save it if provided
    file = request.files.get('image_url')
    file_path = None
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        logger.info("File saved to %s", file_path)
    else:
        logger.warning("No file received.")

    # Retrieve user information and open date from the form
    user_id = data.get('user_id')
    content = data.get('content')
    open_at = data.get('open_at')
    try:
        if open_at:
            open_at = datetime.strptime(open_at, '%Y-%m-%dT%H:%M')
            logger.info("Parsed open_at: %s", open_at)
        else:
            logger.info("No open_at provided; using None.")
    except ValueError as e:
        logger.error("Failed to parse open_at date: %s with error %s", open_at, e)
        return jsonify({"message": "Invalid open_at format, expected '%Y-%m-%dT%H:%M'"}), 400

    # Save the post with the provided data
    new_post = Post(
        user_id=user_id,
        content=content,
        image_url=f"/uploads/{file.filename}" if file else None, 
        open_at=open_at
    )
    db.session.add(new_post)
    try:
        db.session.commit()
        logger.info("Successfully created post with post_id: %s", new_post.post_id)
        return jsonify({"message": "Post created!", "image_url": new_post.image_url}), 201
    except Exception as e:
        logger.error("Failed to commit new post to the database: %s", e)
        db.session.rollback()
        return jsonify({"message": "Failed to create post"}), 500


from flask import send_from_directory

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        # Dynamically set the mimetype based on the file extension
        return send_file(file_path, mimetype='image/jpeg')  
    else:
        return jsonify({"error": "File not found"}), 404

# Searching for users
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')

    # Search users by username using a LIKE query
    users = User.query.filter(User.username.like(f"%{query}%")).limit(7).all()

    results = [{'username': user.username} for user in users]

    return jsonify(results)

# Route for resetting password
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email_or_username = data['email_or_username']
    new_password = data['new_password']
    confirmed_password = data['confirmed_password']

    if new_password != confirmed_password:
        return jsonify({"status": "failure", "message": "Passwords do not match."}), 400

    # Find the user by email or username
    if '@' in email_or_username:
        user = User.query.filter_by(email=email_or_username).first()
    else:
        user = User.query.filter_by(username=email_or_username).first()

    if not user:
        return jsonify({"status": "failure", "message": "User not found."}), 404

    # Update the password
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({"status": "success", "message": "Password reset successful!"}), 200

# Route to send a message
@app.route('/send-message', methods=['POST'])
def send_message():
    data = request.json
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    content = data['content']
    attachment_url = data.get('attachment_url')

    message = Message(sender_id=sender_id, receiver_id=receiver_id, content=content, attachment_url=attachment_url)

    db.session.add(message)
    db.session.commit()

    return jsonify({"status": "success", "message": "Message sent!"}), 201

# Route to get a conversation (list of all msgs ) between user1 and user2 by ID
@app.route('/messages/<int:user1_id>/<int:user2_id>', methods=['GET'])
def get_messages(user1_id, user2_id):
    messages = Message.query.filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.timestamp).all()

    messages_list = [
        {
            "message_id": message.message_id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "content": message.content,
            "timestamp": message.timestamp,
            "read_status": message.read_status,
            "attachment_url": message.attachment_url
        } for message in messages
    ]

    return jsonify(messages_list)

@app.route('/available-posts', methods=['GET'])
def get_available_posts():
    current_time = datetime.utcnow()
    available_posts = Post.query.filter(Post.open_at <= current_time).all()

    posts_list = [
        {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "content": post.content,
            "image_url": f"http://127.0.0.1:5000{post.image_url}" if post.image_url else None,  
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "open_at": post.open_at
        } for post in available_posts
    ]
    return jsonify(posts_list)


# Route to mark messages as read
@app.route('/read-message/<int:message_id>', methods=['POST'])
def mark_message_as_read(message_id):
    message = Message.query.get(message_id)
    if message:
        message.read_status = True
        db.session.commit()
        return jsonify({"status": "success", "message": "Message marked as read."}), 200
    else:
        return jsonify({"status": "failure", "message": "Message not found."}), 404
    
# Route to follow a user
@app.route('/follow/<username>', methods=['POST'])
def follow_user(username):
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 403
    
    current_user_id = session['user_id']
    user_to_follow = User.query.filter_by(username=username).first()

    if not user_to_follow:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if already following
    follow_relationship = Follower.query.filter_by(
        follower_id=current_user_id,
        followed_id=user_to_follow.user_id
    ).first()

    if follow_relationship:
        return jsonify({'message': 'Already following'}), 200
    
    new_follow = Follower(follower_id=current_user_id, followed_id=user_to_follow.user_id)
    db.session.add(new_follow)
    db.session.commit()
    return jsonify({'message': 'Followed successfully'}), 201

# Unfollow a user
@app.route('/follow/<username>', methods=['DELETE'])
def unfollow_user(username):
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 403

    current_user_id = session['user_id']
    user_to_unfollow = User.query.filter_by(username=username).first()

    if not user_to_unfollow:
        return jsonify({'error': 'User not found'}), 404

    # Find the follow relationship
    follow_relationship = Follower.query.filter_by(
        follower_id=current_user_id,
        followed_id=user_to_unfollow.user_id
    ).first()

    if follow_relationship:
        db.session.delete(follow_relationship)
        db.session.commit()
        return jsonify({'message': 'Unfollowed successfully'}), 200
    else:
        return jsonify({'message': 'Not following this user'}), 400

# Route to check following status
@app.route('/follow-status/<username>', methods=['GET'])
def check_follow_status(username):
    current_user_id = session.get('user_id')
    user_to_check = User.query.filter_by(username=username).first()

    if not user_to_check:
        return jsonify({'error': 'User not found'}), 404
    
    is_following = Follower.query.filter_by(
        follower_id=current_user_id,
        followed_id=user_to_check.user_id
    ).first() is not None

    return jsonify({'isFollowing': is_following})

# Route to log out user session
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully!"}), 200

if __name__ == "__main__":
    app.run(debug=True)
