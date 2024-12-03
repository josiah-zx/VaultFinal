import React, { useState, useEffect } from 'react';
import './CommentPopUp.css';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const CommentPopup = ({ capsuleContent, onClose }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        console.log("Fetching comments for capsule_id:", capsuleContent?.capsule_id);

        const fetchComments = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/comments?capsule_id=${capsuleContent.capsule_id}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Error fetching comments: ${response.statusText}`);
                }

                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();

        return () => {
            document.body.style.overflow = '';
        };
    }, [capsuleContent.capsule_id]);

    const handleSendComment = async () => {
        if (newComment.trim()) {
            console.log("Sending comment with capsule_id:", capsuleContent?.capsule_id);

            try {
                const response = await fetch('http://127.0.0.1:5000/comments', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        capsule_id: capsuleContent.capsule_id,
                        text: newComment.trim(),
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData);
                    throw new Error(`Error sending comment: ${response.statusText}`);
                }

                const newCommentData = await response.json();
                setComments([...comments, newCommentData]);
                setNewComment('');
            } catch (error) {
                console.error('Error sending comment:', error);
            }
        }
    };

    console.log("Rendering CommentPopup for capsule_id:", capsuleContent?.capsule_id);

    return (
        <div className="comment-popup">
            <div className="popup-background" onClick={onClose} />
            <div className="popup-wrapper">
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <div className="popup-post">
                    <img src={capsuleContent.image} alt="Capsule content" />
                </div>
                <div className="popup-comments">
                    <div className="comments-list">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="comment">
                                    <img
                                        src={comment.profile_pic || '/default-profile-pic.png'}
                                        alt="Profile"
                                        className="comment-profile-pic"
                                    />
                                    <p>
                                        <strong>{comment.username}</strong> {comment.text}
                                    </p>
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
