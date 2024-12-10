import React, { useState, useEffect } from 'react';
import './Home.css';
import Navbar from '../HomeHeader/HomeHeader';
import PostFeed from "../PostFeed/PostFeed";
import HomePageProfile from "../HomePageProfile/HomePageProfile";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session-user`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                } else {
                    console.error('Not logged in.');
                    navigate('/login');
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchSessionUser();
    }, [navigate]);

    return (
        <div className="home-container">
            <Navbar username={username}/>
            <div className="homepage-profile">
                <HomePageProfile/>
            </div>
            <div className="post-feed">
                <PostFeed username={username}/>
            </div>
        </div>
    );
};

export default Home;