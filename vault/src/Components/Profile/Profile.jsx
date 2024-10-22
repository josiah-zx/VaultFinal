import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from '../HomeHeader/HomeHeader';
import { FaUserCircle } from "react-icons/fa";
import { BsGrid3X3 } from "react-icons/bs";
import { IoIosStarOutline } from "react-icons/io";

const Profile = () => {
    const [username, setUsername] = useState('');
    const [selectedTab, setSelectedTab] = useState('capsules');

    // Fetch username from local storage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername); 
        }
    }, []);

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
    };

    return (
        <div>
            <Navbar />
            <div className="profile">
                <div className="profile-avatar">
                    <FaUserCircle />
                </div>
                <div className="profile-info">
                    <h2>{username}</h2> 
                    <div className="profile-stats">
                        <span># posts</span>
                        <span># followers</span>
                        <span># following</span>
                    </div>
                    <p>bio</p>
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
