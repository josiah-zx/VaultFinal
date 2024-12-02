import React, { useEffect } from 'react';
import './PostModal.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import CommentPopup from '../CommentPopUp/CommentPopUp';


const PostModal = ({ closeModal, post, type }) => {
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
                                <span>0 likes</span>
                                <span>0 comments</span>
                            </div>
                            <div className="capsule-actions">
                                <span className="like-icon">
                                    <FaHeart className="icon"/>
                                </span>
                                <span className="comment-icon">
                                    <FaRegComment className="icon"/>
                                </span>
                                <span className="bookmark-icon">
                                    <FaBookmark className="icon"/>
                                </span>
                                <span className="share-icon">
                                    <FaRegPaperPlane className="icon"/>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="modal-close-btn" onClick={closeModal}>X</button>
            </div>
        </div>
    );
};

export default PostModal;
