from flask import Flask, jsonify, request
import sqlite3
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Creates the database with multiple tables
def init_db():
    connection = sqlite3.connect('vault_database.db')
    cursor = connection.cursor()

    # Creates table for storing user data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            profile_pic TEXT,                               
            bio TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Creates table for storing user posts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ''')

    # Creates table for followers
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS followers (
            follower_id INTEGER NOT NULL,
            followed_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, followed_id),
            FOREIGN KEY(follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY(followed_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ''')

    connection.commit()
    connection.close()

def get_db_connection():
    connection = sqlite3.connect('vault_database.db', timeout=10.0)
    return connection

def insert_new_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO users (username, password) VALUES (?, ?)
    ''', (username, password))

    conn.commit()
    conn.close()


#  Initializes the database (will only need to be run when first creating the DB and anytime we add new fields/schemas to the tables
@app.route('/init', methods=['GET'])
def initialize_database():
    init_db()
    return jsonify({"message": "Database initialized!"})

#  Returns all the users in the users table
@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    conn.close()
    return jsonify(users)

# Login handling
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()

    # Checking if username is in database and if password is correct
    cursor.execute("SELECT username, password FROM users WHERE username = ? AND password = ?", (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"status": "success", "message": "Login successful!"}), 200
    else:
        return jsonify({"status": "failure", "message": "Username or password incorrect."}), 400
    
# Registration handling
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    existing_user = cursor.fetchone()

    if existing_user:
        # Username is already in database/is taken
        conn.close()
        return jsonify({"error": "Username already taken"}), 409

    # Adding username and password into the database
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Account created!"}), 201


# Retrieve single user by ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify(user), 200
    else:
        return jsonify({"error": "User not found"}), 404

# Update user profile information
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users
        SET username = ?, email = ?, profile_pic = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    ''', (data['username'], data['email'], data['profile_pic'], data['bio'], user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "User profile updated!"}), 200

# Create a time capsule / post
@app.route('/posts', methods=['POST'])
def create_post():
    data = request.json
    user_id = data['user_id']
    content = data['content']
    image_url = data.get('image_url')  # null if no image

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO posts (user_id, content, image_url)
        VALUES (?, ?, ?)
    ''', (user_id, content, image_url))
    conn.commit()
    conn.close()

    return jsonify({"message": "Post created!"}), 201


if __name__ == '__main__':
    init_db()
    app.run(debug=True)

