import React, { useState, useEffect } from 'react';
import './Settings.css';
import { FaUser, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Navbar from '../HomeHeader/HomeHeader';


const Settings = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [profilePic, setProfilePic] = useState(null); // State for profile picture
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                    setEmail(data.email);
                    setProfilePic(data.profile_pic); // Directly set the profile picture URL
                } else {
                    console.error('Not logged in.');
                    navigate('/login');
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchSessionUser();
    }, [navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, notificationsEnabled }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Settings updated successfully:', data.message);
                setErrorMessage('');
                navigate('/home');
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Error during settings update:', error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Logged out successfully:', data.message);
                setErrorMessage('');
                navigate('/login');
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Error during logging out:', error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <>
            <Navbar username={username}/>
            <div className="settings-container">
                <h1>Settings</h1>
                <div className="settings-box">
                    <div className="profile-avatar">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="profile-picture"
                            />
                        ) : (
                            <FaUserCircle className="user-icon" />
                        )}
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
                <button type="submit" className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </>
    );
};

export default Settings;
