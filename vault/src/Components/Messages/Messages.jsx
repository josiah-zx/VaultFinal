import React, { useState, useEffect } from 'react';
import './Messages.css';
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Navbar from '../HomeHeader/HomeHeader';  

const Messages = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch username from local storage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername); 
        } else {
            console.error('Not logged in.');
            navigate('/login');  
        }
    }, [navigate]);

    return (
        <div>
            <Navbar /> 

            {/* Main container for the messages layout */}
            <div className="messages-container">
                {/* Sidebar for user info */}
                <div className="sidebar">
                    <div className="user-profile">
                        <FaUserCircle className="user-icon" />
                        <h3>{username}</h3>  
                    </div>

                    {/* Empty friends section */}
                    <div className="friends-list">
                        <h4>Messages</h4>
                        <div className="friend-item empty">
                            No friends yet!
                        </div>
                    </div>
                </div>

                {/* Main chat area */}
                <div className="chat-area">
                    <div className="empty-message">
                        <h2>Your messages</h2>
                        <p>Send a message to start a chat.</p>
                        <button className="send-message-btn">Send message</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
