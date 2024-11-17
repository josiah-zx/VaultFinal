import React, { useState, useEffect } from 'react';
import './AddPostPopup.css';

const AddPostPopup = ({ postId, onClose, onImageUpload }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');  

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

    const handleSubmit = async () => {
        if (!username) {
            setErrorMessage("Username not available. Please try again.");
            return;
        }
    
        const formData = new FormData();
        formData.append('content', description);
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
                setImageUrl(data.image_url); 
                setSuccessMessage("Time capsule saved successfully!");
                setErrorMessage('');
                
               
                onImageUpload(data.image_url);
            } else {
                setErrorMessage("Failed to save time capsule.");
            }
        } catch (error) {
            setErrorMessage("An error occurred while saving the time capsule.");
            console.error("Error saving time capsule:", error);
        }
    };

    return (
        <div className="add-post-popup">
            <div className="add-post-popup-content">
                <button className="add-post-close-btn" onClick={onClose}>X</button>
                
                <h2>Add To Capsule</h2>
                
                {errorMessage && <p className="add-post-error-message">{errorMessage}</p>}
                {successMessage && <p className="add-post-success-message">{successMessage}</p>}
                
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

                <button onClick={handleSubmit}>Share</button>

                {/* Display uploaded image */}
                {imageUrl && <img src={imageUrl} alt="Uploaded Post" className="uploaded-image" />}
            </div>
        </div>
    );
};

export default AddPostPopup;
