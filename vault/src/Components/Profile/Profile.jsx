import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';
import Navbar from '../HomeHeader/HomeHeader';
import { FaUserCircle } from "react-icons/fa";
import { BsGrid3X3 } from "react-icons/bs";
import { IoIosStarOutline } from "react-icons/io";

const Profile = () => {
    const { profileUsername } = useParams();
    const [currentUser, setCurrentUser] = useState('');
    const [capsuleCount, setCapsuleCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [bio, setBio] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedTab, setSelectedTab] = useState('capsules');
    const [capsulePosts, setCapsulePosts] = useState([]);
    const [regularPosts, setRegularPosts] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const navigate = useNavigate();

    // Fetch session user
    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session-user`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data.username);
                } else {
                    setErrorMessage('Failed to load user info');
                    navigate('/login');
                }
            } catch (error) {
                console.error("Failed to fetch session user:", error);
                setErrorMessage('An error occurred while fetching user data.');
            }
        };
        fetchSessionUser();
    }, []);

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!profileUsername) return;
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${profileUsername}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCapsuleCount(data.capsule_count);
                    setPostCount(data.post_count);
                    setFollowerCount(data.follower_count);
                    setFollowingCount(data.following_count);
                    setBio(data.bio);
                    setIsFollowing(data.is_following);
    
                    // Set the profile picture
                    if (data.profile_pic) {
                        const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${data.profile_pic}?t=${new Date().getTime()}`;
                        setProfilePicture(imageUrl);
                    } else {
                        setProfilePicture(null);
                    }
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

    // Fetch time capsules for session user
    useEffect(() => {
        const fetchUserCapsules = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/capsules/${profileUsername}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCapsulePosts(data);
                } else {
                    console.error("Failed to load capsules");
                }
            } catch (error) {
                console.error("Error fetching capsules:", error);
            }
        };
        fetchUserCapsules();
    }, [profileUsername]);

    // Fetch posts for profile user
    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/posts/${profileUsername}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setRegularPosts(data);
                } else {
                    console.error("Failed to load regular posts");
                }
            } catch (error) {
                console.error("Error fetching regular posts:", error);
            }
        };        
        fetchUserPosts();
    }, [profileUsername]);

    useEffect(() => {
        const fetchBookmarkedPosts = async () => {
            if (selectedTab !== 'favorites') return;

            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/bookmarked-items`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setBookmarkedPosts(data); 
                } else {
                    console.error("Failed to fetch bookmarked posts:", await response.json());
                }
            } catch (error) {
                console.error("Error fetching bookmarked posts:", error);
            }
        };

        fetchBookmarkedPosts();
    }, [selectedTab]);
    const toggleFollow = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/follow/${profileUsername}`, {
                method: isFollowing ? 'DELETE' : 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setIsFollowing(!isFollowing);
                if (!isFollowing) {
                    setFollowerCount(followerCount + 1);
                } else {
                    setFollowerCount(followerCount - 1);
                }
            } else {
                console.error("Failed to update follow status");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
    };

    return (
        <div>
            <Navbar username={currentUser}/>
            <div className={selectedTab === "capsules" ? "capsule-profile" : "post-profile"}>
                <div className="profile-avatar">
                    {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="profile-picture" />
                    ) : (
                        <FaUserCircle className="profile-picture-placeholder"/>
                    )}
                </div>
                <div className="profile-info">
                    <h2>{profileUsername || errorMessage}</h2>
                    <div className="profile-stats">
                        <span>{capsuleCount} capsules</span>
                        <span>{postCount} posts</span>
                        <span>{followerCount} followers</span>
                        <span>{followingCount} following</span>
                    </div>
                    <p>{bio}</p>
                    {currentUser === profileUsername ? (
                        <button className="edit-profile-button" onClick={() => navigate('/edit-profile')}>
                            Edit Profile
                        </button>
                    ) : (
                        <button className="follow-button" onClick={toggleFollow}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="profile-tab-navbar">
                    <button
                        className={selectedTab === "capsules" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("capsules")}
                    >
                        <img src="capsule.png" className="capsule-icon" alt="Capsules" width="24" height="24" />
                    </button>
                    <button
                        className={selectedTab === "posts" ? "active-profile-tab" : ""}
                        onClick={() => handleTabClick("posts")}
                    >
                        <BsGrid3X3 size={22}/>
                    </button>
                    {currentUser === profileUsername && (
                        <button
                            className={selectedTab === "favorites" ? "active-profile-tab" : ""}
                            onClick={() => handleTabClick("favorites")}
                        >
                            <IoIosStarOutline size={30}/>
                        </button>
                    )}
                </div>

                <div className="profile-content">
                    {selectedTab === "capsules" && (
                        <div className="capsules-tab">
                            <h3>Capsules Content</h3>
                            <div className="capsules-tab profile-capsule-content">
                                {capsulePosts.length > 0 && (
                                    capsulePosts.map((post) => (
                                        <div key={post.post_id} className="profile-capsule-post">
                                            <img src={post.image_url} alt="Capsule content" className="profile-capsule-image" />
                                            <p>{post.content}</p>
                                        </div>
                                )))}
                            </div>
                            {capsulePosts.length === 0 && (
                                <p className="empty-tab-text">No capsules available to open yet.</p>
                            )}
                        </div>
                    )}

                    {selectedTab === "posts" && (
                        <div className="posts-tab">
                            <h3>Posts Content</h3>
                            <div className="posts-tab profile-post-content">
                                {regularPosts.length > 0 && (
                                    regularPosts.map((post) => (
                                        <div key={post.post_id} className="profile-post">
                                            <img src={post.image_url} alt="Post content" className="profile-post-image" />
                                            <p>{post.content}</p>
                                        </div>
                                )))}
                            </div>
                            {regularPosts.length === 0 && (
                                <p className="empty-tab-text">No posts available.</p>
                            )}
                        </div>
                    )}

                    {selectedTab === "favorites" && (
                        <div className="favorites-tab">
                            <h3>Bookmarked Content</h3>
                            <div className="favorites-tab profile-favorites-content">
                                {bookmarkedPosts.length > 0 && (
                                    bookmarkedPosts.map((bookmark) => (
                                        <div key={bookmark.capsule_id} className="profile-favorite-post"> 
                                            <img
                                                src={bookmark.image_url} 
                                                alt="Favorite content"
                                                className="profile-favorite-image" 
                                            />
                                            <p>{bookmark.content}</p> 
                                        </div>
                                )))}
                            </div>
                            {bookmarkedPosts.length === 0 && (
                                <p className="empty-tab-text">No bookmarked capsules available.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;