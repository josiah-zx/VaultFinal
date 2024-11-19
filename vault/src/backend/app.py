from datetime import datetime
from flask import Flask, jsonify, request, send_file, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_cors import cross_origin
import logging
import os


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

    # Define relationship to capsules
    capsules = db.relationship('Capsule', backref='author', lazy=True)
    posts = db.relationship('Post', backref='author', lazy=True)

# Define the Capsule model
class Capsule(db.Model):
    __tablename__ = 'capsules'
    capsule_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    open_at = db.Column(db.DateTime, nullable=False) 

# Define the Post model
class Post(db.Model):
    __tablename__ = 'posts'
    post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    capsule_id = db.Column(db.Integer, db.ForeignKey('capsules.capsule_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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

# Define the Comment model
class Comment(db.Model):
    __tablename__ = 'comments'
    comment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    capsule_id = db.Column(db.Integer, db.ForeignKey('capsules.capsule_id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships for querying
    user = db.relationship('User', backref='comments', lazy=True)
    capsule = db.relationship('Capsule', backref='comments', lazy=True)



# Initialize the database
with app.app_context():
    all_capsules = Capsule.query.all()
    for capsule in all_capsules:
        print(capsule.open_at)
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
@cross_origin(origins="http://localhost:3000", supports_credentials=True)
def get_session_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            logger.info(f"Session user: {user.user_id}")
            return jsonify({
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email  
            }), 200
    logger.warning("User not logged in")
    return jsonify({"error": "User not logged in"}), 401


@app.route('/capsules/<username>', methods=['GET'])
def get_capsules(username):
    # Handle GET request to fetch capsules by username
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user_capsules = Capsule.query.filter_by(user_id=user.user_id).all()
    capsules_list = [
        {
            "capsule_id": capsule.capsule_id,
            "user_id": capsule.user_id,
            "content": capsule.content,
            "image_url": f"http://127.0.0.1:5000{capsule.image_url}" if capsule.image_url else None,
            "created_at": capsule.created_at,
            "updated_at": capsule.updated_at,
            "open_at": capsule.open_at
        }
        for capsule in user_capsules
    ]
    return jsonify(capsules_list), 200

@app.route('/create-capsule', methods=['POST'])
def create_capsule():
    # Handle POST request to create a new capsule
    if 'user_id' not in session:
        logger.warning("User not logged in.")
        return jsonify({"error": "User not logged in"}), 401
    
    # Retrieve the user ID from the session
    user_id = session['user_id']
    logger.info(f"Creating capsule for user_id: {user_id}")
    
    # Retrieve form data
    data = request.form
    content = data.get("content")
    open_at_str = data.get("open_at")

    # Parse the open_at date
    try:
        open_at = datetime.strptime(open_at_str, "%Y-%m-%dT%H:%M") if open_at_str else None
    except ValueError:
        logger.error("Invalid date format for open_at: %s", open_at_str)
        return jsonify({"message": "Invalid date format"}), 400

    # Handle file upload
    file = request.files.get("image_url")
    image_url = None
    if file:
        filename = file.filename
        image_url = f"/uploads/{filename}"
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        logger.info("Image file saved as %s", image_url)
    
    # Create new capsule with session-based user_id
    new_capsule = Capsule(user_id=user_id, content=content, open_at=open_at, image_url=image_url)
    db.session.add(new_capsule)
    db.session.commit()

    return jsonify({"message": "Capsule created!", "capsule_id": new_capsule.capsule_id, "image_url": new_capsule.image_url}), 201


@app.route('/user-capsules', methods=['GET']) 
def get_user_capsules():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in"}), 401
    current_user_id = session['user_id']
    current_time = datetime.utcnow()
    capsules = Capsule.query.filter(Capsule.user_id == current_user_id, Capsule.open_at <= current_time).all()
    capsules_list = [
        {
            "capsule_id": capsule.capsule_id,
            "user_id": capsule.user_id,
            "content": capsule.content,
            "image_url": f"http://127.0.0.1:5000{capsule.image_url}" if capsule.image_url else None,
            "created_at": capsule.created_at,
            "updated_at": capsule.updated_at,
            "open_at": capsule.open_at
        }
        for capsule in capsules
    ]
    return jsonify(capsules_list), 200

@app.route('/posts/<username>', methods=['GET'])
def get_posts(username):
    # Handle GET request to fetch posts by username
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user_posts = Post.query.filter_by(user_id=user.user_id).all()
    posts_list = [
        {
            "post_id": post.post_id,
            "capsule_id": post.capsule_id,
            "user_id": post.user_id,
            "content": post.content,
            "image_url": f"http://127.0.0.1:5000{post.image_url}" if post.image_url else None,
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
        for post in user_posts
    ]
    return jsonify(posts_list), 200

@app.route('/create-post', methods=['POST'])
def create_post():
    # Handle POST request to create a new post
    if 'user_id' not in session:
        logger.warning("User not logged in.")
        return jsonify({"error": "User not logged in"}), 401
    
    # Retrieve the user ID from the session
    user_id = session['user_id']
    logger.info(f"Creating post for user_id: {user_id}")
    
    # Retrieve form data
    data = request.form
    capsule_id = data.get("capsule_id")
    content = data.get("content")

    # Handle file upload
    file = request.files.get("image_url")
    image_url = None
    if file:
        filename = file.filename
        image_url = f"/uploads/{filename}"
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        logger.info("Image file saved as %s", image_url)
    
    # Create new capsule with session-based user_id
    new_post = Post(capsule_id=capsule_id, user_id=user_id, content=content, image_url=image_url)
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "Post created!", "post_id": new_post.post_id, "image_url": new_post.image_url}), 201

# Retrieve single user by username
@app.route('/users/<username>', methods=['GET'])
def get_user(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get the capsule, follower, and following counts
    capsule_count = Capsule.query.filter_by(user_id=user.user_id).count()
    post_count = Post.query.filter_by(user_id=user.user_id).count()
    follower_count = Follower.query.filter_by(followed_id=user.user_id).count()
    following_count = Follower.query.filter_by(follower_id=user.user_id).count()

    # Check if the current session user follows this profile user
    current_user_id = session.get('user_id')
    is_following = False
    if current_user_id:
        is_following = Follower.query.filter_by(
            follower_id=current_user_id,
            followed_id=user.user_id
        ).first() is not None
        
    return jsonify({
        'capsule_count': capsule_count,
        'post_count': post_count,
        'follower_count': follower_count,
        'following_count': following_count,
        'bio': user.bio,
        'is_following': is_following
    })


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
    data = request.json  
    username = data.get('username')  
    email = data.get('email')  
    notifications_enabled = data.get('notificationsEnabled')  

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"status": "failure", "message": "User not found"}), 404

   
    user.email = email
   

    db.session.commit()  

    return jsonify({"status": "success", "message": "Settings updated successfully!"}), 200


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
    receiver_username = data['receiver_username']
    content = data['content']
    attachment_url = data.get('attachment_url')

    sender_id = session.get('user_id')
    receiver_user = User.query.filter_by(username=receiver_username).first()

    if not receiver_user:
        return jsonify({"status": "failure", "message": "Receiver not found"}), 404

    receiver_id = receiver_user.user_id
    message = Message(sender_id=sender_id, receiver_id=receiver_id, content=content, attachment_url=attachment_url)
    
    db.session.add(message)
    db.session.commit()

    return jsonify({"status": "success", "message": "Message sent!"}), 201

# Endpoint to retrieve list of conversations for the logged-in user
@app.route('/conversations/<username>', methods=['GET'])
def get_conversations(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"status": "failure", "message": "User not found"}), 404

    user_id = user.user_id
    # Query unique conversation users
    conversation_user_ids = db.session.query(
        Message.receiver_id
    ).filter(Message.sender_id == user_id).union(
        db.session.query(Message.sender_id).filter(Message.receiver_id == user_id)
    ).distinct()

    conversations = []
    for convo_user_id in conversation_user_ids:
        convo_user = User.query.get(convo_user_id[0])
        if convo_user:
            last_message = Message.query.filter(
                ((Message.sender_id == user_id) & (Message.receiver_id == convo_user.user_id)) |
                ((Message.sender_id == convo_user.user_id) & (Message.receiver_id == user_id))
            ).order_by(Message.timestamp.desc()).first()

            conversations.append({
                "username": convo_user.username,
                "last_message": last_message.content if last_message else "",
                "timestamp": last_message.timestamp if last_message else ""
            })

    return jsonify(conversations)


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


@app.route('/available-capsules', methods=['GET'])
def get_available_capsules():
    current_time = datetime.utcnow()
    # Fetch capsules along with the associated usernames
    available_capsules = db.session.query(Capsule, User.username).join(User, Capsule.user_id == User.user_id).all()

    capsules_list = [
        {
            "capsule_id": capsule.capsule_id,
            "user_id": capsule.user_id,
            "username": username,  
            "content": capsule.content,
            "image_url": f"http://127.0.0.1:5000{capsule.image_url}" if capsule.image_url else None,
            "created_at": capsule.created_at,
            "updated_at": capsule.updated_at,
            "open_at": capsule.open_at,
            "is_open": capsule.open_at <= current_time
        }
        for capsule, username in available_capsules
    ]
    return jsonify(capsules_list)


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


# Delete all capsules and post (TESTING FUNCTION)
@app.route('/delete-all', methods=['POST'])
def delete_all():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        # Delete database entries
        num_deleted_capsules = Capsule.query.delete()
        num_deleted_posts = Post.query.delete()
        db.session.commit()

        return jsonify({
            "message": f"Deleted {num_deleted_capsules} capsules successfully. "
                       f"Deleted {num_deleted_posts} posts successfully."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete capsules and posts", "details": str(e)}), 500



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

# Route to add new comment - debug logs as well
@app.route('/comments', methods=['POST'])
def add_comment():
    if 'user_id' not in session:
        app.logger.error("User not logged in.")
        return jsonify({"error": "User not logged in"}), 401

    data = request.json
    app.logger.info("Received comment data: %s", data)

    capsule_id = data.get('capsule_id')
    text = data.get('text')

    if not capsule_id or not text:
        app.logger.error("Invalid data: capsule_id=%s, text=%s", capsule_id, text)
        return jsonify({"error": "Invalid data"}), 400

    try:
        new_comment = Comment(
            user_id=session['user_id'],
            capsule_id=capsule_id,
            text=text,
            created_at=datetime.utcnow()
        )
        db.session.add(new_comment)
        db.session.commit()
        app.logger.info("Comment added: %s", new_comment)
        return jsonify({
            "comment_id": new_comment.comment_id,
            "capsule_id": new_comment.capsule_id,
            "user_id": new_comment.user_id,
            "username": session['username'],
            "text": new_comment.text,
            "created_at": new_comment.created_at
        }), 201
    except Exception as e:
        app.logger.error("Error adding comment: %s", e)
        return jsonify({"error": "Failed to add comment"}), 500

# Route to get all comments on a capsule
@app.route('/comments', methods=['GET'])
def get_comments():
    capsule_id = request.args.get('capsule_id')
    if not capsule_id:
        return jsonify({"error": "Capsule ID is required"}), 400

    # Fetch comments for the given capsule ID
    comments = Comment.query.filter_by(capsule_id=capsule_id).all()
    comments_list = [
        {
            "comment_id": comment.comment_id,
            "capsule_id": comment.capsule_id,
            "user_id": comment.user_id,
            "text": comment.text,
            "timestamp": comment.timestamp,
        }
        for comment in comments
    ]

    return jsonify(comments_list), 200

if __name__ == "__main__":
    app.run(debug=True)
