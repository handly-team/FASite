import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Для индикатора загрузки
    const [error, setError] = useState(null); // Для отображения ошибки

    const handleSubmit = async (e) => {
        e.preventDefault();
        const refresh = localStorage.getItem("refresh");
        
        if (!refresh) {
            setError("Не удалось найти сессию.");
            return;
        }
        
        setLoading(true);
        try {
            await api.post('logout/', {
                refresh: refresh,
            });
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            setError(null); // Сброс ошибки после успешного выхода
            navigate('/login');
            window.location.reload();
        } catch (err) {
            setError('Ошибка при выходе из системы. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} {/* Показываем ошибку */}
            <button type="submit" disabled={loading}>
                {loading ? 'Выход...' : 'Выйти'}
            </button>
        </form>
    );
};

export default LogoutButton;
