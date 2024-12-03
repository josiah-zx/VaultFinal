import React, { useEffect, useState } from 'react';
import './PostModal.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import CommentPopup from '../CommentPopUp/CommentPopUp';


const PostModal = ({ closeModal, post, type, handleSendComment }) => {
    const [likeStatus, setLikeStatus] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [bookmarkStatus, setBookmarkStatus] = useState(false);
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCommentPopup, setShowCommentPopup] = useState(false);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                if (type === 'post') {
                    const response = await fetch(`http://127.0.0.1:5000/post-data/${post.post_id}`, {
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
                if (type === 'capsule') {
                    const response = await fetch(`http://127.0.0.1:5000/capsule-data/${post.capsule_id}`, {
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setLikeStatus(data.like_status);
                        setLikeCount(data.like_count);
                        setCommentCount(data.comment_count);
                        setBookmarkStatus(data.bookmark_status);
                    } else {
                        setErrorMessage('Failed to load capsule data');
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

    // const fetchComments = async () => {
    //     try {
    //         if (type === 'capsule') {
    //             const response = await fetch('http://127.0.0.1:5000/comments', {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     capsule_id: post.capsule_id
    //                 }),
    //                 credentials: 'include'
    //             });
    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setComments(data);
    //             } else {
    //                 console.error("Failed to fetch comments:", await response.json());
    //             }
    //         } 
    //         if (type === 'post') {
    //             const response = await fetch('http://127.0.0.1:5000/comments', {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     post_id: post.post_id
    //                 }),
    //                 credentials: 'include'
    //             });
    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setComments(data);
    //             } else {
    //                 console.error("Failed to fetch comments:", await response.json());
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error fetching comments:", error);
    //     }
    // }

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
                                className="profile-pic"
                            />
                            <span className="username">{post.username}</span>
                        </div>
                        <img src={post.image_url} alt="Modal photo" className="modal-photo"/>
                        <div className="capsule-info">
                            <p className="caption">
                                <strong>{post.username}</strong> {post.content}</p>
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
                                <span className="comment-icon"
                                    onClick={() => handleOpenCommentPopup}>
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
                {showCommentPopup && type === 'capsule' (
                    <CommentPopup
                        capsuleContent={{
                            type: 'capsule',
                            capsule_id: post.capsule_id, 
                            image: post.image_url || '/time-stopwatch-sand.jpg',
                            caption: post.content
                        }}
                        onClose={handleCloseCommentPopup}
                    />
                )}
                {showCommentPopup && type === 'post' (
                    <CommentPopup
                        capsuleContent={{
                            type: 'post',
                            capsule_id: post.post_id, 
                            image: post.image_url || '/time-stopwatch-sand.jpg',
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
