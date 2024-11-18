from app import app, db, User, Capsule  # Adjust the import path based on your file structure

# Define the username you want to check
username = "fabian2"  # Replace with the actual username

# Use the application context to interact with the database
with app.app_context():
    # Fetch the user by username
    user = User.query.filter_by(username=username).first()

    if user:
        print(f"User found: {user.username} with user_id {user.user_id}")
        
        # Fetch capsules by this user's ID
        capsules = Capsule.query.filter_by(user_id=user.user_id).all()
        if capsules:
            print(f"Capsules for user {username}:")
            for capsule in capsules:
                print({
                    "capsule_id": capsule.capsule_id,
                    "content": capsule.content,
                    "open_at": capsule.open_at,
                    "created_at": capsule.created_at,
                })
        else:
            print(f"No capsules found for user {username}")
    else:
        print(f"No user found with username: {username}")
