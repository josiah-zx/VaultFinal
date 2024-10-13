import React from 'react';
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
const LoginForm = () =>{
    return (
        <div className='wrapper'>
            <form action="">
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username' required />
                    <FaUser className= 'icons' />
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Password' required />
                    <FaLock className= 'icons'/>
                </div>
                <div className="remember-forgot">
                    <label><input type="checkbox" /> Remember Me</label>
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit">Login</button>
                <div className="register-link">
                    <p>Need an account?<a href="#">Register</a></p>
                </div>
            </form>
        </div>
    );
};
export default LoginForm;