import React, { useEffect, useState } from "react";
import "./css/fybeca.css"; // Asegúrate de tener tu archivo CSS

const FybecaProducto = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtros, setFiltros] = useState({
    nombre: '',
    codigoSap: '',
    descripcion: ''
  });

  // Función para cargar productos con filtros aplicados
  const loadProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filtros).toString();
      const response = await fetch(`http://localhost:8082/api/reportes/productos?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.statusText}`);
      }
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Maneja cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Maneja el envío del formulario de filtros
  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadProductos();  // Recargar productos con los filtros aplicados
  };

  const handleEdit = (id) => {
    const producto = productos.find((p) => p.id === id);
    setProductoEditar(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductoEditar(null);
  };

  const handleUpdateProducto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8082/api-fybeca/productos/${productoEditar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoEditar),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }
      loadProductos();
      handleCloseModal();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        const response = await fetch(`http://localhost:8082/api-fybeca/productos/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Error al eliminar el producto");
        }
        loadProductos();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    loadProductos();
  }, [filtros]); // Recargar productos cuando los filtros cambian

  return (
    <div className="container">
      <h1>Fybeca - Productos</h1>

      {loading ? (
        <p className="loading">Cargando productos...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : (
        <>
          <h2>Lista de Productos</h2>

          {/* Filtros de productos */}
          <form onSubmit={handleApplyFilters}>
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={filtros.nombre}
              onChange={handleFilterChange}
            />
            <label>Código SAP</label>
            <input
              type="text"
              name="codigoSap"
              value={filtros.codigoSap}
              onChange={handleFilterChange}
            />
            <label>Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={filtros.descripcion}
              onChange={handleFilterChange}
            />
            <button type="submit" className="btn-filter">Aplicar Filtros</button>
          </form>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre del Producto</th>
                  <th>Código SAP</th>
                  <th>Código Barra</th>
                  <th>Código PDV</th>
                  <th>Descripción</th>
                  <th>PDV</th>
                  <th>Stock en Dólares</th>
                  <th>Stock en Unidades</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre_Producto}</td>
                    <td>{producto.codigo_Sap}</td>
                    <td>{producto.cod_Barra}</td>
                    <td>{producto.cod_Pdv}</td>
                    <td>{producto.descripcion}</td>
                    <td>{producto.pdv}</td>
                    <td>{producto.stock_Dolares}</td>
                    <td>{producto.stock_Unidades}</td>
                    <td>
                      <button onClick={() => handleEdit(producto.id)} className="btn-edit">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(producto.id)} className="btn-delete">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && productoEditar && (
            <div className="modal">
              <div className="modal-content">
                <h2>Editar Producto</h2>
                <form onSubmit={handleUpdateProducto}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre_Producto"
                    value={productoEditar.nombre_Producto}
                    onChange={handleInputChange}
                  />
                  <label>Código SAP</label>
                  <input
                    type="text"
                    name="codigo_Sap"
                    value={productoEditar.codigo_Sap}
                    onChange={handleInputChange}
                  />
                  <label>Código Barra</label>
                  <input
                    type="text"
                    name="cod_Barra"
                    value={productoEditar.cod_Barra}
                    onChange={handleInputChange}
                  />
                  <label>Código PDV</label>
                  <input
                    type="text"
                    name="cod_Pdv"
                    value={productoEditar.cod_Pdv}
                    onChange={handleInputChange}
                  />
                  <label>Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={productoEditar.descripcion}
                    onChange={handleInputChange}
                  />
                  <label>PDV</label>
                  <input
                    type="text"
                    name="pdv"
                    value={productoEditar.pdv}
                    onChange={handleInputChange}
                  />
                  <label>Stock en Dólares</label>
                  <input
                    type="number"
                    name="stock_Dolares"
                    value={productoEditar.stock_Dolares}
                    onChange={handleInputChange}
                  />
                  <label>Stock en Unidades</label>
                  <input
                    type="number"
                    name="stock_Unidades"
                    value={productoEditar.stock_Unidades}
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

export default FybecaProducto;
