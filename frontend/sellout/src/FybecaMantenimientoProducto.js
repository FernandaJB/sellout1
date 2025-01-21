import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faFileUpload } from "@fortawesome/free-solid-svg-icons";
import "./css/fybeca.css"; // Asegúrate de tener tu archivo CSS

const FybecaMantenimientoProducto = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(2000); // Paginación por lote de 2000 productos
  const [filter, setFilter] = useState(""); // Estado para almacenar el filtro

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/fybeca/mantenimiento/productos");
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProductos();
  }, []);

  // Cargar productos con paginación
  const loadProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/mantenimiento/productos?page=${page}&size=${itemsPerPage}`);
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

  // Cargar todos los clientes
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

  // Crear o actualizar un producto
  const handleSaveProducto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/mantenimiento/producto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoEditar),
      });
      if (!response.ok) {
        throw new Error("Error al guardar el producto");
      }
      // Manejar la respuesta exitosa aquí
      loadProductos(); // Recargar la lista de productos
      setShowModal(false);
    } catch (error) {
      console.error(error);
      // Manejar el error aquí
    } finally {
      setLoading(false);
    }
  };

  // Editar producto
  const handleEdit = (id) => {
    const producto = productos.find((p) => p.id === id);
    setProductoEditar(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductoEditar(null);
  };

  // Manejo de entradas del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cargar productos desde un archivo XLSX
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!file) {
      alert("Por favor, seleccione un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8082/api/fybeca/mantenimiento/productos/cargar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Error al cargar el archivo");
      }
      const result = await response.text();
      alert(result); // Mensaje de éxito
      loadProductos(); // Recargar la lista de productos
    } catch (error) {
      setError(error.message);
    }
  };

  // Eliminar productos seleccionados
  const handleDeleteSelected = async () => {
    const selectedIds = productos
      .filter((producto) => producto.selected)
      .map((producto) => producto.id);

    if (selectedIds.length === 0) {
      alert("No hay productos seleccionados para eliminar.");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar ${selectedIds.length} producto(s)?`
    );
    if (!confirmDelete) return;

    // Dividir los IDs en lotes de hasta 2000
    const batchSize = 2000;
    const batches = [];
    for (let i = 0; i < selectedIds.length; i += batchSize) {
      batches.push(selectedIds.slice(i, i + batchSize));
    }

    try {
      for (const batch of batches) {
        const response = await fetch("http://localhost:8082/api/fybeca/mantenimiento/productos/eliminar", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch), // Enviar la lista de IDs como JSON
        });

        if (!response.ok) {
          throw new Error("Error al eliminar los productos en uno de los lotes");
        }
      }

      alert("Productos eliminados correctamente.");
      loadProductos(); // Recargar productos después de eliminar
    } catch (error) {
      setError(error.message);
    }
  };

  // Filtrar productos por el filtro ingresado
  const filteredProductos = productos.filter((producto) => {
    return (
      producto.cod_Item.toLowerCase().includes(filter.toLowerCase()) ||
      producto.cod_Barra_Sap.toLowerCase().includes(filter.toLowerCase())
    );
  });

  // Cargar productos y clientes al inicio
  useEffect(() => {
    loadProductos();
    loadClientes();
  }, [page]); // Cambia la página cada vez que se actualice el número de página

  return (
    <div className="container">
      <h1>Mantenimiento Producto</h1>

      {loading ? (
        <div className="loading-overlay">
          <p className="loading">Cargando productos...</p>
        </div>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : (
        <>
          {/* Botones arriba de la tabla */}
          <div className="buttons-top">
            <div className="upload-section">
              <h3>Cargar Archivo XLSX</h3>
              <div className="file-upload" onClick={() => document.getElementById('fileInput').click()}>
                <FontAwesomeIcon icon={faFileUpload} /> Elegir Archivo
              </div>
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button onClick={handleUploadFile} className="btn-upload">
                Cargar Productos
              </button>
              <a href="/TEMPLATE CODIGOS BARRA Y ITEM.xlsx" download="TEMPLATE CODIGOS BARRA Y ITEM.xlsx">
                <button className="tomato-button">Descargar Template</button>
              </a>
            </div>

            <button
              onClick={handleDeleteSelected}
              className="btn-delete"
              disabled={!productos.some((producto) => producto.selected)}
            >
              Eliminar Seleccionados
            </button>
          </div>

          {/* Filtro de productos */}
          <div className="filter-section">
            <input
              type="text"
              placeholder="Filtrar productos"
              value={filter}
              onChange={(e) => setFilter(e.target.value)} // Actualizar el estado del filtro
              className="filter-input"
            />
          </div>

          <h2>Lista de Productos</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setProductos((prevProductos) =>
                          prevProductos.map((producto) => ({
                            ...producto,
                            selected: isChecked,
                          }))
                        );
                      }}
                    />
                  </th>
                  <th>Código Item</th>
                  <th>Código Barra SAP</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={producto.selected || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setProductos((prevProductos) =>
                            prevProductos.map((p) =>
                              p.id === producto.id ? { ...p, selected: isChecked } : p
                            )
                          );
                        }}
                      />
                    </td>
                    <td>{producto.cod_Item}</td>
                    <td>{producto.cod_Barra_Sap}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => handleEdit(producto.id)}
                        className="icon-edit"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Anterior
            </button>
            <button onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>

          {showModal && productoEditar && (
            <div className="modal">
              <div className="modal-content">
                <h2>{productoEditar.id ? "Editar Producto" : "Nuevo Producto"}</h2>
                <form onSubmit={handleSaveProducto}>
                  <label>Código Item</label>
                  <input
                    type="text"
                    name="cod_Item"
                    value={productoEditar.cod_Item}
                    onChange={handleInputChange}
                  />
                  <label>Código Barra SAP</label>
                  <input
                    type="text"
                    name="cod_Barra_Sap"
                    value={productoEditar.cod_Barra_Sap}
                    onChange={handleInputChange}
                  />
                  <div className="modal-actions">
                    <button type="submit" className="btn-save">
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleCloseModal}
                    >
                      Cancelar
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

export default FybecaMantenimientoProducto; 