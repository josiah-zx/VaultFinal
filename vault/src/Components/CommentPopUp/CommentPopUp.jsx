import React from 'react';
import './CommentPopUp.css'; // Ensure you have the CSS styles for the popup
import { FaTimes } from 'react-icons/fa'; // Close icon

const CommentPopup = ({ postContent, comments, onClose }) => {
    return (
        <div className="comment-popup">
            <div className="popup-content">
                {/* Close Button */}
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                
                {/* Post Section (Left) */}
                <div className="popup-post">
                    <img src={postContent.image} alt="Post content" />
                    <p><strong>{postContent.username}</strong> {postContent.caption}</p>
                </div>
                
                {/* Comments Section (Right) */}
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
    );
};

export default CommentPopup;
