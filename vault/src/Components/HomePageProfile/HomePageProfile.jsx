import React, { useState, useEffect } from 'react';
import './HomePageProfile.css';
import { FaUserCircle } from "react-icons/fa";


const HomePageProfile = () => {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedTab, setSelectedTab] = useState('capsules');

    // Fetch username from Flask session
    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include',  // Include session cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);  // Set the username from session data
                } else {
                    setErrorMessage('Failed to load user info');
                }
            } catch (error) {
                console.error("Failed to fetch session user:", error);
                setErrorMessage('An error occurred while fetching user data.');
            }
        };
        fetchSessionUser();
    }, []);

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
    };

    return (
        <div className='profile-card'>
            <div className='profile-info'>
                <div className="profile-avatar">
                    <FaUserCircle/>
                </div>
                <div className='profile-username'>
                    {username || <span className="error-text">{errorMessage}</span>}
                </div>
                <div className="profile-stats">
                    <span>0 posts</span>
                    <span>0 followers</span>
                    <span>0 following</span>
                </div>
            </div>
        </div>
    );

};

export default HomePageProfile;
