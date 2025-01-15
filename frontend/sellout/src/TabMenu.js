import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const TabMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Añade esto a tus estados
  const [isMiniSidebar, setIsMiniSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    { path: 'estructura-salarial', label: 'Estructura Salarial', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { path: 'acerca-de', label: 'Acerca de', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        // Modifica la clase del sidebar
        className={`bg-blue-600 text-white ${isMiniSidebar ? 'w-16' : 'w-64'} space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}
      >
        {/* Añade un botón en el sidebar para alternar entre mini y full */}
        <button
          onClick={() => setIsMiniSidebar(!isMiniSidebar)}
          className="hidden md:block absolute right-0 top-2 bg-blue-700 p-1 rounded-l-md"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMiniSidebar ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={`/app/${item.path}`}
              // Ajusta los elementos del menú para mostrar solo iconos en modo mini
              className={`flex items-center ${isMiniSidebar ? 'justify-center' : 'space-x-2'} px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                location.pathname.includes(item.path) ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {!isMiniSidebar && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className={`flex items-center ${isMiniSidebar ? 'justify-center' : 'space-x-2'} w-full px-3 py-2 mt-auto text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition duration-150 ease-in-out`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isMiniSidebar && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button onClick={toggleMenu} className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Bienvenido, {user.name || user.username || user.cedulaEmpleado}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default TabMenu;