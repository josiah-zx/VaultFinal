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
    const [profilePic, setProfilePic] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUsername, setSelectedUsername] = useState("");
    const [search, setSearch] = useState('');
    const [searchData, setSearchData] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]); // Holds list of conversations
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
                    setProfilePic(data.profile_pic);
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
        const fetchConversations = async () => {
            if (!username) return;

            try {
                const response = await fetch(`http://127.0.0.1:5000/conversations/${username}`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setConversations(data); // Data includes profile pictures now
                } else {
                    console.error('Failed to fetch conversations.');
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        // Initial fetch
        fetchConversations();

        // Polling interval
        const interval = setInterval(fetchConversations, 5000); // Fetch every 5 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [username]);

    useEffect(() => {
        if (search !== '') {
            fetch(`http://127.0.0.1:5000/search?q=${search}`)
                .then((res) => res.json())
                .then((data) => setSearchData(data));
        } else {
            setSearchData([]);
        }
    }, [search]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedUsername) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/messages/${selectedUserId}`, {
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setMessages(data);
                    } else {
                        console.error('Failed to fetch messages.');
                    }
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            }
        };

        // Initial fetch
        fetchMessages();

        const interval = setInterval(fetchMessages, 5000);

        return () => clearInterval(interval);
    }, [selectedUsername, username]);

    const handleDeleteSearch = () => {
        setSearch('');
        setSearchData([]);
    }

    const handleCloseSearch = () => {
        setSearch('');
        setSearchData([]);
        setIsSearchOpen(false);
    }

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() === "") return;
        try {
            const response = await fetch('http://127.0.0.1:5000/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_username: selectedUsername,
                    content: message
                }),
                credentials: 'include'
            });

            if (response.ok) {
                setMessages([...messages, { sender_id: username, receiver_id: selectedUsername, content: message }]);
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
            const response = await fetch('http://127.0.0.1:5000/delete-all', {
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
            <Navbar username={username}/>
            <div className="messages-container">
                <div className="sidebar">
                    <div className="user-profile">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="user-icon"
                                onError={(e) => { e.target.style.display = "none"; e.target.parentNode.appendChild(document.createElement('span')).classList.add('user-icon-placeholder'); }}
                            />
                        ) : (
                            <FaUserCircle className="user-icon" />
                        )}
                        <h3>{username}</h3>
                    </div>
                    <div className="friends-list">
                        <h4>Messages</h4>
                        <button className="send-message-btn" onClick={() => setIsSearchOpen(true)}>
                            Send a Message
                        </button>
                        <div className="conversations-list">
                            {conversations.length > 0 ? (
                                conversations.map((conv, index) => (
                                    <div
                                        key={index}
                                        className={`conversation-item ${selectedUsername === conv.username ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedUsername(conv.username);
                                            setSelectedUserId(conv.user_id);
                                            handleCloseSearch();
                                        }}
                                    >
                                        {conv.profile_pic ? (
                                            <img
                                                src={conv.profile_pic}
                                                alt="Profile"
                                                className="conversation-icon"
                                                onError={(e) => { e.target.style.display = "none"; e.target.parentNode.appendChild(document.createElement('span')).classList.add('conversation-icon-placeholder'); }}
                                            />
                                        ) : (
                                            <FaUserCircle className="conversation-icon-placeholder" />
                                        )}
                                        <div className="conversation-details">
                                            <span className="conversation-username">{conv.username}</span>
                                            <span className="conversation-last-message">{conv.last_message}</span>
                                            <span className="conversation-timestamp">
                                                {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="friend-item empty">
                                    No friends yet!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="chat-area">
                    {isSearchOpen ? (
                        <div className="new-message">
                            <button className="back-button" onClick={() => handleCloseSearch()}>
                                <IoArrowUndo />
                            </button>
                            <h2>New Message</h2>
                            <div className="message-search-input">
                                <div className='message-search-icon'>
                                    {search === '' ? (
                                        <FaSearch />
                                    ) : (
                                        <ImCross onClick={handleDeleteSearch} />
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
                                {searchData.map((data, index) => (
                                    <div
                                        key={index}
                                        className="message-search-result-item"
                                        onClick={() => {
                                            setSelectedUserId(data.user_id);
                                            setSelectedUsername(data.username);
                                            setIsSearchOpen(false);
                                            handleDeleteSearch();
                                        }}
                                    >
                                        {data.profile_pic ? (
                                            <img
                                                src={data.profile_pic}
                                                alt="Profile"
                                                className="search-result-icon"
                                                onError={(e) => { e.target.style.display = "none"; e.target.parentNode.appendChild(document.createElement('span')).classList.add('search-result-icon-placeholder'); }}
                                            />
                                        ) : (
                                            <FaUserCircle className="search-result-icon-placeholder" />
                                        )}
                                        <span>{data.username}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : selectedUsername ? (
                        <div className="user-message">
                            <button className="back-button-chat" onClick={() => {
                                setSelectedUsername("");
                                setIsSearchOpen(false);
                            }}>
                                <IoArrowUndo />
                            </button>
                            <div className="other-user-header">
                                {conversations.find((conv) => conv.username === selectedUsername)?.profile_pic ? (
                                    <img
                                        src={conversations.find((conv) => conv.username === selectedUsername).profile_pic}
                                        alt="Profile"
                                        className="other-user-icon"
                                        onError={(e) => { e.target.style.display = "none"; e.target.parentNode.appendChild(document.createElement('span')).classList.add('other-user-icon-placeholder'); }}
                                        onClick={() => navigate(`/${selectedUsername}`)}
                                    />
                                ) : (
                                    <FaUserCircle className="other-user-icon-placeholder" onClick={() => navigate(`/${selectedUsername}`)}/>
                                )}
                                <h3 onClick={() => navigate(`/${selectedUsername}`)}>{selectedUsername}</h3>
                            </div>
                            <div className="chat-content">
                                {messages.map((msg, index) => (
                                    <div key={index} className="message-item">
                                        <strong>{msg.sender_id === username ? "You" : selectedUsername}:</strong>
                                        <span>{msg.content}</span>
                                    </div>
                                ))}
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
                                Send message
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
