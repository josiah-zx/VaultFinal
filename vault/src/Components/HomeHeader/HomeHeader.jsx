import React, { useState, useEffect } from 'react';
import './HomeHeader.css';
import { NavLink } from 'react-router-dom';
import { FaHouseChimney } from "react-icons/fa6";
import { BiSolidMessageDots } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import Search from '../Search/Search';

const HomeHeader = () => {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch username from Flask session
    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include',  // Include session cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);  // Set the username from session data
                } else {
                    setErrorMessage('Failed to load user info');
                }
            } catch (error) {
                console.error("Failed to fetch session user:", error);
                setErrorMessage('An error occurred while fetching user data.');
            }
        };
        fetchSessionUser();
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/home" className="logo-link">
                    <img src="/nav_vault_logo.png" alt="Vault Logo" className="logo"/>
                </a>
            </div>
            <ul className="navbar-links">
                <li>
                    <NavLink to="/home" activeClassName="active-link">
                        <FaHouseChimney className='icons'/>
                        <span className='text'>Home</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/${username}`} activeClassName="active-link">
                        <FaUserCircle className='icons'/>
                        <span className='text'>Profile</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/messages" activeClassName="active-link">
                        <BiSolidMessageDots className='icons'/>
                        <span className='text'>Messages</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings" activeClassName="active-link">
                        <FaGear className='icons'/>
                        <span className='text'>Settings</span>
                    </NavLink>
                </li>
            </ul>
            <div className="navbar-search">
                <Search/>
            </div>
        </nav>
    );


};

export default HomeHeader;