from app import app, db, User, Post  # Adjust the import path based on your file structure

# Define the username you want to check
username = "fabian2"  # Replace with the actual username

# Use the application context to interact with the database
with app.app_context():
    # Fetch the user by username
    user = User.query.filter_by(username=username).first()

    if user:
        print(f"User found: {user.username} with user_id {user.user_id}")
        
        # Fetch posts by this user's ID
        posts = Post.query.filter_by(user_id=user.user_id).all()
        if posts:
            print(f"Posts for user {username}:")
            for post in posts:
                print({
                    "post_id": post.post_id,
                    "content": post.content,
                    "open_at": post.open_at,
                    "created_at": post.created_at,
                })
        else:
            print(f"No posts found for user {username}")
    else:
        print(f"No user found with username: {username}")
