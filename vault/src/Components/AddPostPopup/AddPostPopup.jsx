import React, { useState, useEffect } from 'react';
import './AddPostPopup.css';

const AddPostPopup = ({ capsuleId, onClose, onImageUpload }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session-user`, {
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
        formData.append('capsule_id', capsuleId);
        formData.append('content', description);
        if (file) {
            formData.append('image_url', file);
        } else {
            setErrorMessage("File required for post.")
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/create-post`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setImageUrl(data.image_url);
                setSuccessMessage("Post saved successfully!");
                setErrorMessage('');
                setTimeout(() => {
                    onClose();
                    onImageUpload(data.image_url);
                }, 1500);
            } else {
                setErrorMessage("Failed to save post.");
            }
        } catch (error) {
            setErrorMessage("An error occurred while saving the post.");
            console.error("Error saving post:", error);
        }
    };

    return (
        <div className="add-post-modal-overlay" onClick={onClose}>
            <div className="add-post-popup" onClick={(e) => e.stopPropagation()}>
                <div className="add-post-popup-content">
                    <div className="add-post-header">
                        <h2>Add To Capsule</h2>
                        <button className="add-post-close-btn" onClick={onClose}>X</button>
                        {errorMessage && <p className="add-post-popup-error-message">{errorMessage}</p>}
                        {successMessage && <p className="add-post-popup-success-message">{successMessage}</p>}
                    </div>
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

                    <button className="add-post-popup-content-btn" onClick={handleSubmit}>Post</button>

                    {/* Display uploaded image */}
                    {imageUrl && <img src={imageUrl} alt="Uploaded Post" className="uploaded-image" />}
                </div>
            </div>
        </div>
    );
};

export default AddPostPopup;
