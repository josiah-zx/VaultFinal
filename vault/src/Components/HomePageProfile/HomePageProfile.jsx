import React, { useState, useEffect } from 'react';
import './HomePageProfile.css';
import { FaUserCircle } from 'react-icons/fa';
import {useNavigate} from "react-router-dom";


const HomePageProfile = () => {
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [postCount, setPostCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const navigate = useNavigate();


    // Fetch username and profile picture from Flask session
    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session-user`, {
                    credentials: 'include', // Include session cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username); // Set the username from session data

                    // Fetch profile data for additional details (profile picture, etc.)
                    const profileResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${data.username}`, {
                        credentials: 'include',
                    });
                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        setProfilePicture(profileData.profile_pic
                            ? `${process.env.REACT_APP_BACKEND_URL}${profileData.profile_pic}`
                            : null
                        );
                        setPostCount(profileData.post_count);
                        setFollowerCount(profileData.follower_count);
                        setFollowingCount(profileData.following_count);
                    } else {
                        console.error('Failed to load profile data');
                    }
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

    return (
        <div className='profile-card'>
            <div className='profile-info'>
                <div className="profile-avatar">
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="profile-avatar-image"
                            onClick={() => navigate(`/${username}`)}
                            style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <FaUserCircle className="profile-avatar-placeholder" />
                    )}
                </div>
                <div className='profile-username' onClick={() => navigate(`/${username}`)} style={{ cursor: 'pointer' }}>
                    {username || <span className="error-text">{errorMessage}</span>}
                </div>
                <div className="profile-stats">
                    <span>{postCount} posts</span>
                    <span>{followerCount} followers</span>
                    <span>{followingCount} following</span>
                </div>
            </div>
        </div>
    );
};

export default HomePageProfile;
