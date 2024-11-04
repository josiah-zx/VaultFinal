import React, { useState, useEffect } from 'react';
import './Messages.css';
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Navbar from '../HomeHeader/HomeHeader';  

const Messages = () => {
    const [username, setUsername] = useState('');
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

    const handleDeleteCapsules = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/delete-all-capsules', {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                console.error(data.error || 'Failed to delete capsules');
            }
        } catch (error) {
            console.error("Error deleting capsules:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="messages-container">
                <div className="sidebar">
                    <div className="user-profile">
                        <FaUserCircle className="user-icon" />
                        <h3>{username}</h3>  
                    </div>

                    <div className="friends-list">
                        <h4>Messages</h4>
                        <div className="friend-item empty">
                            No friends yet!
                        </div>
                    </div>
                </div>

                <div className="chat-area">
                    <div className="empty-message">
                        <h2>Your messages</h2>
                        <p>Send a message to start a chat.</p>
                        <button className="send-message-btn">Send message</button>
                        {/* Delete all capsules button */}
                        <button className="delete-capsules-btn" onClick={handleDeleteCapsules}>
                            Delete All Capsules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
