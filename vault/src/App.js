import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm';
import RegistrationForm from "./Components/RegistrationForm/RegistrationForm";

function App() {

  return (
      <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
      </Routes>
  );
}

export default App;
