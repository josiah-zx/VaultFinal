import React, { useEffect, useState } from 'react';
import './PostFeed.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import { FaRegSquarePlus } from "react-icons/fa6";
import { HiDotsHorizontal } from "react-icons/hi";
import AddPostPopup from '../AddPostPopup/AddPostPopup';
import CommentPopup from '../CommentPopUp/CommentPopUp';
import PostModal from '../PostModal/PostModal';
import TimeCapsule from '../TimeCapsule/TimeCapsule';
import { useNavigate } from 'react-router-dom';


const PostFeed = ({ username }) => {
    const navigate = useNavigate();
    const [likeStatus, setLikeStatus] = useState({});
    const [commentsMap, setCommentsMap] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [showTimeCapsulePopup, setShowTimeCapsulePopup] = useState(false);
    const [showAddPostPopup, setShowAddPostPopup] = useState(false);
    const [currentCapsule, setCurrentCapsule] = useState('');
    const [availableCapsules, setAvailableCapsules] = useState([]);
    const [capsulePosts, setCapsulePosts] = useState({});
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [currentPostData, setCurrentPostData] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/likes", {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    const likesMap = data.reduce((acc, { capsule_id, is_liked, like_count }) => {
                        acc[capsule_id] = { isLiked: is_liked, likes: like_count };
                        return acc;
                    }, {});
                    setLikeStatus(likesMap);
                } else {
                    console.error("Failed to fetch like status:", await response.json());
                }
            } catch (error) {
                console.error("Error fetching like status:", error);
            }
        };

        fetchLikeStatus();
    }, []);

    useEffect(() => {
        const fetchAvailableCapsules = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/available-capsules');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableCapsules(data);

                    const capsuleIds = data.map(capsule => capsule.capsule_id);
                    const commentsResponse = await Promise.all(
                        capsuleIds.map(id => fetch(`http://127.0.0.1:5000/comments?capsule_id=${id}`))
                    );
                    const commentsData = await Promise.all(commentsResponse.map(res => res.json()));
                    const commentsMap = commentsData.reduce((acc, comments, index) => {
                        acc[capsuleIds[index]] = comments;
                        return acc;
                    }, {});
                    setCommentsMap(commentsMap);
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
    }, []);


    useEffect(() => {
        const fetchBookmarkedCapsules = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/bookmarked-capsules', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    const bookmarks = data.reduce((acc, capsule) => {
                        acc[capsule.capsule_id] = true;
                        return acc;
                    }, {});
                    setBookmarkedPosts(bookmarks);
                } else {
                    console.error("Failed to fetch bookmarked capsules:", await response.json());
                }
            } catch (error) {
                console.error("Error fetching bookmarked capsules:", error);
            }
        };

        fetchBookmarkedCapsules();
    }, []);

    useEffect(() => {
        availableCapsules.forEach(capsule => {
            if (capsule.is_open && !capsulePosts[capsule.capsule_id]) {
                fetchPosts(capsule.capsule_id);
            }
        });
    }, [availableCapsules, capsulePosts]);

    const fetchPosts = async (capsuleId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/capsules/${capsuleId}/posts`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setCapsulePosts(prevState => ({
                    ...prevState,
                    [capsuleId]: data,
                }));
            } else {
                console.error('Failed to fetch posts:', await response.json());
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

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

    const handleLike = async (capsuleId) => {
        const isLiked = likeStatus[capsuleId]?.isLiked || false;

        // Optimistically update UI
        setLikeStatus((prevStatus) => ({
            ...prevStatus,
            [capsuleId]: {
                isLiked: !isLiked,
                likes: isLiked
                    ? (prevStatus[capsuleId]?.likes || 1) - 1
                    : (prevStatus[capsuleId]?.likes || 0) + 1,
            },
        }));

        try {
            const response = await fetch("http://127.0.0.1:5000/like", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ capsule_id: capsuleId, like: !isLiked }),
            });

            if (!response.ok) {
                console.error("Failed to update like status:", await response.json());

                // Revert optimistic UI update if API fails
                setLikeStatus((prevStatus) => ({
                    ...prevStatus,
                    [capsuleId]: {
                        isLiked: isLiked,
                        likes: isLiked
                            ? (prevStatus[capsuleId]?.likes || 0) + 1
                            : (prevStatus[capsuleId]?.likes || 1) - 1,
                    },
                }));
            }
        } catch (error) {
            console.error("Error updating like status:", error);

            // Revert optimistic UI update if an error occurs
            setLikeStatus((prevStatus) => ({
                ...prevStatus,
                [capsuleId]: {
                    isLiked: isLiked,
                    likes: isLiked
                        ? (prevStatus[capsuleId]?.likes || 0) + 1
                        : (prevStatus[capsuleId]?.likes || 1) - 1,
                },
            }));
        }
    };

    const handleBookmark = async (capsuleId) => {
        // Optimistically toggle the bookmark state
        setBookmarkedPosts((prevBookmarks) => ({
            ...prevBookmarks,
            [capsuleId]: !prevBookmarks[capsuleId],
        }));

        try {
            const response = await fetch('http://127.0.0.1:5000/bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ capsule_id: capsuleId }), 
            });

            if (!response.ok) {
                console.error("Failed to toggle bookmark:", await response.json());
                // Revert state if API call fails
                setBookmarkedPosts((prevBookmarks) => ({
                    ...prevBookmarks,
                    [capsuleId]: !prevBookmarks[capsuleId],
                }));
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            // Revert state if an error occurs
            setBookmarkedPosts((prevBookmarks) => ({
                ...prevBookmarks,
                [capsuleId]: !prevBookmarks[capsuleId], 
            }));
        }
    };

    const handleOpenCommentPopup = (capsuleId, image) => {
        setCurrentCapsule(capsuleId); 
        setUploadedImageUrl(image); 
        setShowCommentPopup(true); 
        fetchComments(capsuleId); 
    };

    const handleCloseCommentPopup = () => {
        setShowCommentPopup(false);
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
    };

    const handleOpenPostModal = (data, type) => {
        setIsPostModalOpen(true);
        setCurrentPostData(data);
        setSelectedType(type);
        document.body.style.overflow = "hidden";
    }

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
        setCurrentPostData([]);
        setSelectedType('');
        document.body.style.overflow = "auto";
    }

    const handleOpenMoreModal = (data, type) => {
        setIsMoreModalOpen(true);
        setCurrentPostData(data);
        setSelectedType(type);
        document.body.style.overflow = "hidden";
    }

    const handleCloseMoreModal = () => {
        setIsMoreModalOpen(false);
        setCurrentPostData([]);
        setSelectedType('');
        document.body.style.overflow = "auto";
    }

    //Test
    const handleDeleteCapsule = async (data, type) => {
        try {
            if (type === 'capsule') {
                const response = await fetch('http://127.0.0.1:5000/delete-post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ capsule_id: data.capsule_id }), 
                });

                if (response.ok) {
                    setSuccessMessage('Capsule deleted successfully.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    setErrorMessage('Failed to delete capsule.');
                }
            }
        } catch (error) {
            console.error("Error deleting capsule and its posts:", error);
        }
    }

    const formatToEST = (gmtDateString) => {
        const date = new Date(gmtDateString);
    
        const options = {
          timeZone: "America/New_York",
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        };
    
        return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    return (
        <div>
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
                                                <img
                                                    src={capsule.profile_pic || '/profile-pic.png'} 
                                                    alt="Profile Picture"
                                                    className="post-profile-pic"
                                                    onClick={() => navigate(`/${capsule.username}`)}
                                                />
                                                <span className="post-username" onClick={() => navigate(`/${capsule.username}`)}>{capsule.username || errorMessage}</span>
                                                {capsule.username === username && (
                                                    <HiDotsHorizontal className="more-btn" onClick={() => handleDeleteCapsule(capsule, 'capsule')}/>
                                                )}
                                            </div>
                                            <div className="capsule-contents">
                                                <div className="capsule-image">
                                                    <img 
                                                        src={capsule.image_url} 
                                                        alt="Capsule photo" 
                                                        className="capsule-photo"
                                                        onClick={() => handleOpenPostModal(capsule, 'capsule')}
                                                    />
                                                </div>
                                                <div className="capsule-posts">
                                                    {capsulePosts[capsule.capsule_id]?.map((post, index) => {
                                                        const totalPosts = capsulePosts[capsule.capsule_id]?.length || 1;
                                                        const layer = Math.floor(index / 8); // Calculate which layer the post belongs to
                                                        const angle = (360 / totalPosts) * index; // Evenly distribute posts around the circle

                                                        return (
                                                            <div
                                                            key={post.id}
                                                            className="post-bubble"
                                                            style={{
                                                                transform: `rotate(${angle}deg) translate(${150 + layer * 80}px) rotate(-${angle}deg)` // Increase radius for each layer
                                                            }}
                                                            >
                                                            <img 
                                                                src={post.image_url} 
                                                                alt={`Post ${index}`} 
                                                                className="photo-circle" 
                                                                onClick={() => handleOpenPostModal(post, 'post')}
                                                            />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="capsule-info">
                                                <p className="caption">
                                                    <strong className="post-username" onClick={() => navigate(`/${capsule.username}`)}>
                                                        {capsule.username || errorMessage}</strong> {capsule.content}
                                                </p>
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
                                                        {bookmarkedPosts[capsule.capsule_id] ? (
                                                            <FaBookmark className="icon" style={{ color: "gold" }} />
                                                        ) : (
                                                            <FaRegBookmark className="icon" />
                                                        )}
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
                                                    src={capsule.profile_pic || '/profile-pic.png'} 
                                                    alt="Profile Picture"
                                                    className="post-profile-pic"
                                                />
                                                <span className="username">{capsule.username || errorMessage}</span>
                                                <span className="open-time">Opens: {formatToEST(capsule.open_at)}</span>
                                                {capsule.username === username && (
                                                    <HiDotsHorizontal className="more-btn" onClick={() => handleDeleteCapsule(capsule, 'capsule')}/>
                                                )}
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
                                                            <FaBookmark className="icon" style={{ color: "gold" }} /> :
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
                                type: 'capsule',
                                capsule_id: currentCapsule, 
                                image: uploadedImageUrl || '/time-stopwatch-sand.jpg',
                                caption: 'Caption goes here.'
                            }}
                            onClose={handleCloseCommentPopup}
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
            <div className="modal">
                {isPostModalOpen && (
                    <PostModal
                        closeModal={handleClosePostModal}
                        post={currentPostData}
                        type={selectedType}
                    />
                )}
            </div>
        </div>
    );
};

export default PostFeed;
