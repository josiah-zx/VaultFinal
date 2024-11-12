import React from 'react';
import './CommentPopUp.css';
import { FaTimes } from 'react-icons/fa';

const CommentPopup = ({ postContent, comments, onClose }) => {
    return (
        <div className="comment-popup">
            <div className="popup-background" /> {/* New background overlay */}
            
            <div className="popup-wrapper">
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="popup-content">
                    <div className="popup-post">
                        <img src={postContent.image} alt="Post content" />
                        <p><strong>{postContent.username}</strong> {postContent.caption}</p>
                    </div>

                    <div className="popup-comments">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="comment">
                                    <p><strong>{comment.username}</strong> {comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p>No comments yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentPopup;
