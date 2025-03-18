import React, { useEffect, useState, useRef } from "react";
import "./css/fybeca.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importar Font Awesome
import { ProgressSpinner } from 'primereact/progressspinner';

const FybecaTipoMueble = () => {
  const [tipoMuebles, setTipoMuebles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editTipoMueble, setEditTipoMueble] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredTipoMuebles, setFilteredTipoMuebles] = useState([]);
  const [filterTipoDisplayEssence, setFilterTipoDisplayEssence] = useState("");
  const [filterTipoMuebleDisplayCatrice, setFilterTipoMuebleDisplayCatrice] = useState("");
  const fileInputRef = useRef(null);

  //funcion para el progress spiner
  const [loadingUpload, setLoadingUpload] = useState(false);

  // Función para cargar los tipos de mueble desde la API
  const loadTipoMuebles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/tipo-mueble");
      if (!response.ok) throw new Error(`Error al cargar tipos de mueble: ${response.statusText}`);

      const data = await response.json();
      setTipoMuebles(data);
      setFilteredTipoMuebles(data); // Mantener filtrado sincronizado
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un nuevo tipo de mueble
  const crearTipoMueble = async (tipoMueble) => {
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/tipo-mueble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tipoMueble),
      });
  
      if (!response.ok) throw new Error(`Error al crear tipo de mueble: ${response.statusText}`);
  
      setSuccessMessage("Tipo de mueble creado correctamente.");
      await loadTipoMuebles(); // 🔄 Recargar la lista
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  // Función para actualizar un tipo de mueble
  const actualizarTipoMueble = async (tipoMueble) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/tipo-mueble/${tipoMueble.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",},
        body: JSON.stringify(tipoMueble),
      });

      if (!response.ok) throw new Error(`Error al actualizar tipo de mueble: ${response.statusText}`);

      const tipoMuebleActualizado = await response.json();
      const updatedTipoMuebles = tipoMuebles.map((tm) => (tm.id === tipoMuebleActualizado.id ? tipoMuebleActualizado : tm));
      setTipoMuebles(updatedTipoMuebles);
      setFilteredTipoMuebles(updatedTipoMuebles);
      setSuccessMessage("Tipo de mueble actualizado correctamente.");
      setEditTipoMueble(null);
      await loadTipoMuebles(); // 🔄 Recargar la lista
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para manejar la selección de una fila
  const handleSelect = (id) => {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(id)) {
        return prevSelectedIds.filter((selectedId) => selectedId !== id); // Desmarcar la casilla
      } else {
        return [...prevSelectedIds, id]; // Marcar la casilla
      }
    });
  };

  // Función para manejar la selección/deselección de todas las filas
  const handleSelectAll = () => {
    if (selectedIds.length === filteredTipoMuebles.length) {
      setSelectedIds([]); // Si ya están todos seleccionados, desmarcar
    } else {
      setSelectedIds(filteredTipoMuebles.map((tm) => tm.id)); // Seleccionar todos
    }
  };

  // Función para eliminar los tipos de muebles seleccionados
    // Función para eliminar los tipos de muebles seleccionados
    const eliminarTipoMueblesSeleccionados = async () => {
      if (selectedIds.length === 0) {
        alert("No hay tipos de muebles seleccionados para eliminar.");
        return;
      }
  
      const confirmDelete = window.confirm(`¿Estás seguro de eliminar ${selectedIds.length} tipo(s) de mueble?`);
      if (!confirmDelete) return;
  
      setLoading(true); // Activar spinner antes de eliminar
  
      // Dividir en lotes de 2000
      const batchSize = 2000;
      const batches = [];
      for (let i = 0; i < selectedIds.length; i += batchSize) {
        batches.push(selectedIds.slice(i, i + batchSize));
      }
  
      try {
        for (const batch of batches) {
          const response = await fetch("http://localhost:8082/api/fybeca/eliminar-varios-tipo-mueble", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batch),
          });
  
          if (!response.ok) throw new Error(`Error al eliminar: ${response.statusText}`);
        }
  
        alert("Tipos de muebles eliminados correctamente.");
        await loadTipoMuebles();
        setSelectedIds([]); // Limpiar la selección
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };


  // Función para eliminar un tipo de mueble
  const eliminarTipoMueble = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/fybeca/tipo-mueble/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Error al eliminar tipo de mueble: ${response.statusText}`);

      const updatedTipoMuebles = tipoMuebles.filter((tm) => tm.id !== id);
      setTipoMuebles(updatedTipoMuebles);
      setFilteredTipoMuebles(updatedTipoMuebles);
      setSuccessMessage("Tipo de mueble eliminado correctamente.");
      await loadTipoMuebles(); // 🔄 Recargar la lista después de eliminar
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para subir un archivo XLSX
  const subirArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingUpload(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8082/api/fybeca/template-tipo-muebles", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Error al subir archivo: ${response.statusText}`);

      setSuccessMessage("Archivo subido correctamente.");
      await loadTipoMuebles();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingUpload(false);
    }
  };
  

  // Función para manejar el cambio en el campo de entrada del filtro
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Función para aplicar el filtro
  const applyFilter = () => {
    const filtered = tipoMuebles.filter((tipoMueble) => {
      const searchTerm = filter.toLowerCase();
      return (
        (filter === "" || tipoMueble.cod_Pdv.toLowerCase().includes(searchTerm) ||
        tipoMueble.nombre_Pdv.toLowerCase().includes(searchTerm) ||
        (tipoMueble.mantenimientoCliente && (
          tipoMueble.mantenimientoCliente.cod_Cliente.toLowerCase().includes(searchTerm) ||
          tipoMueble.mantenimientoCliente.nombre_Cliente.toLowerCase().includes(searchTerm) ||
          tipoMueble.ciudad.toLowerCase().includes(searchTerm)
        ))) &&
        (filterTipoDisplayEssence === "" || tipoMueble.tipo_Display_Essence === filterTipoDisplayEssence) &&
        (filterTipoMuebleDisplayCatrice === "" || tipoMueble.tipo_Mueble_Display_Catrice === filterTipoMuebleDisplayCatrice)
      );
    });
  
    setFilteredTipoMuebles(filtered);
  };
  

  // Función para limpiar los filtros
  const clearFilters = () => {
    setFilter("");
    setFilterTipoDisplayEssence("");
    setFilterTipoMuebleDisplayCatrice("");
    setFilteredTipoMuebles(tipoMuebles);
  };

  // Cargar los tipos de mueble al montar el componente
  useEffect(() => {
    loadTipoMuebles();
  }, []);

  // Función para descargar el reporte
  const descargarReporte = async () => {
    try {
      // Hacer la solicitud GET a la API
      const response = await fetch("http://localhost:8082/api/fybeca/reporte-tipo-mueble", {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // Si la API devuelve un archivo, este puede no ser necesario
        },
      });
  
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error al descargar reporte: ${response.statusText}`);
      }
  
      // Obtener el nombre del archivo desde la cabecera o respuesta
      const contentDisposition = response.headers.get("Content-Disposition");
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "reporte_mantenimiento_productos.xlsx"; // Nombre por defecto si no se encuentra en las cabeceras
  
      // Crear un Blob a partir de la respuesta (que se espera sea un archivo binario)
      const blob = await response.blob();
  
      // Crear un enlace temporal para realizar la descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;  // Establecer el nombre del archivo a descargar
      document.body.appendChild(a);
      a.click();  // Simular el clic para iniciar la descarga
      a.remove();  // Limpiar el enlace temporal
  
      // Liberar el URL creado
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Manejar errores
      console.error(`Error al descargar el reporte: ${error.message}`);
      alert(`Error al descargar el reporte: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Tipos de Mueble Fybeca</h1>

      {/* Mensajes de error y éxito */}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <h2>Tipos de Mueble</h2>

      {/* Spinner de carga global */}
      {loadingUpload && (
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

      {/* Botones de acciones */}
      <section className="action-buttons">
        <button onClick={eliminarTipoMueblesSeleccionados} disabled={selectedIds.length === 0}>
          Eliminar Seleccionados
        </button>
        <button onClick={descargarReporte} className="btn-download-reporte">
          Descargar Reporte
        </button>
      </section>

      {/* Sección de subida de archivos */}
      <section className="upload-section">
        <button onClick={() => setEditTipoMueble({ id: null, cod_Pdv: "", nombre_Pdv: "", tipo_Display_Essence: "", tipo_Mueble_Display_Catrice: "", cliente: { cod_Cliente: "", nombre_Cliente: "", ciudad: "" } })}>
          Crear Tipo de Mueble
        </button>

        <div className="file-upload" onClick={() => fileInputRef.current.click()}>
          <i className="fas fa-file-upload"></i> Elegir Archivo
        </div>

        <input type="file" accept=".xlsx" onChange={subirArchivo} ref={fileInputRef} style={{ display: "none" }} />

        <a href="/TEMPLATE DE TIPO DE MUEBLE.xlsx" download className="btn-download">
          Descargar Template
        </a>
      </section>

      {/* Filtros */}
      <section className="filter-section">
        <label htmlFor="filter">Filtrar:</label>
        <input type="text" id="filter" value={filter} onChange={handleFilterChange} />

        <label htmlFor="filterTipoDisplayEssence">Tipo Display Essence:</label>
        <select id="filterTipoDisplayEssence" value={filterTipoDisplayEssence} onChange={(e) => setFilterTipoDisplayEssence(e.target.value)}>
          <option value="">Todos</option>
          {Array.from(new Set(tipoMuebles.map((tm) => tm.tipo_Display_Essence))).map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>

        <label htmlFor="filterTipoMuebleDisplayCatrice">Tipo Mueble Display Catrice:</label>
        <select id="filterTipoMuebleDisplayCatrice" value={filterTipoMuebleDisplayCatrice} onChange={(e) => setFilterTipoMuebleDisplayCatrice(e.target.value)}>
          <option value="">Todos</option>
          {Array.from(new Set(tipoMuebles.map((tm) => tm.tipo_Mueble_Display_Catrice))).map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>

        <div className="filter-buttons">
          <button onClick={applyFilter}>Aplicar Filtro</button>
          <button onClick={clearFilters} className="btn-clear-filters">
            <i className="fas fa-times-circle"></i> Limpiar Filtros
          </button>
        </div>
      </section>
      {loading ? (
        <p className="loading">Cargando tipos de mueble...</p>
      ) : filteredTipoMuebles.length === 0 ? (
        <p>No hay tipos de mueble disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
            <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredTipoMuebles.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Código Cliente</th>
              <th>Nombre Cliente</th>
              <th>Ciudad</th>
              <th>Código PDV</th>
              <th>Nombre PDV</th>
              <th>Tipo Display Essence</th>
              <th>Tipo Mueble Display Catrice</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTipoMuebles.map((tipoMueble) => (
              <tr key={tipoMueble.id}>
                 <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tipoMueble.id)}
                    onChange={() => handleSelect(tipoMueble.id)}
                  />
                </td>
                <td>{tipoMueble.mantenimientoCliente ? tipoMueble.mantenimientoCliente.cod_Cliente : "N/A"}</td>
                <td>{tipoMueble.mantenimientoCliente ? tipoMueble.mantenimientoCliente.nombre_Cliente : "N/A"}</td>
                <td>{tipoMueble.ciudad}</td>
                <td>{tipoMueble.cod_Pdv}</td>
                <td>{tipoMueble.nombre_Pdv}</td>
                <td>{tipoMueble.tipo_Display_Essence}</td>
                <td>{tipoMueble.tipo_Mueble_Display_Catrice}</td>
                <td>
                  <button className="btn-crud" onClick={() => setEditTipoMueble(tipoMueble)} title="Editar">
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                  <button className="btn-crud" onClick={() => eliminarTipoMueble(tipoMueble.id)} title="Eliminar">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editTipoMueble && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editTipoMueble.id ? "Editar Tipo de Mueble" : "Crear Tipo de Mueble"}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editTipoMueble.id) {
                  actualizarTipoMueble(editTipoMueble);
                } else {
                  crearTipoMueble(editTipoMueble);
                }
              }}
            >
              <label>Código Cliente:</label>
              <input
                type="text"
                name="cod_Cliente"
                value={editTipoMueble.mantenimientoCliente ? editTipoMueble.mantenimientoCliente.cod_Cliente : ""}
                onChange={(e) => setEditTipoMueble({ ...editTipoMueble, mantenimientoCliente: { ...editTipoMueble.mantenimientoCliente, cod_Cliente: e.target.value } })}
              />
              <label>Nombre Cliente:</label>
              <input
                type="text"
                name="nombre_Cliente"
                value={editTipoMueble.mantenimientoCliente ? editTipoMueble.mantenimientoCliente.nombre_Cliente : ""}
                onChange={(e) => setEditTipoMueble({ ...editTipoMueble, mantenimientoCliente: { ...editTipoMueble.mantenimientoCliente, nombre_Cliente: e.target.value } })}
              />
              <label>Ciudad:</label>
              <input
                type="text"
                name="ciudad"
                value={editTipoMueble.ciudad}
                onChange={(e) => setEditTipoMueble({ ...editTipoMueble, ciudad: e.target.value })}
              />
              <label>Código PDV:</label>
              <input
                type="text"
                name="cod_Pdv"
                value={editTipoMueble.cod_Pdv}
                onChange={(e) => setEditTipoMueble({ ...editTipoMueble, cod_Pdv: e.target.value })}
              />
              <label>Nombre PDV:</label>
              <input
                type="text"
                name="nombre_Pdv"
                value={editTipoMueble.nombre_Pdv}
                onChange={(e) => setEditTipoMueble({ ...editTipoMueble, nombre_Pdv: e.target.value })}
              />
              <label>Tipo Display Essence:</label>
              <select
                name="tipo_Display_Essence"
                value={editTipoMueble.tipo_Display_Essence}
                onChange={(e) => setEditTipoMueble({ ...editTipoMueble, tipo_Display_Essence: e.target.value })}
              >
                <option value="">Seleccione...</option>
                {Array.from(new Set(tipoMuebles.map((tm) => tm.tipo_Display_Essence))).map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <label>Tipo Mueble Display Catrice:</label>
                <select
                  name="tipo_Mueble_Display_Catrice"
                  value={editTipoMueble.tipo_Mueble_Display_Catrice}
                  onChange={(e) => setEditTipoMueble({ ...editTipoMueble, tipo_Mueble_Display_Catrice: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  {Array.from(new Set(tipoMuebles.map((tm) => tm.tipo_Mueble_Display_Catrice))).map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              <button type="submit" className="btn-crud">Guardar Cambios</button>
              <button type="button" className="btn-crud" onClick={() => setEditTipoMueble(null)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FybecaTipoMueble;