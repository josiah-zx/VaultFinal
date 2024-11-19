import React, { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import './EditProfile.css'
import Navbar from '../HomeHeader/HomeHeader';


const EditProfile = () => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [bio, setBio] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { profileUsername } = useParams();


    const handleFileChange = (event) => {
        // Add functionality to add profile picture
    };

    const handleSave = (event) => {
        // Add functionality to save the updated profile information
    };

    // Fetch session user
    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data.username);
                } else {
                    setErrorMessage('Failed to load user info');
                }
            } catch (error) {
                console.error("Failed to fetch session user:", error);
                setErrorMessage('User not found.');
            }
        };
        fetchSessionUser();
    }, []);

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!profileUsername) return;
            try {
                const response = await fetch(`http://127.0.0.1:5000/users/${profileUsername}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setBio(data.bio);
                } else {
                    setErrorMessage('Failed to load profile data');
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setErrorMessage("Error fetching profile data");
            }
        };
        fetchProfileData();
    }, [profileUsername]);


    return (
        <div>
            <Navbar/>
            <div className="edit-settings-container">
                <div className="edit-profile-main">
                    <h1 className="edit-settings-title">Edit Profile</h1>
                    <div className="edit-profile-header">
                        <div className="edit-profile-picture">
                            <img
                                src={profilePicture || 'https://via.placeholder.com/150'}
                                alt="Profile"
                            />
                        </div>
                        <div className="edit-profile-info">
                            <div className="username-section">
                                <h2 className="edit-profile-username">{currentUser || "Your Username"}</h2>
                            </div>
                            <button
                                type="button"
                                className="change-photo-button"
                                onClick={() =>
                                    document.getElementById("upload-photo").click()
                                }
                            >
                                Change photo
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{display: "none"}}
                                id="upload-photo"
                            />
                        </div>
                    </div>
                    <form onSubmit={handleSave} className="edit-profile-form">
                        <div className="edit-bio-section">
                            <label htmlFor="bio" className="bio-label">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Write something about yourself"
                                maxLength="150"
                                className="bio-textarea"
                            />
                            <span className="bio-counter">{bio.length} / 150</span>
                        </div>
                        <div className="save-button-container">
                            <button type="submit" className="save-button">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );


};

export default EditProfile;