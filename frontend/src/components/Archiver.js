import React, { useState } from 'react';
import api from '../api'; // предполагаем, что у тебя есть настроенный api

const FileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/file_management/files/`, {
        params: {
          search: searchQuery,
        },
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Ошибка при поиске файлов:', error);
    }
  };

  const handleFileSelection = (e, fileId) => {
    if (e.target.checked) {
      setSelectedFiles((prev) => [...prev, fileId]);
    } else {
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
    }
  };

  const handleArchiveFiles = async () => {
    try {
      const response = await api.post('/file_management/archive/', {
        file_ids: selectedFiles,
      });

      // Создаем ссылку для скачивания архива
      const link = document.createElement('a');
      link.href = "http://localhost:8000" + response.data.archive_url;  // предполагаем, что сервер возвращает URL для скачивания архива
      link.download = 'files_archive.zip';
      link.click();
    } catch (error) {
      console.error('Ошибка при архивации файлов:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="file-search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Поиск по названию, категории, тэгам"
          className="file-search-input"
        />
        <button type="submit" className="file-search-button">Поиск</button>
      </form>

      {files.length > 0 ? (
        <>
          <button onClick={handleArchiveFiles} disabled={selectedFiles.length === 0} className="archive-button">
            Архивировать выбранные файлы
          </button>
          <table className="files-container">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Ссылка на скачивание</th>
                <th>Дата добавления</th>
                <th>Добавил</th>
                <th>Категория</th>
                <th>Тэги</th>
                <th>Выбрать</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.id}</td>
                  <td>{file.name}</td>
                  <td>{file.description}</td>
                  <td><a href={file.file}>Скачать</a></td>
                  <td>{new Date(file.created_at).toLocaleString()}</td>
                  <td>{file.owner.username}</td>
                  <td>{file.category.name}</td>
                  <td>{file.tags.map(tag => tag.name).join(', ')}</td>
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleFileSelection(e, file.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Файлы не найдены</p>
      )}
    </div>
  );
};

export default FileSearch;
