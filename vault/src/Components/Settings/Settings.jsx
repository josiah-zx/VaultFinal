import React, { useState } from 'react';
import './Settings.css';
import { FaUser, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";  // Importing FaUserCircle for the avatar
import { useNavigate } from 'react-router-dom';
import Navbar from '../HomeHeader/HomeHeader';

const Settings = () => {
    // State to store the user's settings
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [email, setEmail] = useState(localStorage.getItem('email') || 'johndoe@example.com');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to update settings in the backend
            const response = await fetch('http://127.0.0.1:5000/update-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, notificationsEnabled }), 
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log('Settings updated successfully:', data.message);
                setErrorMessage('');
                localStorage.setItem('username', username);
                localStorage.setItem('email', email);
                navigate('/home');  
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Error during settings update:', error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="settings-container">
                <h1>Settings</h1>
                <div className="settings-box">
                    {/* Profile Avatar Section */}
                    <div className="profile-avatar">
                        <FaUserCircle />
                    </div>
                    <div className="settings-item">
                        <FaUser className='icons' />
                        <span className="label">Username:</span>
                        <span className="info">{username}</span>
                    </div>
                    <div className="settings-item">
                        <FaEnvelope className='icons' />
                        <span className="label">Email:</span>
                        <span className="info">{email}</span>
                    </div>
                    <div className="settings-item">
                        <FaBell className='icons' />
                        <label className="notification-label">
                            <input
                                type="checkbox"
                                checked={notificationsEnabled}
                                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            />
                            Enable Notifications
                        </label>
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button type="submit" className="save-btn" onClick={handleSubmit}>Save Settings</button>
                </div>
            </div>
        </>
    );
};

export default Settings;
