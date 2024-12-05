import React, { useState, useEffect } from 'react';
import './HomeHeader.css';
import { NavLink } from 'react-router-dom';
import { FaHouseChimney } from "react-icons/fa6";
import { BiSolidMessageDots } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import Search from '../Search/Search';

const HomeHeader = ({ username }) => {
    const [errorMessage, setErrorMessage] = useState('');

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/home" className="logo-link">
                    <img src="/VaultTextLogo.png" alt="Vault Logo" className="logo"/>
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