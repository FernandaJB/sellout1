import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FaSignOutAlt, FaMedkit } from 'react-icons/fa'; // Importa el ícono de medicina
import Login from './login';
import Registrar from './Registrar';
import OlvidarContraseña from './OlvidarContraseña';
import RestablecerContrasenia from './RestablecerContrasenia';
import FybecaMantenimientoCliente from './FybecaMantenimientoCliente';
import FybecaMantenimientoProducto from './FybecaMantenimientoProducto';
import FybecaTemplate from './FybecaTemplate';
import FybecaTipoMueble from './FybecaTipoMueble';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [isFybecaMenuOpen, setFybecaMenuOpen] = useState(false); // Estado para controlar el menú desplegable

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const userInfo = parseJwt(accessToken);
        const storedUserData = {
          username: localStorage.getItem('username') || localStorage.getItem('cedulaEmpleado'),
          email: userInfo.email,
          id: userInfo.id,
        };
        setUser(storedUserData);
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    setActiveTab('');
  };

  const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const renderTabMenu = () => {
    if (!user) return null;

    return (
      <nav className="tab-menu">
        <div
          className="dropdown"
          onMouseEnter={() => setFybecaMenuOpen(true)}
          onMouseLeave={() => setFybecaMenuOpen(false)}
        >
          <button className="dropdown-button">
            <FaMedkit /> Fybeca
          </button>
          {isFybecaMenuOpen && (
            <div className="dropdown-content">
              <button
                className={activeTab === 'FybecaTemplate' ? 'active' : ''}
                onClick={() => setActiveTab('FybecaTemplate')}
              >
                Fybeca - Ventas
              </button>
              <button
                className={activeTab === 'FybecaMantenimientoCliente' ? 'active' : ''}
                onClick={() => setActiveTab('FybecaMantenimientoCliente')}
              >
                Fybeca Mantenimiento Cliente
              </button>
              <button
                className={activeTab === 'FybecaMantenimientoProducto' ? 'active' : ''}
                onClick={() => setActiveTab('FybecaMantenimientoProducto')}
              >
                Fybeca Mantenimiento Producto
              </button>
              <button
                className={activeTab === 'FybecaTipoMueble' ? 'active' : ''}
                onClick={() => setActiveTab('FybecaTipoMueble')}
              >
                Fybeca Mantenimiento Tipo Mueble
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Sell Out</h1>
        {user && (
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt />
          </button>
        )}
      </div>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/Registrar" element={<Registrar />} />
        <Route path="/OlvidarContraseña" element={<OlvidarContraseña />} />
        <Route path="/RestablecerContrasenia" element={<RestablecerContrasenia />} />
        <Route
          path="/"
          element={
            user ? (
              <div className="content-container">
                {renderTabMenu()}
                <div className="tab-content">
                  {activeTab === 'FybecaTemplate' && <FybecaTemplate />}
                  {activeTab === 'FybecaMantenimientoCliente' && <FybecaMantenimientoCliente />}
                  {activeTab === 'FybecaMantenimientoProducto' && <FybecaMantenimientoProducto />}
                  {activeTab === 'FybecaTipoMueble' && <FybecaTipoMueble />}
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
