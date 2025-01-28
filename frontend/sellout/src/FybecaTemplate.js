import React, { useEffect, useState } from "react";
import "./css/fybeca.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importar Font Awesome

const Fybeca = () => {
  const [ventas, setVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editVenta, setEditVenta] = useState(null);
  const [filter, setFilter] = useState(""); // Estado para almacenar el filtro
  const [filterYear, setFilterYear] = useState(""); // Estado para almacenar el filtro de año
  const [filterMonth, setFilterMonth] = useState(""); // Estado para almacenar el filtro de mes
  const [filterMarca, setFilterMarca] = useState(""); // Estado para almacenar el filtro de marca
  const [marcas, setMarcas] = useState([]); // Estado para almacenar las marcas disponibles
  const [selectedVentas, setSelectedVentas] = useState([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  //Funcion para eliminar de forma masiva la informacion 
  const handleSelectVenta = (id) => {
    setSelectedVentas((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((ventaId) => ventaId !== id)
        : [...prevSelected, id]
    );
  };
  
  const handleDeleteSelected = async () => {
    if (selectedVentas.length === 0) {
      alert("No hay ventas seleccionadas para eliminar.");
      return;
    }
  
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar ${selectedVentas.length} venta(s)?`
    );
    if (!confirmDelete) return;
  
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/eliminar-ventas-forma-masiva", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedVentas),
      });
  
      if (!response.ok) {
        throw new Error("Error al eliminar las ventas");
      }
  
      alert("Ventas eliminadas correctamente.");
      // Actualiza la lista de ventas después de eliminar
      loadVentas();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar las ventas");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVentas(ventas.map((venta) => venta.id));
    } else {
      setSelectedVentas([]);
    }
  };
  // Función para cargar las ventas desde la API
  const loadVentas = async (page = 1) => {
    setLoadingVentas(true);
    setErrorVentas("");
    try {
      const response = await fetch(
        `http://localhost:8082/api/fybeca/ventas?page=${page}&size=${itemsPerPage}`
      );
      if (!response.ok) throw new Error("Error al cargar ventas");
      const data = await response.json();
      setVentas(data);
    } catch (error) {
      setErrorVentas(error.message);
    } finally {
      setLoadingVentas(false);
    }
  };
  
  // Actualiza la página actual al cambiarla:
  // Función para cambiar de página
  const handlePageChange = (page) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };
    
// Renderizado de los botones de paginación
const renderPagination = () => {
  const totalPages = Math.ceil(ventas.total / itemsPerPage); // Asegúrate de que `ventas.total` sea el total de las ventas

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        className={i === currentPage ? 'active' : ''}
      >
        {i}
      </button>
    );
  }

  return <div className="pagination">{pageNumbers}</div>;
};
  // Función para cargar las marcas disponibles desde la API
  const loadMarcas = async () => {
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/marcas-ventas"); // Ajusta la URL del API
      if (!response.ok) throw new Error(`Error al cargar marcas: ${response.statusText}`);
      const data = await response.json();
      setMarcas(data);
    } catch (error) {
      setErrorVentas(error.message);
    }
  };

  // Función para cargar el template de ventas
  const cargarTemplate = async (file) => {
    setLoadingTemplate(true); // Activar la carga
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8082/api/fybeca/subir-archivo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Error al cargar el archivo: ${response.statusText}`);

      const message = await response.text();
      setSuccessMessage(message);
      loadVentas(); // Recargar las ventas después de subir el archivo
    } catch (error) {
    setErrorVentas(error.message);
  } finally {
    setLoadingTemplate(false); // Desactivar la carga
  }
  };

  // Función para eliminar una venta
  const eliminarVenta = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/venta/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Error al eliminar la venta: ${response.statusText}`);

      setSuccessMessage("Venta eliminada correctamente.");
      loadVentas(); // Recargar las ventas después de eliminar
    } catch (error) {
      setErrorVentas(error.message);
    }
  };

  // Función para actualizar una venta
  const actualizarVenta = async (venta) => {
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/venta/${venta.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venta),
      });

      if (!response.ok) throw new Error(`Error al actualizar la venta: ${response.statusText}`);

      setSuccessMessage("Venta actualizada correctamente.");
      setEditVenta(null);
      loadVentas(); // Recargar las ventas después de actualizar
    } catch (error) {
      setErrorVentas(error.message);
    }
  };

  //Manekar el estado de paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1000; // Número de elementos por página

  const [filters, setFilters] = useState({
    search: "",
    year: "",
    month: "",
    brand: "",
  });
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  
  // Filtrar ventas por el filtro ingresado y por año, mes y marca
  const filteredVentas = ventas.filter((venta) => {
    const matchesFilter = Object.values(venta).some((value) =>
      value.toString().toLowerCase().includes(filter.toLowerCase())
    );
    const matchesYear = filterYear ? venta.anio.toString() === filterYear : true;
    const matchesMonth = filterMonth ? venta.mes.toString() === filterMonth : true;
    const matchesMarca = filterMarca ? venta.marca === filterMarca : true;
    return matchesFilter && matchesYear && matchesMonth && matchesMarca;
  });
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  // Cargar las ventas y las marcas al montar el componente
  useEffect(() => {
    loadVentas(currentPage);
    loadMarcas();
  }, [currentPage]);

  return (
    <div className="container">
      <h1>Ventas Fybeca</h1>

      {errorVentas && <p className="error">{errorVentas}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <h2>Ventas</h2>

      <div className="upload-section">
        <label htmlFor="fileInput" className="file-upload-label">
          <i className="fas fa-file-upload"></i> Elegir Archivo
        </label>
        <input
          type="file"
          id="fileInput"
          accept=".csv, .xlsx"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              cargarTemplate(e.target.files[0]);
            }
          }}
          style={{ display: "none" }}
        />
        {/* Input para filtrar las ventas */}
        <input
          type="text"
          placeholder="Filtrar ventas"
          value={filter}
          onChange={(e) => setFilter(e.target.value)} // Actualizar el estado del filtro
        />
        {/* Selectores para filtrar por año, mes y marca */}
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">Todos los años</option>
          {[...new Set(ventas.map((venta) => venta.anio))].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">Todos los meses</option>
          {[...new Set(ventas.map((venta) => venta.mes))].map((month) => (
            <option key={month} value={month}>
            {monthNames[month - 1]} {/* Restamos 1 porque los índices del arreglo empiezan en 0 */}
          </option>
          ))}
        </select>
        <select value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map((marca) => (
            <option key={marca} value={marca}>
              {marca}
            </option>
          ))}
        </select>
        <a href="/TEMPLATE VENTAS FYBECA.xlsx" download="TEMPLATE VENTAS FYBECA.xlsx">
          <button className="btn-template">Descargar Template</button>
        </a>
      </div>
      <div className="actions-section">
        <span
          className={`delete-icon ${selectedVentas.length === 0 ? 'icon-disabled' : 'icon-enabled'}`}
          onClick={selectedVentas.length > 0 ? handleDeleteSelected : null}
          title="Eliminar Seleccionados"
        >
          <i className="fas fa-trash-alt"></i> Eliminar
        </span>
        {selectedVentas.length > 0 && (
          <span className="selected-rows">
            Filas seleccionadas: {selectedVentas.length}
          </span>
        )}
      </div>
                  
      {loadingVentas ? (
        <p className="loading">Cargando ventas...</p>
      ) : filteredVentas.length === 0 ? (
        <p>No hay ventas disponibles.</p>
      ) : (
        
        <table>
          <thead>
            <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedVentas.length === ventas.length}
              />
            </th>
              <th>Año</th>
              <th>Mes</th>
              <th>Marca</th>
              <th>Cliente ID</th>
              <th>Nombre Cliente</th>
              <th>Código Barra SAP</th>
              <th>Código Producto SAP</th>
              <th>Código Item</th> {/* Cambiado a Código Item */}
              <th>Nombre Producto</th>
              <th>Código PDV</th>
              <th>Ciudad</th>
              <th>PDV</th>
              <th>Stock en Dólares</th>
              <th>Stock en Unidades</th>
              <th>Venta en Dólares</th>
              <th>Venta en Unidades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVentas.map((venta) => (
              <tr key={venta.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedVentas.includes(venta.id)}
                    onChange={() => handleSelectVenta(venta.id)}
                    
                  />
                </td>
                <td>{venta.anio}</td>
                <td>{venta.mes}</td>
                <td>{venta.marca}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.cod_Cliente : "N/A"}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.nombre_Cliente : "N/A"}</td>
                <td>{venta.codBarra}</td>
                <td>{venta.codigo_Sap}</td>
                <td>{venta.mantenimientoProducto ? venta.mantenimientoProducto.cod_Item : "N/A"}</td> {/* Mostrar Código Item */}
                <td>{venta.nombre_Producto}</td>
                <td>{venta.cod_Pdv}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.ciudad : "N/A"}</td>
                <td>{venta.pdv}</td>
                <td>{venta.stock_Dolares.toFixed(2)}</td>
                <td>{venta.stock_Unidades}</td>
                <td>{venta.venta_Dolares.toFixed(2)}</td>
                <td>{venta.venta_Unidad}</td>
                <td>
                  {/* Botón para editar con ícono de lápiz */}
                  <button className="btn-crud" onClick={() => setEditVenta(venta)} title="Editar">
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                  {/* Botón para eliminar con ícono de basurero */}
                  <button className="btn-crud" onClick={() => eliminarVenta(venta.id)} title="Eliminar">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      )}

      {editVenta && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Venta</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                actualizarVenta(editVenta);
              }}
            >
              <label>ID Venta:</label>
              <input
                type="number"
                name="id"
                value={editVenta.id}
                readOnly
              />
              <label>Año:</label>
              <input
                type="number"
                name="anio"
                value={editVenta.anio}
                onChange={(e) => setEditVenta({ ...editVenta, anio: e.target.value })} 
              />
              <label>Mes:</label>
              <input
                type="number"
                name="mes"
                value={editVenta.mes}
                onChange={(e) => setEditVenta({ ...editVenta, mes: e.target.value })} 
              />
              <label>Marca:</label>
              <input
                type="text"
                name="marca"
                value={editVenta.marca}
                onChange={(e) => setEditVenta({ ...editVenta, marca: e.target.value })} 
              />
              <label>Venta en Dólares:</label>
              <input
                type="number"
                name="venta_Dolares"
                value={editVenta.venta_Dolares}
                onChange={(e) => setEditVenta({ ...editVenta, venta_Dolares: e.target.value })} 
              />
              <label>Venta en Unidades:</label>
              <input
                type="number"
                name="venta_Unidad"
                value={editVenta.venta_Unidad}
                onChange={(e) => setEditVenta({ ...editVenta, venta_Unidad: e.target.value })} 
              />
              <label>Cliente ID:</label>
              <input
                type="text"
                name="cod_Cliente"
                value={editVenta.mantenimientoCliente ? editVenta.mantenimientoCliente.cod_Cliente : ""}
                onChange={(e) => setEditVenta({ ...editVenta, mantenimientoCliente: { ...editVenta.mantenimientoCliente, cod_Cliente: e.target.value } })} 
              />
              <label>Nombre Cliente:</label>
              <input
                type="text"
                name="nombre_Cliente"
                value={editVenta.mantenimientoCliente ? editVenta.mantenimientoCliente.nombre_Cliente : ""}
                onChange={(e) => setEditVenta({ ...editVenta, mantenimientoCliente: { ...editVenta.mantenimientoCliente, nombre_Cliente: e.target.value } })} 
              />
              <label>Ciudad:</label>
              <input
                type="text"
                name="ciudad"
                value={editVenta.mantenimientoCliente ? editVenta.mantenimientoCliente.ciudad : ""}
                onChange={(e) => setEditVenta({ ...editVenta, mantenimientoCliente: { ...editVenta.mantenimientoCliente, ciudad: e.target.value } })} 
              />
              <label>Producto ID:</label>
              <input
                type="text"
                name="producto_id"
                value={editVenta.mantenimientoProducto ? editVenta.mantenimientoProducto.id : ""}
                readOnly
              />
              <label>Nombre Producto:</label>
              <input
                type="text"
                name="nombre_Producto"
                value={editVenta.nombre_Producto}
                onChange={(e) => setEditVenta({ ...editVenta, nombre_Producto: e.target.value })} 
              />
              <label>Código SAP:</label>
              <input
                type="text"
                name="codigo_Sap"
                value={editVenta.codigo_Sap}
                onChange={(e) => setEditVenta({ ...editVenta, codigo_Sap: e.target.value })} 
              />
              <label>Código de Barra:</label>
              <input
                type="text"
                name="cod_Barra"
                value={editVenta.codBarra}
                onChange={(e) => setEditVenta({ ...editVenta, cod_Barra: e.target.value })} 
              />
              <label>Código PDV:</label>
              <input
                type="text"
                name="cod_Pdv"
                value={editVenta.cod_Pdv}
                onChange={(e) => setEditVenta({ ...editVenta, cod_Pdv: e.target.value })} 
              />
              <label>Descripción:</label>
              <input
                type="text"
                name="descripcion"
                value={editVenta.descripcion}
                onChange={(e) => setEditVenta({ ...editVenta, descripcion: e.target.value })} 
              />
              <label>PDV:</label>
              <input
                type="text"
                name="pdv"
                value={editVenta.pdv}
                onChange={(e) => setEditVenta({ ...editVenta, pdv: e.target.value })} 
              />
              <label>Stock en Dólares:</label>
              <input
                type="number"
                name="stock_Dolares"
                value={editVenta.stock_Dolares}
                onChange={(e) => setEditVenta({ ...editVenta, stock_Dolares: e.target.value })} 
              />
              <label>Stock en Unidades:</label>
              <input
                type="number"
                name="stock_Unidades"
                value={editVenta.stock_Unidades}
                onChange={(e) => setEditVenta({ ...editVenta, stock_Unidades: e.target.value })} 
              />
              <label>Código Item:</label>
              <input
                type="text"
                name="cod_Item"
                value={editVenta.mantenimientoProducto ? editVenta.mantenimientoProducto.cod_Item : ""}
                onChange={(e) => setEditVenta({ ...editVenta, mantenimientoProducto: { ...editVenta.mantenimientoProducto, cod_Item: e.target.value } })} 
              />
              <label>Código Barra SAP:</label>
              <input
                type="text"
                name="cod_Barra_Sap"
                value={editVenta.mantenimientoProducto ? editVenta.mantenimientoProducto.cod_Barra_Sap : ""}
                onChange={(e) => setEditVenta({ ...editVenta, mantenimientoProducto: { ...editVenta.mantenimientoProducto, cod_Barra_Sap: e.target.value } })} 
              />
              <button type="submit" className="btn-crud">Guardar Cambios</button>
              <button type="button" className="btn-crud" onClick={() => { setEditVenta(null); loadVentas(); }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fybeca;