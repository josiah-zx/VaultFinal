import React, { useEffect, useState } from 'react';
import './PostFeed.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import { FaRegSquarePlus } from "react-icons/fa6";
import AddPostPopup from '../AddPostPopup/AddPostPopup';
import CommentPopup from '../CommentPopUp/CommentPopUp';
import TimeCapsule from '../TimeCapsule/TimeCapsule';
import { useNavigate } from 'react-router-dom';


const PostFeed = () => {
    const navigate = useNavigate();
    const [likeStatus, setLikeStatus] = useState({});
    const [commentsMap, setCommentsMap] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [showTimeCapsulePopup, setShowTimeCapsulePopup] = useState(false);
    const [showAddPostPopup, setShowAddPostPopup] = useState(false);
    const [currentCapsule, setCurrentCapsule] = useState('');
    const [availableCapsules, setAvailableCapsules] = useState([]);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    useEffect(() => {
        const fetchAvailableCapsules = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/available-capsules');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableCapsules(data);
                } else {
                    setErrorMessage("Failed to load available capsules.");
                }
            } catch (error) {
                console.error("Error fetching available capsules:", error);
            }
        };

        fetchAvailableCapsules();
        const interval = setInterval(fetchAvailableCapsules, 60000);

        return () => clearInterval(interval);
    }, [])

    const fetchComments = async (capsuleId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/comments?capsule_id=${capsuleId}`);
            if (response.ok) {
                const data = await response.json();
                setCommentsMap((prev) => ({
                    ...prev,
                    [capsuleId]: data, // Map comments to the capsule ID
                }));
            } else {
                console.error("Failed to fetch comments:", await response.json());
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleLike = (capsuleId) => {
        setLikeStatus((prevStatus) => {
            const currentStatus = prevStatus[capsuleId] || { isLiked: false, likes: 0 };
            const newStatus = {
                isLiked: !currentStatus.isLiked,
                likes: currentStatus.isLiked ? currentStatus.likes - 1 : currentStatus.likes + 1,
            };
            return { ...prevStatus, [capsuleId]: newStatus };
        });
    };

    const handleBookmark = (capsuleId) => {
    setBookmarkedPosts((prevBookmarks) => ({
        ...prevBookmarks,
        [capsuleId]: !prevBookmarks[capsuleId],
    }));
};

     const handleOpenCommentPopup = (capsuleId, image) => {
        setCurrentCapsule(capsuleId); // Set capsule ID
        setUploadedImageUrl(image); // Set image for the popup
        setShowCommentPopup(true); // Show popup
        fetchComments(capsuleId); // Fetch comments for the capsule
    };

    const handleCloseCommentPopup = () => {
        setShowCommentPopup(false);
    };

     const handleSendComment = async (newComment) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Send session cookie
                body: JSON.stringify({
                    capsule_id: currentCapsule,
                    text: newComment,
                }),
            });

            if (response.ok) {
                const savedComment = await response.json();
                setCommentsMap((prev) => ({
                    ...prev,
                    [currentCapsule]: [...(prev[currentCapsule] || []), savedComment], // Append comment to capsule's comments
                }));
            } else {
                console.error("Failed to send comment:", await response.json());
            }
        } catch (error) {
            console.error("Error sending comment:", error);
        }
    };
    const handleOpenTimeCapsulePopup = () => {
        setShowTimeCapsulePopup(true);
    };

    const handleCloseTimeCapsulePopup = () => {
        setShowTimeCapsulePopup(false);
    };

    const handleOpenAddPostPopup = (capsuleId) => {
        setShowAddPostPopup(true);
        setCurrentCapsule(capsuleId);
    };

    const handleCloseAddPostPopup = () => {
        setShowAddPostPopup(false);
        setCurrentCapsule('');
    };

    const handleImageUpload = (imageUrl) => {
        setUploadedImageUrl(imageUrl);
        setShowTimeCapsulePopup(false);
        setShowAddPostPopup(false);
        setShowCommentPopup(true);
    };

    return (
        <div className="feed-container">
            <button onClick={() => navigate('/create-capsule')} className="create-capsule-btn">
                Create Time Capsule
            </button>

            <div className="feed">
                {availableCapsules.length > 0 ? (
                    availableCapsules.map((capsule) => {
                        const capsuleStatus = likeStatus[capsule.capsule_id] || {isLiked: false, likes: 0};
                        return (
                            <div key={capsule.capsule_id} className="capsule-card">
                                {capsule.is_open ? (
                                    <div className="open-capsule">
                                        <div className="capsule-header">
                                            <img src="/profile-pic.png" alt="Profile Picture" className="profile-pic"/>
                                            <span className="username">{capsule.username || errorMessage}</span>
                                        </div>
                                        <img src={capsule.image_url} alt="Capsule content" className="image-content"/>
                                        <div className="capsule-info">
                                            <p className="caption">
                                                <strong>{capsule.username || errorMessage}</strong> {capsule.content}</p>
                                            <div className="capsule-stats">
                                                <span>{capsuleStatus.likes} likes</span>
                                                <span>{(commentsMap[capsule.capsule_id]?.length || 0)} comments</span>
                                            </div>
                                            <div className="capsule-actions">
                                                <span className="like-icon" onClick={() => handleLike(capsule.capsule_id)}>
                                                    {capsuleStatus.isLiked ?
                                                        <FaHeart className="icon filled" style={{color: "red"}}/> :
                                                        <FaRegHeart className="icon"/>}
                                                </span>
                                                <span className="comment-icon"
                                                    onClick={() => handleOpenCommentPopup(capsule.capsule_id, capsule.image_url)}>
                                                    <FaRegComment className="icon"/>
                                                </span>
                                                 <span className="bookmark-icon" onClick={() => handleBookmark(capsule.capsule_id)}>
                                                    {/* trying new bookmark tracking - jd */}
                                                    {bookmarkedPosts[capsule.capsule_id] ?
                                                        <FaBookmark className="icon" style={{ color: "white" }} /> :
                                                        <FaRegBookmark className="icon" />}
                                                </span>
                                                <span className="share-icon">
                                                    <FaRegPaperPlane className="icon"/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="closed-capsule">
                                        <div className="capsule-header">
                                                <img
                                                    src={capsule.profile_pic || '/profile-pic.png'} // Use the profile picture from data or fallback
                                                    alt="Profile Picture"
                                                    className="profile-pic"
                                                />
                                            <span className="username">{capsule.username || errorMessage}</span>
                                            <span className="open-time">Opens: {capsule.open_at}</span>
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
                                        <div className="capsule-info">
                                            <p className="caption">
                                                <strong>{capsule.username || errorMessage}</strong> {capsule.content}</p>
                                            <div className="capsule-stats">
                                                <span>{capsuleStatus.likes} likes</span>
                                                <span>0 contributors</span>
                                            </div>
                                            <div className="capsule-actions">
                                                <span className="like-icon" onClick={() => handleLike(capsule.capsule_id)}>
                                                    {capsuleStatus.isLiked ?
                                                        <FaHeart className="icon filled" style={{color: "red"}}/> :
                                                        <FaRegHeart className="icon"/>}
                                                </span>
                                                <span className="add-capsule-icon" onClick={() => handleOpenAddPostPopup(capsule.capsule_id)}>
                                                    <FaRegSquarePlus className="icon"/>
                                                </span>
                                                 <span className="bookmark-icon" onClick={() => handleBookmark(capsule.capsule_id)}>
                                                    {bookmarkedPosts[capsule.capsule_id] ?
                                                        <FaBookmark className="icon" style={{ color: "white" }} /> :
                                                        <FaRegBookmark className="icon" />}
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
                    <div className="no-capsules">
                        <p>No time capsules available to open yet. Check back later or create a new one!</p>
                    </div>
                )}
                {showCommentPopup && (
                    <CommentPopup
                        capsuleContent={{
                            capsule_id: currentCapsule, 
                            username: username || errorMessage,
                            image: uploadedImageUrl || '/time-stopwatch-sand.jpg',
                            caption: 'Caption goes here.'
                        }}
                        comments={commentsMap[currentCapsule] || []} 
                        onClose={handleCloseCommentPopup}
                        onSendComment={handleSendComment}
                    />
                )}
                {showAddPostPopup && (
                    <AddPostPopup 
                        capsuleId={currentCapsule} 
                        onClose={handleCloseAddPostPopup} 
                        onImageUpload={handleImageUpload}
                    />
                )}
            </div>


            {showTimeCapsulePopup && (
                <TimeCapsule onClose={handleCloseTimeCapsulePopup} onImageUpload={handleImageUpload}/>
            )}
        </div>
    );
};

export default PostFeed;
