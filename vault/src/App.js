import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from "./Components/Home/Home";
import LoginForm from './Components/LoginForm/LoginForm';
import RegistrationForm from "./Components/RegistrationForm/RegistrationForm";
import Search from "./Components/Search/Search";
import ResetPasswordForm from './Components/ResetPasswordForm/ResetPasswordForm';

function App() {

  return (
      <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
      </Routes>
  );
}

export default App;