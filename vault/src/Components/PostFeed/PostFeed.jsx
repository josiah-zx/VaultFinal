import React, { useEffect, useState } from 'react';
import './PostFeed.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import { FaRegSquarePlus } from "react-icons/fa6";
import AddPostPopup from '../AddPostPopup/AddPostPopup';
import CommentPopup from '../CommentPopUp/CommentPopUp';
import TimeCapsulePopup from '../TimeCapsulePopup/TimeCapsulePopup';

const PostFeed = () => {
    const [likeStatus, setLikeStatus] = useState({});
    const [comments, setComments] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [showTimeCapsulePopup, setShowTimeCapsulePopup] = useState(false);
    const [showAddPostPopup, setShowAddPostPopup] = useState(false);
    const [currentCapsule, setCurrentCapsule] = useState('');
    const [availablePosts, setAvailablePosts] = useState([]);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

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
        const interval = setInterval(fetchAvailablePosts, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleLike = (postId) => {
        setLikeStatus((prevStatus) => {
            const currentStatus = prevStatus[postId] || { isLiked: false, likes: 0 };
            const newStatus = {
                isLiked: !currentStatus.isLiked,
                likes: currentStatus.isLiked ? currentStatus.likes - 1 : currentStatus.likes + 1,
            };
            return { ...prevStatus, [postId]: newStatus };
        });
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleOpenCommentPopup = (image) => {
        setUploadedImageUrl(image);
        setShowCommentPopup(true);
    };

    const handleCloseCommentPopup = () => {
        setShowCommentPopup(false);
    };

    const handleOpenTimeCapsulePopup = () => {
        setShowTimeCapsulePopup(true);
    };

    const handleCloseTimeCapsulePopup = () => {
        setShowTimeCapsulePopup(false);
    };

    const handleOpenAddPostPopup = (postId) => {
        setShowAddPostPopup(true);
        setCurrentCapsule(postId);
    };

    const handleCloseAddPostPopup = () => {
        setShowAddPostPopup(false);
        setCurrentCapsule('');
    };

    const handleImageUpload = (imageUrl) => {
        setUploadedImageUrl(imageUrl);
        setShowTimeCapsulePopup(false);
        setShowCommentPopup(true);
    };

    return (
        <div className="feed-container">
            <button onClick={handleOpenTimeCapsulePopup} className="create-capsule-btn">Create Time Capsule</button>
            <div className="feed">
                {availablePosts.length > 0 ? (
                    availablePosts.map((post) => {
                        const postStatus = likeStatus[post.post_id] || {isLiked: false, likes: 0};
                        return (
                            <div key={post.post_id} className="post-card">
                                {post.is_open ? (
                                    <div className="open-post">
                                        <div className="post-header">
                                            <img src="/profile-pic.png" alt="Profile Picture" className="profile-pic"/>
                                            <span className="username">{post.username || errorMessage}</span>
                                        </div>
                                        <img src={post.image_url} alt="Post content" className="post-content"/>
                                        <div className="post-info">
                                            <p className="caption">
                                                <strong>{post.username || errorMessage}</strong> {post.content}</p>
                                            <div className="post-stats">
                                                <span>{postStatus.likes} likes</span>
                                                <span>{comments.length} comments</span>
                                            </div>
                                            <div className="post-actions">
                                                <span className="like-icon" onClick={() => handleLike(post.post_id)}>
                                                    {postStatus.isLiked ?
                                                        <FaHeart className="icon filled" style={{color: "red"}}/> :
                                                        <FaRegHeart className="icon"/>}
                                                </span>
                                                <span className="comment-icon"
                                                    onClick={() => handleOpenCommentPopup(post.image_url)}>
                                                    <FaRegComment className="icon"/>
                                                </span>
                                                <span className="bookmark-icon" onClick={handleBookmark}>
                                                    {isBookmarked ? <FaBookmark className="icon" style={{color: "white"}}/> :
                                                        <FaRegBookmark className="icon"/>}
                                                </span>
                                                <span className="share-icon">
                                                    <FaRegPaperPlane className="icon"/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="closed-post">
                                        <div className="post-header">
                                            <img src="/profile-pic.png" alt="Profile Picture" className="profile-pic"/>
                                            <span className="username">{post.username || errorMessage}</span>
                                            <span className="open-time">Opens: {post.open_at}</span>
                                        </div>
                                        <div className="vault">
                                            <div className="vault-lock"></div>
                                            <div class="vault-bolts">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                        <div className="post-info">
                                            <p className="caption">
                                                <strong>{post.username || errorMessage}</strong> {post.content}</p>
                                            <div className="post-stats">
                                                <span>{postStatus.likes} likes</span>
                                                <span>0 contributors</span>
                                            </div>
                                            <div className="post-actions">
                                                <span className="like-icon" onClick={() => handleLike(post.post_id)}>
                                                    {postStatus.isLiked ?
                                                        <FaHeart className="icon filled" style={{color: "red"}}/> :
                                                        <FaRegHeart className="icon"/>}
                                                </span>
                                                <span className="add-post-icon" onClick={() => handleOpenAddPostPopup(post.post_id)}>
                                                    <FaRegSquarePlus className="icon"/>
                                                </span>
                                                <span className="bookmark-icon" onClick={handleBookmark}>
                                                    {isBookmarked ? <FaBookmark className="icon" style={{color: "white"}}/> :
                                                        <FaRegBookmark className="icon"/>}
                                                </span>
                                                <span className="share-icon">
                                                    <FaRegPaperPlane className="icon"/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="separator-line"></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-posts">
                        <p>No time capsules available to open yet. Check back later or create a new one!</p>
                    </div>
                )}
                {showCommentPopup && (
                    <CommentPopup
                        postContent={{
                            username: username || errorMessage,
                            image: uploadedImageUrl || '/time-stopwatch-sand.jpg',
                            caption: 'Caption goes here.'
                        }}
                        comments={comments}
                        onClose={handleCloseCommentPopup}
                    />
                )}
                {showAddPostPopup && (
                    <AddPostPopup 
                        postId={currentCapsule} 
                        onClose={handleCloseAddPostPopup} 
                        onImageUpload={handleImageUpload}
                    />
                )}
            </div>


            {showTimeCapsulePopup && (
                <TimeCapsulePopup onClose={handleCloseTimeCapsulePopup} onImageUpload={handleImageUpload}/>
            )}
        </div>
    );
};

export default PostFeed;
