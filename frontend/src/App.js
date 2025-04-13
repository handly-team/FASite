import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Home from './components/Home';
import LogoutButton from './components/LogoutButton';
import Archriver from './components/Archiver';

function App() {
  return (
    <Router>
      <nav>
        <div className="auth-links">
          {(localStorage.getItem("access")) ? <LogoutButton /> : <Link to="/login">Вход</Link>}
          {(localStorage.getItem("access")) ? "" : <Link to="/register">Регистрация</Link>}
        </div>
        <Link to="/">Файлы</Link> 
        <Link to="/archiver">Архиватор</Link>
      </nav>
      <Routes>
        <Route path="/" element={(localStorage.getItem("access")) ? <Home /> : <Navigate to="/login" replace />}/>
        <Route path="/archiver" element={(localStorage.getItem("access")) ? <Archriver /> : <Navigate to="/login" replace />}/>
        <Route path="/login" element={(localStorage.getItem("access")) ? <Navigate to="/" replace /> : <LoginForm />}/>
        <Route path="/register" element={(localStorage.getItem("access")) ? <Navigate to="/" replace /> : <RegisterForm />} />
      </Routes>
    </Router>
  );
}

export default App;
