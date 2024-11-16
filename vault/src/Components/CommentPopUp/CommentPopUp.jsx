import React, { useState,useEffect } from 'react';
import './CommentPopUp.css';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const CommentPopup = ({ postContent, comments, onClose, onSendComment }) => {
    const [newComment, setNewComment] = useState('');

    
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleSendComment = () => {
        if (newComment.trim()) {
            onSendComment(newComment);
            setNewComment('');
        }
    };

    return (
    <div className="comment-popup">
        <div className="popup-background" onClick={onClose} />
        <div className="popup-wrapper">
        <button className="close-btn" onClick={onClose}>
            <FaTimes />
        </button>
        <div className="popup-post">
            <img src={postContent.image} alt="Post content" />
        </div>
        <div className="popup-comments">
            <div className="comments-list">
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
            <div className="comment-input-section">
                <input
                    type="text"
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="send-btn" onClick={handleSendComment}>
                    <FaPaperPlane />
                </button>
                </div>
            </div>
        </div>
    </div>
    );
};

export default CommentPopup;
