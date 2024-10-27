import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
    // State to store the username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents page reload or default form submission
        try {
            // Send a POST request to backend
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }), 
                credentials: 'include',  // Include credentials (session cookies)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log('Login successful:', data.message);
                setErrorMessage('');
                navigate('/home');  // Redirect after successful login
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };
    

    return (
        <div className='login-page'>
            <div className='login-container'>
                <div className='wrapper'>
                    <form onSubmit={handleSubmit}>
                        <h1>Login</h1>
                        <div className="input-box">
                            <input type="text" placeholder='Username/Email' required value={username} onChange={(e) => setUsername(e.target.value)} />
                            <FaUser className= 'icons' />
                        </div>
                        <div className="input-box">
                            <input type="password" placeholder='Password' required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <FaLock className= 'icons'/>
                        </div>
                        <div className="remember-forgot">
                            <label><input type="checkbox" /> Remember Me</label>
                            <Link to="/reset-password">Forgot Password?</Link>
                        </div>
                        <button type="submit">Login</button>
                        <div className="register-link">
                            <p>Need an account? <Link to="/register">Sign Up</Link></p>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
