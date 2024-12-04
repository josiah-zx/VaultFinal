import React, { useState, useEffect } from 'react';
import './CommentPopUp.css';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CommentPopup = ({ capsuleContent, onClose }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        const fetchComments = async () => {
            try {
                if (capsuleContent.type === 'capsule') {
                    console.log("Fetching comments for capsule_id:", capsuleContent?.capsule_id);
                    const response = await fetch(`http://127.0.0.1:5000/comments?capsule_id=${capsuleContent.capsule_id}`, {
                        credentials: 'include',
                    });
    
                    if (!response.ok) {
                        throw new Error(`Error fetching comments: ${response.statusText}`);
                    }
    
                    const data = await response.json();
                    setComments(data);
                }
                if (capsuleContent.type === 'post') {
                    console.log("Fetching comments for post_id:", capsuleContent?.post_id);
                    const response = await fetch(`http://127.0.0.1:5000/comments?post_id=${capsuleContent.post_id}`, {
                        credentials: 'include',
                    });
    
                    if (!response.ok) {
                        throw new Error(`Error fetching comments: ${response.statusText}`);
                    }
    
                    const data = await response.json();
                    setComments(data);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleSendComment = async () => {
        if (newComment.trim()) {
            try {
                if (capsuleContent.type === 'capsule') {
                    console.log("Sending comment with capsule_id:", capsuleContent?.capsule_id);
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
                }
                if (capsuleContent.type === 'post') {
                    console.log("Sending comment with post_id:", capsuleContent?.post_id);
                    const response = await fetch('http://127.0.0.1:5000/comments', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            post_id: capsuleContent.post_id,
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
                }
            } catch (error) {
                console.error('Error sending comment:', error);
            }
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
                    <img src={capsuleContent.image} alt="Capsule content" />
                </div>
                <div className="popup-comments">
                    <div className="comments-list">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="comment">
                                    <img
                                        src={comment.profile_pic}
                                        alt="Profile"
                                        className="comment-profile-pic"
                                        onClick={() => navigate(`/${comment.username}`)}
                                    />
                                    <p>
                                        <strong className="comment-username" onClick={() => navigate(`/${comment.username}`)}>
                                            {comment.username}</strong>  {comment.text}
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
