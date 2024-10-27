// PostFeed.jsx
import React, { useEffect, useState } from 'react';
import './PostFeed.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import CommentPopup from '../CommentPopUp/CommentPopUp';
import TimeCapsulePopup from '../TimeCapsulePopup/TimeCapsulePopup';

const PostFeed = () => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [showTimeCapsulePopup, setShowTimeCapsulePopup] = useState(false);
    const [availablePosts, setAvailablePosts] = useState([]);  // State to hold available posts
    const [uploadedImageUrl, setUploadedImageUrl] = useState(''); // For new image in CommentPopup

    useEffect(() => {
        const fetchAvailablePosts = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/available-posts');
                if (response.ok) {
                    const data = await response.json();
                    setAvailablePosts(data);
                } else {
                    setErrorMessage("Failed to load available posts.");
                }
            } catch (error) {
                console.error("Error fetching available posts:", error);
            }
        };

        fetchAvailablePosts();
        const interval = setInterval(fetchAvailablePosts, 60000);  // Check every minute

        return () => clearInterval(interval);  // Clear interval on component unmount
    }, []);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleCommentClick = (image) => {
        setUploadedImageUrl(image);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleOpenTimeCapsulePopup = () => {
        setShowTimeCapsulePopup(true);
    };

    const handleCloseTimeCapsulePopup = () => {
        setShowTimeCapsulePopup(false);
    };

    const handleImageUpload = (imageUrl) => {
        setUploadedImageUrl(imageUrl);
        setShowTimeCapsulePopup(false);
        setShowPopup(true); // Automatically open the comment popup with the uploaded image
    };

    return (
        <div className="feed-container">
            <div className="feed">
                {availablePosts.length > 0 ? (
                    availablePosts.map((post) => (
                        <div key={post.post_id} className="post-card">
                            <div className="post-header">
                                <img src="/profile-pic.png" alt="Profile Picture" className="profile-pic" />
                                <span className="username">{post.username || errorMessage}</span>
                            </div>
                            <img src={post.image_url} alt="Post content" className="post-content" />
                            <div className="post-info">
                                <p className="caption"><strong>{post.username || errorMessage}</strong> {post.content}</p>
                                <div className="post-stats">
                                    <span>{likes} likes</span>
                                    <span>{comments.length} comments</span>
                                </div>
                                <div className="post-actions">
                                    <span className="like-icon" onClick={handleLike}>
                                        {isLiked ? <FaHeart className="icon filled" style={{ color: "red" }} /> : <FaRegHeart className="icon" />}
                                    </span>
                                    <span className="comment-icon" onClick={() => handleCommentClick(post.image_url)}>
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
                    ))
                ) : (
                    <div className="no-posts">
                        <p>No time capsules available to open yet. Check back later or create a new one!</p>
                    </div>
                )}

                {/* Popup for comments */}
                {showPopup && (
                    <CommentPopup
                        postContent={{
                            username: username || errorMessage,
                            image: uploadedImageUrl || '/time-stopwatch-sand.jpg', // Show uploaded image or placeholder
                            caption: 'Caption goes here.'
                        }}
                        comments={comments}
                        onClose={handleClosePopup}
                    />
                )}
            </div>

            <button onClick={handleOpenTimeCapsulePopup} className="create-capsule-btn">Create Time Capsule</button>

            {/* Popup for time capsule creation */}
            {showTimeCapsulePopup && (
                <TimeCapsulePopup onClose={handleCloseTimeCapsulePopup} onImageUpload={handleImageUpload} />
            )}
        </div>
    );
};

export default PostFeed;
