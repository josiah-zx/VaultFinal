import React, { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import './EditProfile.css'
import Navbar from '../HomeHeader/HomeHeader';


const EditProfile = () => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [bio, setBio] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
       // Add functionality to upload file / pfp
    };

    useEffect(() => {
        // Fetch session user
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data.username);
                    setCurrentUserId(data.user_id);
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

    useEffect(() => {
        // Fetch user profile data
        const fetchProfileData = async () => {
            if (!currentUser) return;
            try {
                const response = await fetch(`http://127.0.0.1:5000/users/${currentUser}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setBio(data.bio || '');
                    setProfilePicture(data.profile_pic);
                } else {
                    setErrorMessage('Failed to load profile data');
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setErrorMessage("Error fetching profile data");
            }
        };
        fetchProfileData();
    }, [currentUser]);

    const handleSave = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:5000/users/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bio: bio }),
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Bio updated successfully!');
            } else {
                console.error('Failed to update bio.');
            }
        } catch (error) {
            console.error('Error saving bio:', error);
            console.log('An error occurred while saving your bio.');
        }
    };

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
                    <form className="edit-profile-form">
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
                            <button type="submit" className="save-button" onClick={handleSave}>
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