import React, { useState } from 'react';
import './Home.css';
import Navbar from '../HomeHeader/HomeHeader';
import PostFeed from "../PostFeed/PostFeed";
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar/>
            <PostFeed/>
        </div>
    );
};

export default Home;