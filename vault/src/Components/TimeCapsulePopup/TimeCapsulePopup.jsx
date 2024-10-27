import React, { useState, useEffect } from 'react';
import './TimeCapsulePopup.css';

const TimeCapsulePopup = ({ onClose, onImageUpload }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');  // Add state for image URL

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/session-user', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                } else {
                    setErrorMessage('Failed to load user session.');
                }
            } catch (error) {
                setErrorMessage("Error fetching session user.");
                console.error("Error fetching session user:", error);
            }
        };
        fetchSessionUser();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSubmit = async () => {
        if (!username) {
            setErrorMessage("Username not available. Please try again.");
            return;
        }
    
        const formData = new FormData();
        formData.append('user_id', username);
        formData.append('content', description);
        formData.append('open_at', selectedDate);
        if (file) {
            formData.append('image_url', file);
        }
    
        try {
            const response = await fetch('http://127.0.0.1:5000/posts', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
    
            if (response.ok) {
                const data = await response.json();
                setImageUrl(data.image_url);  // Set the image URL upon successful response
                setSuccessMessage("Time capsule saved successfully!");
                setErrorMessage('');
                
                // Pass image URL to the parent component
                onImageUpload(data.image_url);  // Add this line
            } else {
                setErrorMessage("Failed to save time capsule.");
            }
        } catch (error) {
            setErrorMessage("An error occurred while saving the time capsule.");
            console.error("Error saving time capsule:", error);
        }
    };

    return (
        <div className="time-capsule-popup">
            <div className="popup-content">
                <button className="close-btn" onClick={onClose}>X</button>
                
                <h2>Create Time Capsule</h2>
                
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

                <button onClick={handleSubmit}>Save Capsule</button>

                {/* Display uploaded image */}
                {imageUrl && <img src={imageUrl} alt="Uploaded Capsule" className="uploaded-image" />}
            </div>
        </div>
    );
};

export default TimeCapsulePopup;
