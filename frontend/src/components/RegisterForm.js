import React, {useState} from "react";
import api from '../api';
import {useNavigate} from 'react-router-dom';

const RegisterForm = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async e => {
      e.preventDefault();
      try {
        await api.post('register/', form);
        navigate('/');
      }  catch (err) {
        alert('Ошибка регистрации!');
      }
    };

    return (
      <div className="form-container">
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Регистрация</h2>
            <input className="form-input" placeholder="Логин" onChange={e => setForm({ ...form, username: e.target.value })}/>
            <input className="form-input" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })}/>
            <input className="form-input" type="password" placeholder="Пароль" onChange={e => setForm({ ...form, password: e.target.value })}/>
            <input className="form-input" type="password" placeholder="Повторите пароль" onChange={e => setForm({ ...form, password2: e.target.value })}/>
            <button className="form-button" type="submit">Зарегистрироваться</button>
        </form>
      </div>
    )
};

export default RegisterForm;