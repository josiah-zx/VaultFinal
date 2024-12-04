import React, { useEffect, useState } from 'react';
import './PostModal.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import CommentPopup from '../CommentPopUp/CommentPopUp';
import { useNavigate } from 'react-router-dom';


const PostModal = ({ closeModal, post, type }) => {
    const [likeStatus, setLikeStatus] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [bookmarkStatus, setBookmarkStatus] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                if (type === 'capsule') {
                    const response = await fetch(`http://127.0.0.1:5000/post-data?capsule_id=${post.capsule_id}`, {
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setLikeStatus(data.like_status);
                        setLikeCount(data.like_count);
                        setCommentCount(data.comment_count);
                        setBookmarkStatus(data.bookmark_status);
                    } else {
                        setErrorMessage('Failed to load post data');
                    }
                }
                if (type === 'post') {
                    const response = await fetch(`http://127.0.0.1:5000/post-data?post_id=${post.post_id}`, {
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setLikeStatus(data.like_status);
                        setLikeCount(data.like_count);
                        setCommentCount(data.comment_count);
                        setBookmarkStatus(data.bookmark_status);
                    } else {
                        setErrorMessage('Failed to load post data');
                    }
                }
            } catch (error) {
                console.error("Error fetching post data:", error);
                setErrorMessage("Error fetching post data");
            }
        };
        fetchPostData();
    }, []);

    const handleLike = async () => {
        try {
            if (type === 'capsule') {
                const response = await fetch("http://127.0.0.1:5000/like", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ capsule_id: post.capsule_id }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.is_liked) {
                        setLikeCount(likeCount + 1);
                    } else {
                        setLikeCount(likeCount - 1);
                    }
                    setLikeStatus(!likeStatus);
                } else {
                    console.error("Failed to update like status:", await response.json());
                }
            }
            if (type === 'post') {
                const response = await fetch("http://127.0.0.1:5000/like", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ post_id: post.post_id }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.is_liked) {
                        setLikeCount(likeCount + 1);
                    } else {
                        setLikeCount(likeCount - 1);
                    }
                    setLikeStatus(!likeStatus);
                } else {
                    console.error("Failed to update like status:", await response.json());
                }
            }
        } catch (error) {
            console.error("Error updating like status:", error);
        }
    }

    const handleBookmark = async () => {
        try {
            if (type === 'capsule') {
                const response = await fetch("http://127.0.0.1:5000/bookmark", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ capsule_id: post.capsule_id }),
                });

                if (response.ok) {
                    setBookmarkStatus(!bookmarkStatus);
                } else {
                    console.error("Failed to update bookmark status:", await response.json());
                }
            }
            if (type === 'post') {
                const response = await fetch("http://127.0.0.1:5000/bookmark", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ post_id: post.post_id }),
                });

                if (response.ok) {
                    setBookmarkStatus(!bookmarkStatus);
                } else {
                    console.error("Failed to update bookmark status:", await response.json());
                }
            }
        } catch (error) {
            console.error("Error updating bookmark status:", error);
        }
    }

    const handleOpenCommentPopup = () => {
        setShowCommentPopup(true);  
    };

    const handleCloseCommentPopup = () => {
        setShowCommentPopup(false);
    }

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="feed-container" onClick={(e) => e.stopPropagation()}>
                <div className="feed">
                    <div className="capsule-card">
                        <div className="capsule-header">
                            <img
                                src={post.profile_pic || '/profile-pic.png'} 
                                alt="Profile Picture"
                                className="post-profile-pic"
                                onClick={() => navigate(`/${post.username}`)}
                            />
                            <span className="post-username" onClick={() => navigate(`/${post.username}`)}>{post.username}</span>
                        </div>
                        <img src={post.image_url} alt="Modal photo" className="modal-photo"/>
                        <div className="capsule-info">
                            <p className="caption">
                                <strong className="post-username" onClick={() => navigate(`/${post.username}`)}>
                                    {post.username}</strong> {post.content}
                            </p>
                            <div className="capsule-stats">
                                <span>{likeCount} likes</span>
                                <span>{commentCount} comments</span>
                            </div>
                            <div className="capsule-actions">
                                <span className="like-icon" onClick={() => handleLike()}>
                                    {likeStatus ?
                                        <FaHeart className="icon filled" style={{color: "red"}}/> :
                                        <FaRegHeart className="icon"/>}
                                </span>
                                <span className="comment-icon" onClick={() => handleOpenCommentPopup()}>
                                    <FaRegComment className="icon"/>
                                </span>
                                <span className="bookmark-icon" onClick={() => handleBookmark()}>
                                    {bookmarkStatus ? (
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
                </div>
                <button className="modal-close-btn" onClick={closeModal}>X</button>
                {showCommentPopup && type === 'capsule' && (
                    <CommentPopup
                        capsuleContent={{
                            type: type,
                            capsule_id: post.capsule_id, 
                            image: post.image_url,
                            caption: post.content
                        }}
                        onClose={handleCloseCommentPopup}
                    />
                )}
                {showCommentPopup && type === 'post'&& (
                    <CommentPopup
                        capsuleContent={{
                            type: type,
                            post_id: post.post_id, 
                            image: post.image_url,
                            caption: post.content
                        }}
                        onClose={handleCloseCommentPopup}
                    />
                )}
            </div>
        </div>
    );
};

export default PostModal;
