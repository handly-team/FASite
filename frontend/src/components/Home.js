import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaEdit, FaTrash } from "react-icons/fa";

const Home = () => {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newFile, setNewFile] = useState({
    owner: null,
    name: "",
    description: "",
    file: null,
    category: null,
    tags: [],
    can_view_users: [],
    can_edit_users: [],
    can_delete_users: [],
  });
  const [users, setUsers] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [newTag, setNewTag] = useState({ name: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFile, setEditFile] = useState(null);
  
  const navigate = useNavigate();
  const user = jwtDecode(localStorage.getItem("access"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filesRes, catsRes, tagsRes, usersRes] = await Promise.all([
          api.get("/file_management/files/"),
          api.get("/file_management/categories/"),
          api.get("/file_management/tags/"),
          api.get("/users/"),
        ]);
        setFiles(filesRes.data);
        setCategories(catsRes.data);
        setTags(tagsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Ошибка:", error);
        if (error.response?.status === 401) navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/file_management/files/${fileId}/delete/`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error("Ошибка при удалении файла:", error);
      if (error.response?.status === 401) navigate("/login");
    }
  };
  
  const handleEdit = (fileId) => {
    const fileToEdit = files.find(f => f.id === fileId);
    if (fileToEdit) {
      setEditFile({
        ...fileToEdit,
        category: fileToEdit.category.id,
        tags: fileToEdit.tags.map(t => t.id),
        can_view_users: fileToEdit.can_view_users.map(u => u.id),
        can_edit_users: fileToEdit.can_edit_users.map(u => u.id),
        can_delete_users: fileToEdit.can_delete_users.map(u => u.id),
      });
      setShowEditModal(true);
    }
  };
  
  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editFile.name);
      formData.append("description", editFile.description);
      if (editFile.file instanceof File) {
        formData.append("file", editFile.file);
      }
      formData.append("category", editFile.category);
      editFile.tags.forEach(tagId => formData.append("tags", tagId));
      editFile.can_view_users.forEach(id => id ? formData.append("can_view_users", id) : null);
      editFile.can_edit_users.forEach(id => id ? formData.append("can_view_users", id) : null);
      editFile.can_delete_users.forEach(id => id ? formData.append("can_view_users", id) : null);
      console.log(...formData);
      console.log([...formData.entries()]);
      await api.patch(`/file_management/files/${editFile.id}/edit/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при редактировании файла:", error);
      if (error.response?.status === 401) navigate("/login");
    }
  };
  

  const handleSubmitNewFile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access");
      const decoded = jwtDecode(token);
      const formData = new FormData();
      formData.append("owner", decoded.user_id);
      formData.append("name", newFile.name);
      formData.append("description", newFile.description);
      formData.append("file", newFile.file);
      formData.append("category", newFile.category);
      newFile.tags.forEach((tagId) => formData.append("tags", tagId));
      newFile.can_view_users.forEach((id) => formData.append("can_view_users", id));
      newFile.can_edit_users.forEach((id) => formData.append("can_edit_users", id));
      newFile.can_delete_users.forEach((id) => formData.append("can_delete_users", id));
      
      users.forEach(u => (u.id === user.user_id || u.is_staff) ? formData.append('can_view_users', u.id) : null);
      users.forEach(u => (u.id === user.user_id || u.is_staff) ? formData.append('can_edit_users', u.id) : null);
      users.forEach(u => (u.id === user.user_id || u.is_staff) ? formData.append('can_delete_users', u.id) : null);

      await api.post("/file_management/files/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при добавлении файла:", error);
      if (error.response?.status === 401) navigate("/login");
    }
  };

  const handleSimplePost = async (e, data, endpoint) => {
    e.preventDefault();
    try {
      await api.post(endpoint, data);
      window.location.reload();
    } catch (error) {
      console.error("Ошибка:", error);
      if (error.response?.status === 401) navigate("/login");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Файлы</h2>
      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Скачать</th>
              <th>Дата</th>
              <th>Добавил</th>
              <th>Категория</th>
              <th>Тэги</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
          {files.length > 0 ? (
            files.map((file) => (
              <tr key={file.id}>
                <td>{file.id}</td>
                <td>{file.name}</td>
                <td>{file.description}</td>
                <td>
                  <a href={file.file} target="_blank" rel="noopener noreferrer">Скачать</a>
                </td>
                <td>{new Date(file.created_at).toLocaleString()}</td>
                <td>{file.owner.username}</td>
                <td>{file.category.name}</td>
                <td>{file.tags.map((t) => t.name).join(", ")}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(file.id)} title="Редактировать">
                    <FaEdit />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(file.id)} title="Удалить">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">Файлы не найдены</td>
            </tr>
          )}
        </tbody>
        </table>
      </div>

      <div className="form-section">
        <form className="styled-form" onSubmit={handleSubmitNewFile}>
          <h3 className="form-subtitle">Добавить файл</h3>
          <input className="form-input" placeholder="Название" onChange={(e) => setNewFile({ ...newFile, name: e.target.value })} />
          <input className="form-input" placeholder="Описание" onChange={(e) => setNewFile({ ...newFile, description: e.target.value })} />
          <input className="form-input" type="file" onChange={(e) => setNewFile({ ...newFile, file: e.target.files[0] })} />
          <select className="form-input" defaultValue="" onChange={(e) => setNewFile({ ...newFile, category: parseInt(e.target.value) })}>
            <option value="" disabled>Выберите категорию</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="form-input"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
              setNewFile({ ...newFile, tags: selected });
            }}
          >
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select className="form-input" multiple onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            setNewFile({ ...newFile, can_view_users: selected });
          }}>
            <option disabled>Выберите пользователей с правом просмотра</option>
            {users.map((u) => (u.id !== user.user_id && !u.is_staff) ? (
              <option key={u.id} value={u.id}>{u.username}</option>
            ) : (
              ""
            ))}
          </select>

          <select className="form-input" multiple onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            setNewFile({ ...newFile, can_edit_users: selected });
          }}>
            <option disabled>Выберите пользователей с правом редактирования</option>
            {users.map((u) => (u.id !== user.user_id && !u.is_staff) ? (
              <option key={u.id} value={u.id}>{u.username}</option>
            ) : (
              ""
            ))}
          </select>

          <select className="form-input" multiple onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            setNewFile({ ...newFile, can_delete_users: selected });
          }}>
            <option disabled>Выберите пользователей с правом удаления</option>
            {users.map((u) => (u.id !== user.user_id && !u.is_staff) ? (
              <option key={u.id} value={u.id}>{u.username}</option>
            ) : (
              ""
            ))}
          </select>
          <button type="submit" className="form-button">Добавить</button>
        </form>

        <form className="styled-form" onSubmit={(e) => handleSimplePost(e, newCategory, "/file_management/categories/")}>
          <h3 className="form-subtitle">Добавить категорию</h3>
          <input className="form-input" placeholder="Категория" onChange={(e) => setNewCategory({ name: e.target.value })} />
          <button className="form-button">Создать</button>
        </form>

        <form className="styled-form" onSubmit={(e) => handleSimplePost(e, newTag, "/file_management/tags/")}>
          <h3 className="form-subtitle">Добавить тэг</h3>
          <input className="form-input" placeholder="Тэг" onChange={(e) => setNewTag({ name: e.target.value })} />
          <button className="form-button">Создать</button>
        </form>
      </div>
      {showEditModal && editFile && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Редактировать файл: {editFile.name}</h3>
            <input className="form-input" value={editFile.name} onChange={(e) => setEditFile({ ...editFile, name: e.target.value })} />
            <input className="form-input" value={editFile.description} onChange={(e) => setEditFile({ ...editFile, description: e.target.value })} />
            <input className="form-input" type="file" onChange={(e) => setEditFile({ ...editFile, file: e.target.files[0] })} />
            <select className="form-input" value={editFile.category} onChange={(e) => setEditFile({ ...editFile, category: parseInt(e.target.value) })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select className="form-input" multiple value={editFile.tags} onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value));
              setEditFile({ ...editFile, tags: selected });
            }}>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select className="form-input" multiple value={editFile.can_view_users} onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
              setEditFile({ ...editFile, can_view_users: selected });
            }}>
              {users.map((u) => (u.id !== user.user_id && !u.is_staff) ? (
              <option key={u.id} value={u.id}>{u.username}</option>
            ) : (
              ""
            ))}
            </select>

            <select className="form-input" multiple value={editFile.can_edit_users} onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
              setEditFile({ ...editFile, can_edit_users: selected });
            }}>
              {users.map((u) => (u.id !== user.user_id && !u.is_staff) ? (
              <option key={u.id} value={u.id}>{u.username}</option>
            ) : (
              ""
            ))}
            </select>

            <select className="form-input" multiple value={editFile.can_delete_users} onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
              setEditFile({ ...editFile, can_delete_users: selected });
            }}>
              {users.map((u) => (u.id !== user.user_id && !u.is_staff) ? (
              <option key={u.id} value={u.id}>{u.username}</option>
            ) : (
              ""
            ))}
            </select>

            <button className="form-button" onClick={handleSaveEdit}>Сохранить</button>
            <button className="form-button cancel" onClick={() => setShowEditModal(false)}>Отмена</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
