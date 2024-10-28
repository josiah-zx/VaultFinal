import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import Navbar from '../HomeHeader/HomeHeader';
import { FaUserCircle } from "react-icons/fa";
import { BsGrid3X3 } from "react-icons/bs";
import { IoIosStarOutline } from "react-icons/io";

const Profile = () => {
    const { profileUsername } = useParams();
    const [currentUser, setCurrentUser] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
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
                    setCurrentUser(data.username);  // Set the username from session data
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

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (currentUser !== profileUsername) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/follow-status/${profileUsername}`, {
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsFollowing(data.isFollowing);
                    }
                } catch (error) {
                    console.error("Error fetching follow status:", error);
                }
            }
        };
        checkFollowStatus();
    }, [currentUser, profileUsername]);
        
    const toggleFollow = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/follow/${profileUsername}`, {
                method: isFollowing ? 'DELETE' : 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setIsFollowing(!isFollowing);
            } else {
                console.error("Failed to update follow status");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const handleTabClick = (tab) => setSelectedTab(tab);

    return (
        <div>
            <Navbar />
            <div className="profile">
                <div className="profile-avatar">
                    <FaUserCircle />
                </div>
                <div className="profile-info">
                    <h2>{profileUsername || errorMessage}</h2> {/* Display username or error message */}
                    <div className="profile-stats">
                        <span># posts</span>
                        <span># followers</span>
                        <span># following</span>
                    </div>
                    <p>bio</p>

                    {/* Conditional rendering for follow/edit profile button*/}
                    {currentUser === profileUsername ? (
                        <button className="edit-profile-button">Edit Profile</button>
                    ) : (
                        <button className="follow-button" onClick={toggleFollow} >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="profile-tab-navbar">
                    <button
                        className={selectedTab === "capsules" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("capsules")}
                    >
                        <img src="/capsule.png" className="capsule-icon" alt="Capsules" width="24" height="24" />
                    </button>
                    <button
                        className={selectedTab === "posts" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("posts")}
                    >
                        <BsGrid3X3 size={22}/>
                    </button>
                    <button
                        className={selectedTab === "favorites" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("favorites")}
                    >
                        <IoIosStarOutline size={30}/>
                    </button>
                </div>

                <div className="profile-content">
                    {selectedTab === "capsules" && (
                        <div className="capsules-tab">
                            <h3>Capsules Content</h3>
                            <p>Show all the capsules here.</p>
                        </div>
                    )}
                    {selectedTab === "posts" && (
                        <div className="posts-tab">
                            <h3>Posts Content</h3>
                            <p>Show all the posts here.</p>
                        </div>
                    )}
                    {selectedTab === "favorites" && (
                        <div className="favorites-tab">
                            <h3>Favorites Content</h3>
                            <p>Show all favorites here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
