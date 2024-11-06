import React, { useState, useEffect } from 'react';
import './Messages.css';
import { FaUserCircle } from "react-icons/fa";
import { FaSearch } from 'react-icons/fa';
import { ImCross } from 'react-icons/im';
import { IoArrowUndo } from "react-icons/io5";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import Navbar from '../HomeHeader/HomeHeader';  

const Messages = () => {
    const [username, setUsername] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedUsername, setSelectedUsername] = useState("");
    const [search, setSearch] = useState('');
    const [searchData, setSearchData] = useState([]);
    const [message, setMessage] = useState("");
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

    useEffect(() => {
        if(search !== '') {
            fetch(`http://127.0.0.1:5000/search?q=${search}`)
            .then((res) => res.json())
            .then((data) => setSearchData(data));
        } else {
            setSearchData([]);
        }
    }, [search])


    const handleClose = () => {
        setSearch('');
        setSearchData([]);
    }

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() === "") return;
        try {
            // Send a POST request to backend
            const response = await fetch('http://127.0.0.1:5000/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    receiver_username: selectedUsername, 
                    content: message 
                }), 
                credentials: 'include',  // Include credentials (session cookies)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log('Message sent:', message);
                setMessage("");
            } else {
                console.log("An error occurred");
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

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
                    {isSearchOpen ? ( 
                        <div className="new-message">
                            <button className="back-button" onClick={() => setIsSearchOpen(false)}>
                                <IoArrowUndo /></button>
                            <h2>New Message</h2>
                            <div className= "message-search-input">
                                <div className='message-search-icon' > 
                                    {search === '' ? (
                                        <FaSearch />
                                    ) : (
                                        <ImCross onClick={handleClose} />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="message-search"
                                    placeholder="Search..."
                                    autoComplete='off'
                                    onChange={(e) => setSearch(e.target.value)}
                                    value={search}
                                />
                            </div>
                            <div className="message-search-result">
                                {searchData.map((data, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="message-search-result-item"
                                            onClick={() => {
                                                setSelectedUsername(data.username);
                                                setIsSearchOpen(false);
                                                handleClose();
                                            }}
                                        >
                                            {data.username}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : selectedUsername ? (
                        <div className="user-message">
                            <div className="other-user-header">
                                <FaUserCircle 
                                    className="other-user-icon" 
                                    onClick={() => navigate(`/${selectedUsername}`)}/>
                                <h3 onClick={() => navigate(`/${selectedUsername}`)}> {selectedUsername}</h3>
                            </div>
                            <div className="chat-content">
                            </div>
                            <form onSubmit={sendMessage}>
                                <div className="message-bar">
                                    <input
                                        type="text"
                                        className="message-content"
                                        placeholder="Message..."
                                        autoComplete='off'
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <button type="submit" className="send-button">
                                        <PiPaperPlaneTilt />
                                        </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="empty-message">
                            <h2>Your messages</h2>
                            <p>Send a message to start a chat.</p>
                            <button className="send-message-btn" onClick={() => setIsSearchOpen(true)}>
                                Send message</button>
                            {/* Delete all capsules button */}
                            <button className="delete-capsules-btn" onClick={handleDeleteCapsules}>
                                Delete All Capsules
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
