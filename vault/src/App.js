import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import LoginForm from './Components/LoginForm/LoginForm';
import RegistrationForm from "./Components/RegistrationForm/RegistrationForm";
import ResetPasswordForm from './Components/ResetPasswordForm/ResetPasswordForm';
import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";


function App() {

  return (
      <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
      </Routes>
  );
}

export default App;