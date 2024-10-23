from datetime import datetime
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import sqlite3



app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'vault_database.db?timeout=30')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)

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

    # Return username and email in the response
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

    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({"status": "failure", "message": "Username or email already taken"}), 409

    if password != confirmedPassword:
        return jsonify({"status": "failure", "message": "Passwords do not match."}), 401

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password, first_name=firstName, last_name=lastName)
    db.session.add(new_user)
    db.session.commit()

    # Return both username and email in the response
    return jsonify({"status": "success", "message": "Account created!", "username": username, "email": email}), 201


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

# Create a post (time capsule)
@app.route('/posts', methods=['POST'])
def create_post():
    data = request.json
    user = User.query.get(data['user_id'])

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Create a new post
    new_post = Post(
        user_id=user.user_id,
        content=data['content'],
        image_url=data.get('image_url')  # Optional image
    )

    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "Post created!"}), 201

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

if __name__ == "__main__":
    app.run(debug=True)
