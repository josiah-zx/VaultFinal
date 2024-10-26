import React, { useState } from 'react';
import './RegistrationForm.css';
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

const RegistrationForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to backend
            const response = await fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials for the session
                body: JSON.stringify({ firstName, lastName, email, username, password, confirmedPassword }), 
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('Account created!', data.message);
                setErrorMessage('');
                // No need to store username and email in local storage; session is handled by Flask
                navigate('/home'); 
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div className='registration-page'>
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Create an Account</h1>
                    <div className="input-box">
                        <input type="text" placeholder='First Name' required value={firstName}
                               onChange={(e) => setFirstName(e.target.value)}/>
                        <FaUser className='icons'/>
                    </div>
                    <div className="input-box">
                        <input type="text" placeholder='Last Name' required value={lastName}
                               onChange={(e) => setLastName(e.target.value)}/>
                        <FaUser className='icons'/>
                    </div>
                    <div className="input-box">
                        <input type="text" placeholder='Email' required value={email}
                               onChange={(e) => setEmail(e.target.value)}/>
                        <FaUser className='icons'/>
                    </div>
                    <div className="input-box">
                        <input type="text" placeholder='Username' required value={username}
                               onChange={(e) => setUsername(e.target.value)}/>
                        <FaUser className='icons'/>
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Password' required value={password}
                               onChange={(e) => setPassword(e.target.value)}/>
                        <FaLock className='icons'/>
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Confirm Password' required value={confirmedPassword}
                               onChange={(e) => setConfirmedPassword(e.target.value)}/>
                        <FaLock className='icons'/>
                    </div>
                    <button type="submit">Sign Up</button>
                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
