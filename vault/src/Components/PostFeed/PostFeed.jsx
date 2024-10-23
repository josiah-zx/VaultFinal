import React, {useEffect, useState} from 'react';
import './PostFeed.css';
import { NavLink } from 'react-router-dom';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { FaRegComment } from 'react-icons/fa';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { FaRegPaperPlane } from 'react-icons/fa';

const PostFeed = () => {

    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(10);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked); // Toggle like state
        setLikes(isLiked ? likes - 1 : likes + 1); //increment and decrement likes
    };


    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked); // Toggle bookmark icon
    };

    return (
        <div className="feed">
            <div className="post-card">
                <div className="post-header">
                    <img src="/profile-pic.png" alt="Profile Picture" className="profile-pic"/>
                    <span className="username">username</span>
                </div>
                <img src="/time-stopwatch-sand.jpg" alt="Post content" className="post-content" />
                <div className="post-info">
                    <p className="caption"><strong>username</strong> Caption goes here.</p>
                    <div className="post-stats">
                        <span>{likes} likes</span>
                        <span>0 comments</span>
                    </div>
                    <div className="post-actions">
                        <span className="like-icon" onClick={handleLike}>
                            {isLiked ? <FaHeart className="icon filled" style={{ color: "red" }} /> : <FaRegHeart className="icon" />}
                        </span>
                        <span className="comment-icon">
                           <FaRegComment className="icon" />
                        </span>
                        <span className ="bookmark-icon" onClick={handleBookmark}>
                             {isBookmarked ? <FaBookmark className="icon" style={{ color: "black" }} /> : <FaRegBookmark className="icon" />}
                        </span>
                        <span className ="share-icon">
                             <FaRegPaperPlane className="icon" />
                        </span>
                    </div>
                </div>
            </div>
        </div>

    );


};

export default PostFeed;