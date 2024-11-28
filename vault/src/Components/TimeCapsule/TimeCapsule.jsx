import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHeader from '../HomeHeader/HomeHeader'; // Import the HomeHeader component
import './TimeCapsule.css';

const TimeCapsule = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('content', description);
        formData.append('open_at', selectedDate);
        if (file) {
            formData.append('image_url', file);
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/create-capsule', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessMessage('Time capsule created successfully!');
                setTimeout(() => {
                    navigate('/home'); // Navigate to the home page
                }, 1500); // Add a slight delay to allow the user to see the success message
            } else {
                setErrorMessage('Failed to create the time capsule.');
            }
        } catch (error) {
            console.error('Error creating capsule:', error);
            setErrorMessage('An unexpected error occurred.');
        }
    };
    return (
        <div style={{ display: 'flex' }}>
            <HomeHeader /> {/* Sidebar as the left navbar */}
            <div className="time-capsule-container" style={{ marginLeft: '250px' }}>
                <h1>Create Time Capsule</h1>
                <div className="time-capsule-form">
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    <textarea
                        placeholder="Add a description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <label>Open Date and Time:</label>
                    <input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                    <button onClick={handleSubmit} className="save-btn">
                        Save Capsule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeCapsule;
