import React, { useEffect, useState } from 'react';
import './PostFeed.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import CommentPopup from '../CommentPopUp/CommentPopUp';

const PostFeed = () => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);  // Popup state

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
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

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    // Show popup when comment icon is clicked
    const handleCommentClick = () => {
        setShowPopup(true);
    };

    // Close popup
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="feed">
            <div className="post-card">
                <div className="post-header">
                    <img src="/profile-pic.png" alt="Profile Picture" className="profile-pic" />
                    <span className="username">{username || errorMessage}</span>
                </div>
                <img src="/vault_count_1.jpeg" alt="Post content" className="post-content" />
                <div className="post-info">
                    <p className="caption"><strong>{username || errorMessage}</strong> Caption goes here.</p>
                    <div className="post-stats">
                        <span>{likes} likes</span>
                        <span>{comments.length} comments</span>
                    </div>
                    <div className="post-actions">
                        <span className="like-icon" onClick={handleLike}>
                            {isLiked ? <FaHeart className="icon filled" style={{ color: "red" }} /> : <FaRegHeart className="icon" />}
                        </span>
                        <span className="comment-icon" onClick={handleCommentClick}>
                            <FaRegComment className="icon" />
                        </span>
                        <span className="bookmark-icon" onClick={handleBookmark}>
                            {isBookmarked ? <FaBookmark className="icon" style={{ color: "black" }} /> : <FaRegBookmark className="icon" />}
                        </span>
                        <span className="share-icon">
                            <FaRegPaperPlane className="icon" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Popup for comments */}
            {showPopup && (
                <CommentPopup
                    postContent={{
                        username: username || errorMessage,
                        image: '/time-stopwatch-sand.jpg',
                        caption: 'Caption goes here.'
                    }}
                    comments={comments}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};

export default PostFeed;
