Introduction
Welcome to the Vault Project! This guide provides a step-by-step walkthrough to set up, run, and test the Vault application.

Prerequisites
Before starting, ensure you have the following installed:

Node.js (v16+ recommended): Download Node.js
Python (v3.9): Download Python
pip: (Python's package manager, installed with Python)
SQLite: Download SQLite

Project Setup
1. Install Node Modules
    - cd vault
    - npm install, in terminal

2. Install react-router-dom
    - cd vault
    - npm install react-router-dom, in terminal
    - If you're getting errors, try: npm install react@latest react-dom@latest

    - react-router-dom is used to establish routing between pages in React, for instance this is how you can get the login form  to display when doing /login, and register when doing /register.

3. Install Python Modules
    - cd backend 
    - pip install Flask, in terminal
    - pip install Flask-Bcrypt, in terminal
    - pip install Flask-CORS, in terminal
    - pip install Flask-SQLAlchemy, in terminal

4. Start Python App
    - cd backend
    - run python "app".py, in terminal (Replace app.py with the name of your backend application file)

5. Start Front End 
    - cd vault
    - run npm start, in terminal




