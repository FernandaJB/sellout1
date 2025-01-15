import React, { useEffect, useState } from "react";
import "./css/fybeca.css"; // Asegúrate de tener tu archivo CSS

const FybecaMantenimientoCliente = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/mantenimiento/clientes");
      if (!response.ok) {
        throw new Error(`Error al cargar clientes: ${response.statusText}`);
      }
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const cliente = clientes.find((c) => c.id === id);
    setClienteEditar(cliente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClienteEditar(null);
  };

  const handleUpdateCliente = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/mantenimiento/cliente/${clienteEditar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteEditar),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el cliente");
      }
      loadClientes();
      handleCloseModal();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClienteEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Subir archivo a la API
  const handleUploadTemplate = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8082/api-fybeca/upload/clientes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al cargar el archivo");
      }

      const result = await response.json();
      alert(result); // Esto puede mostrar el mensaje de éxito o el error desde el backend
      loadClientes(); // Recargar la lista de clientes después de cargar el archivo
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return (
    <div className="container">
      <h1>Fybeca - Mantenimiento Clientes</h1>

      {loading ? (
        <p className="loading">Cargando clientes...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : (
        <>
          {/* Botón de cargar archivo arriba de la tabla */}
          <div className="upload-section" style={{ display: "none" }}>
            <h3>Cargar Archivo</h3>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUploadTemplate} className="btn-upload">
              Cargar Archivo
            </button>
          </div>

          <h2>Lista de Mantenimiento Clientes</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Nombre Cliente</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.cod_Cliente}</td>
                    <td>{cliente.nombre_Cliente}</td>
                    <td>{cliente.cod_Item}</td>
                    <td>{cliente.cod_Barra_Sap}</td>
                    <td>
                      <button onClick={() => handleEdit(cliente.id)} className="btn-edit">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && clienteEditar && (
            <div className="modal">
              <div className="modal-content">
                <h2>Editar Cliente</h2>
                <form onSubmit={handleUpdateCliente}>
                  <label>Cliente</label>
                  <input
                    type="text"
                    name="cod_Cliente"
                    value={clienteEditar.cod_Cliente}
                    onChange={handleInputChange}
                  />
                  <label>Nombre Cliente</label>
                  <input
                    type="text"
                    name="nombre_Cliente"
                    value={clienteEditar.nombre_Cliente}
                    onChange={handleInputChange}
                  />                
                  <div className="modal-actions">
                    <button type="submit" className="btn-save">Guardar</button>
                    <button type="button" className="btn-close" onClick={handleCloseModal}>
                      Cerrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FybecaMantenimientoCliente;