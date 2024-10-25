import React, { useState } from 'react';
import './Home.css';
import Navbar from '../HomeHeader/HomeHeader';
import PostFeed from "../PostFeed/PostFeed";
import HomePageProfile from "../HomePageProfile/HomePageProfile";
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar/>
            <div className="homepage-profile">
                <HomePageProfile/>
            </div>
            <div className="post-feed">
                <PostFeed/>
            </div>
        </div>
    );
};

export default Home;