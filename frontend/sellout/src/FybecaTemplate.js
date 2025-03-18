import React, { useEffect, useState } from "react";
import "./css/fybeca.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importar Font Awesome
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importar Font Awesome
import * as XLSX from 'xlsx'; // Importar la librería XLSX
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { useRef } from "react";  // Para manejar referencias en el Toast
import "primereact/resources/themes/lara-light-indigo/theme.css";  // Tema de PrimeReact
import "primereact/resources/primereact.min.css";  // Estilos base
import "primeicons/primeicons.css"; // Iconos
import { ProgressSpinner } from 'primereact/progressspinner';

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
  const [year, setYear] = useState(new Date().getFullYear()); // Por defecto, el año actual
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Por defecto, el mes actual
  const [data, setData] = useState(null); 
  const [ciudades, setCiudades] = useState({});

  //Funcion para sacar reportes 
  const toast = useRef(null);

  // Estados
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState("");

  // Función para generar el reporte Ranquin Ventas
  const generarReporteRanquinVentas = async () => {
    setLoadingReporte(true);
    setErrorReporte("");

    try {
      const response = await fetch("http://localhost:8080/api/ventas/reporte-ranquin-ventas");
      if (!response.ok) throw new Error("Error al obtener el reporte Ranquin Ventas");

      const data = await response.json();
      if (!data.length) {
        setErrorReporte("No hay datos disponibles para el reporte.");
        return;
      }

      // Crear hoja de Excel con los datos obtenidos
      const ws = XLSX.utils.json_to_sheet(
        data.map(row => ({
          "Código PDV": row[0],
          "PDV": row[1],
          "Ciudad": row[2],
          "Tipo Display Essence": row[3],
          "Tipo Mueble Display Catrice": row[4],
          "Total Unidades Mes": row[5],
          "Promedio Mes": row[6],
          "Unidades Diarias": row[7],
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte Ranquin Ventas");

      // Descargar el archivo Excel
      XLSX.writeFile(wb, "Reporte_Ranquin_Ventas.xlsx");

    } catch (error) {
      setErrorReporte(error.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const downloadVentasReport = async () => {
    setLoadingVentas(true); // Establece el estado de carga
  
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/reporte-ventas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al descargar el reporte de ventas");
      }
  
      const reportData = await response.blob(); // Obtener el reporte en formato blob
  
      // Crea un enlace de descarga
      const link = document.createElement("a");
      link.href = URL.createObjectURL(reportData); // Crea una URL para el archivo
      link.download = "reporte_ventas.xlsx"; // Nombre del archivo de descarga
      link.click(); // Simula un clic para iniciar la descarga
    } catch (error) {
      setErrorVentas(error.message); // Maneja el error si ocurre
    } finally {
      setLoadingVentas(false); // Desactiva la carga
    }
  };
  

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
      const response = await fetch("http://localhost:8082/api/fybeca/ventas-forma-masiva", {
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
      await loadVentas(); // 🔄 Recargar ventas después de la eliminación
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
  const loadVentas = async (page = 1, year = "", month = "") => {
    setLoadingVentas(true);
    setErrorVentas("");
    try {
      // Construir la URL con template literal
      let url = `http://localhost:8082/api/fybeca/venta?page=${page}&size=${itemsPerPage}`;
      if (year) {
        url += `&year=${year}`;
      }
      if (month) {
        url += `&month=${month}`;
      }
      const response = await fetch(url);
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
  const totalPages = Math.ceil(ventas.total / itemsPerPage); // Asegúrate de que ventas.total sea el total de las ventas

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
      const response = await fetch("http://localhost:8082/api/fybeca/marcas-ventas");
      if (!response.ok)
        throw new Error(`Error al cargar marcas: ${response.statusText}`);
      const data = await response.json();
      setMarcas(data);
    } catch (error) {
      setErrorVentas(error.message);
    }
    // Llamada a la API con el año y mes como parámetros
    fetch(`/api/tu-endpoint?year=${year}&month=${month}`)
  .then((response) => response.json())
  .then((data) => setData(data))
  .catch((error) => console.error('Error al cargar los datos:', error));
  };

  // Función para cargar el template de ventas
  const cargarTemplate = async (file) => {
    setLoadingTemplate(true); // Activar el spinner
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8082/api/fybeca/subir-archivo-venta", {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`Error al cargar el archivo: ${response.statusText}`);

      const message = await response.text();
      setSuccessMessage(message);
      await loadVentas(); // 🔄 Recargar ventas después de la subida
    } catch (error) {
      setErrorVentas(error.message);
    } finally {
      setLoadingTemplate(false); // Desactivar el spinner después de completar la carga
    }
  };

  // Función para eliminar una venta
  const eliminarVenta = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/venta/${id}`, {
        method: "DELETE",
      });

      if (!response.ok)
        throw new Error(`Error al eliminar la venta: ${response.statusText}`);

      setSuccessMessage("Venta eliminada correctamente.");
      await loadVentas(); // 🔄 Recargar ventas después de la eliminación
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

      if (!response.ok)throw new Error(`Error al actualizar la venta: ${response.statusText}`);

      setEditVenta(null);
      await loadVentas(); // 🔄 Recargar ventas después de la actualización
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Venta actualizada correctamente.',
          life: 3000,
        });
      }
    } catch (error) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
          life: 3000,
        });
      }
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
  // Solo cargar marcas al montar el componente
  useEffect(() => {
    loadMarcas();
    console.log("Toast está listo:", toast.current);
  }, [year, month]); 
  
  
  // Suponiendo que itemsPerPage y currentPage ya están definidos:
const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedVentas = filteredVentas.slice(startIndex, startIndex + itemsPerPage);

  // Función para exportar los datos a XLSX
  const exportToXLSX = () => {
    const filteredVentas = ventas.filter((venta) => {
      const matchesFilter = Object.values(venta).some((value) =>
        value.toString().toLowerCase().includes(filter.toLowerCase())
      );
      const matchesYear = filterYear ? venta.anio.toString() === filterYear : true;
      const matchesMonth = filterMonth ? venta.mes.toString() === filterMonth : true;
      const matchesMarca = filterMarca ? venta.marca === filterMarca : true;
      return matchesFilter && matchesYear && matchesMonth && matchesMarca;
    });

    const exportData = filteredVentas.map((venta) => ({
      Año: venta.anio,
      Mes: venta.mes,
      Dia: venta.dia,
      Marca: venta.marca,
      "Cliente ID": venta.mantenimientoCliente ? venta.mantenimientoCliente.cod_Cliente : "N/A",
      "Nombre Cliente": venta.mantenimientoCliente ? venta.mantenimientoCliente.nombre_Cliente : "N/A",
      "Código Barra SAP": venta.codBarra,
      "Código Producto SAP": venta.codigo_Sap,
      "Código Item": venta.mantenimientoProducto ? venta.mantenimientoProducto.cod_Item : "N/A",
      "Nombre Producto": venta.nombre_Producto,
      "Código PDV": venta.cod_Pdv,
      Ciudad: venta.mantenimientoCliente ? venta.mantenimientoCliente.ciudad : "N/A",
      PDV: venta.pdv,
      "Stock en Dólares": venta.stock_Dolares.toFixed(2),
      "Stock en Unidades": venta.stock_Unidades,
      "Venta en Dólares": venta.venta_Dolares.toFixed(2),
      "Venta en Unidades": venta.venta_Unidad,
    }));
    
    // Crea el archivo XLSX
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");

    // Exporta el archivo
    XLSX.writeFile(wb, "Ventas_Fybeca.xlsx");
  };

  // Función para cargar las ciudades desde el API
  const loadCiudades = async () => {
    try {
        const response = await fetch("http://localhost:8082/api/fybeca/ciudades-ventas");
        if (!response.ok) throw new Error("Error al cargar las ciudades");
        const data = await response.json();
        setCiudades(data);
    } catch (error) {
        console.error("Error en loadCiudades:", error);
    }
};

  return (
    <div className="container">
      <h1>Ventas Fybeca</h1>
      <Toast ref={toast} className="custom-toast" />
  
      {/* Mostrar mensajes */}
      {errorVentas && <p className="error">{errorVentas}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
  
      <h2>Ventas</h2>
  
      {/* Spinner para carga de archivos */}
      {loadingTemplate && (
        <div className="overlay">
          <div className="spinner-container">
            <ProgressSpinner
              style={{ width: "70px", height: "70px" }}
              strokeWidth="8"
              animationDuration="0.7s"
            />
            <p>Subiendo archivo...</p>
          </div>
        </div>
      )}
  
      {/* Sección de carga y reportes */}
      <section className="upload-section">
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
  
        <a href="/TEMPLATE VENTAS FYBECA.xlsx" download="TEMPLATE VENTAS FYBECA.xlsx">
          <button className="btn-template">Descargar Template</button>
        </a>
        {/* Botón para generar el reporte */}
        <button onClick={generarReporteRanquinVentas} disabled={loadingReporte}>
          {loadingReporte ? "Generando..." : "Generar Reporte Ranquin Ventas"}
        </button>
        <button onClick={downloadVentasReport} disabled={loadingVentas}>
          {loadingVentas ? "Cargando..." : "Descargar Reporte de Ventas"}
        </button>
      </section>
  
      {/* Filtros */}
      <section className="filter-section">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">Selecciona un año</option>
          {[...new Set(ventas.map((venta) => venta.anio))].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
  
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">Selecciona un mes</option>
          {[...new Set(ventas.map((venta) => venta.mes))].map((month) => (
            <option key={month} value={month}>{monthNames[month - 1]}</option>
          ))}
        </select>
  
        <select value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map((marca) => (
            <option key={marca} value={marca}>{marca}</option>
          ))}
        </select>
  
        <input
          type="text"
          placeholder="Filtrar ventas"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
  
        <button onClick={() => loadVentas(1, filterYear, filterMonth)}>Filtrar Ventas</button>
      </section>
  
      {/* Acciones */}
      <section className="actions-section">
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
      </section>
  
      {/* Tabla de Ventas */}
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
              <th>Dia</th>
              <th>Marca</th>
              <th>Cliente ID</th>
              <th>Nombre Cliente</th>
              <th>Código Barra SAP</th>
              <th>Código Producto SAP</th>
              <th>Código Item</th>
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
            {paginatedVentas.map((venta) => (
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
                <td>{venta.dia}</td>
                <td>{venta.marca}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.cod_Cliente : "N/A"}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.nombre_Cliente : "N/A"}</td>
                <td>{venta.codBarra}</td>
                <td>{venta.codigo_Sap}</td>
                <td>{venta.mantenimientoProducto ? venta.mantenimientoProducto.cod_Item : "N/A"}</td>
                <td>{venta.nombre_Producto}</td>
                <td>{venta.cod_Pdv}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.ciudad : "N/A"}</td>
                <td>{venta.pdv}</td>
                <td>{venta.stock_Dolares.toFixed(2)}</td>
                <td>{venta.stock_Unidades}</td>
                <td>{venta.venta_Dolares.toFixed(2)}</td>
                <td>{venta.venta_Unidad}</td>
                <td>
                  <button className="btn-crud" onClick={() => setEditVenta(venta)} title="Editar">
                    <i className="fas fa-pencil-alt"></i>
                  </button>
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
              <label>Dia:</label>
              <input
                type="number"
                name="dia"
                value={editVenta.dia}
                onChange={(e) => setEditVenta({ ...editVenta, dia: e.target.value })} 
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