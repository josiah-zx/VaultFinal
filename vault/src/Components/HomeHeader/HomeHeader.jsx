import React, { useState } from 'react';
import './HomeHeader.css';
import { NavLink } from 'react-router-dom';
import { FaHouseChimney } from "react-icons/fa6";
import { BiSolidMessageDots } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import Search from '../Search/Search';

const HomeHeader = () => {

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <NavLink to="/home">
                    <img src="/nav_vault_logo.png" alt="Vault Logo" className="logo"/>
                </NavLink>
            </div>
            <Search />
            <ul className="navbar-links">
                <li>
                    <NavLink to="/home" activeClassName="active-link">
                        <FaHouseChimney className= 'icons'/>
                        <span className='text'>Home</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/profile" activeClassName="active-link">
                        <FaUserCircle className= 'icons'/>
                        <span className='text'>Profile</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/messages" activeClassName="active-link">
                        <BiSolidMessageDots className= 'icons'/>
                        <span className='text'>Messages</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings" activeClassName="active-link">
                        <FaGear className= 'icons'/>
                        <span className='text'>Settings</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );


};

export default HomeHeader;