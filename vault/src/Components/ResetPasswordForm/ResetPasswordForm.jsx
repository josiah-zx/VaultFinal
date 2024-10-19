import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPasswordForm.css';
import { Link } from 'react-router-dom';

const ResetPasswordForm = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Send the reset password request to the backend
        try {
            const response = await fetch('http://127.0.0.1:5000/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email_or_username: emailOrUsername,
                    new_password: newPassword,
                    confirmed_password: confirmPassword
                }),
            });

            const data = await response.json();
            // Redirect to login page after successful reset
            if (response.ok) {
                setSuccessMessage(data.message);
                setErrorMessage('');
                navigate('/login');  
            } else {
                setErrorMessage(data.message);
                setSuccessMessage('');
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="wrapper">  
            <form onSubmit={handleSubmit}>
                <h1>Reset Password</h1>
                <div className="input-box">
                    <input 
                        type="text" 
                        placeholder="Email/Username" 
                        required 
                        value={emailOrUsername} 
                        onChange={(e) => setEmailOrUsername(e.target.value)} 
                    />
                </div>
                <div className="input-box">
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        required 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                    />
                </div>
                <div className="input-box">
                    <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                </div>
                <button type="submit">Reset Password</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <div className="register-link">
                    <p>Remember your password? <Link to="/login">Login</Link></p>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordForm;