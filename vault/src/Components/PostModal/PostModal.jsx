import React, { useEffect } from 'react';
import './PostModal.css';
import { FaRegHeart, FaHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import CommentPopup from '../CommentPopUp/CommentPopUp';


const PostModal = ({ isOpen, closeModal, data }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="feed-container" onClick={(e) => e.stopPropagation()}>
                <div className="feed">
                    <div className="capsule-card">
                        <div className="capsule-header">
                            <img
                                src={data.profile_pic || '/profile-pic.png'} 
                                alt="Profile Picture"
                                className="profile-pic"
                            />
                            <span className="username">{data.username}</span>
                        </div>
                        <div className="capsule-image">
                            <img src={data.image_url} alt="Modal photo" className="modal-photo"/>
                        </div>
                        <div className="capsule-info">
                            <p className="caption">
                                <strong>{data.username}</strong> {data.content}</p>
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
