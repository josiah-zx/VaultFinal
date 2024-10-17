import React, { useState } from 'react';
import './RegistrationForm.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { Link } from 'react-router-dom';

const RegistrationForm = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    return (
        <div className='wrapper'>
            <form>
                <h1>Create an Account</h1>
                <div className="input-box">
                    <input type="text" placeholder='First Name' required value={firstName}
                           onChange={(e) => setFirstName(e.target.value)}/>
                    <FaUser className='icons'/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Last Name' required value={lastName}
                           onChange={(e) => setLastName(e.target.value)}/>
                    <FaUser className='icons'/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Username' required value={username}
                           onChange={(e) => setUsername(e.target.value)}/>
                    <FaUser className='icons'/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Password' required value={password}
                           onChange={(e) => setPassword(e.target.value)}/>
                    <FaLock className='icons'/>
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Confirm Password' required value={confirmedPassword}
                           onChange={(e) => setConfirmedPassword(e.target.value)}/>
                    <FaLock className='icons'/>
                </div>
                <button type="submit">Sign Up</button>
                <div className="login-link">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
        </div>
    );
};

export default RegistrationForm;

