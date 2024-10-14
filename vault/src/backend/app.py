from flask import Flask, jsonify, request
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Creates the database with multiple tables
def init_db():
    connection = sqlite3.connect('vault_database.db')
    cursor = connection.cursor()

    # Creates table for storing user data
    cursor.excecute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            profile_pic TEXT,                               
            bio TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Creates table for storing user posts
    cursor.excecute('''
        CREATE TABLE IF NOT EXISTS posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,                                                     
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE    
    ''')

    # Creates table for followers
    cursor.excecute('''
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
    connection = sqlite3.connect('vault_database.db')
    return connection

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

if __name__ == '__main__':
    init_db()  # Optionally call this to initialize on start
    app.run(debug=True)

