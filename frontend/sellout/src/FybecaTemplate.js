import React, { useEffect, useState } from "react";
import "./css/fybeca.css";

const Fybeca = () => {
  const [ventas, setVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editVenta, setEditVenta] = useState(null);
  const [filter, setFilter] = useState(""); // Estado para almacenar el filtro

  // Función para cargar las ventas desde la API
  const loadVentas = async () => {
    setLoadingVentas(true);
    setErrorVentas("");
    try {
      const response = await fetch("http://localhost:8082/api/fybeca/ventas"); // Ajusta la URL del API
      if (!response.ok) throw new Error(`Error al cargar ventas: ${response.statusText}`);
      const data = await response.json();
      setVentas(data);
    } catch (error) {
      setErrorVentas(error.message);
    } finally {
      setLoadingVentas(false);
    }
  };

  // Función para cargar el template de ventas
  const cargarTemplate = async (file) => {
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

  // Filtrar ventas por el filtro ingresado
  const filteredVentas = ventas.filter((venta) =>
    Object.values(venta).some((value) =>
      value.toString().toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Cargar las ventas al montar el componente
  useEffect(() => {
    loadVentas();
  }, []);

  return (
    <div className="container">
      <h1>Ventas Fybeca</h1>

      {errorVentas && <p className="error">{errorVentas}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <h2>Ventas</h2>

      <div className="upload-section">
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              cargarTemplate(e.target.files[0]);
            }
          }}
        />
        {/* Input para filtrar las ventas */}
        <input
          type="text"
          placeholder="Filtrar ventas"
          value={filter}
          onChange={(e) => setFilter(e.target.value)} // Actualizar el estado del filtro
        />
      </div>

      {loadingVentas ? (
        <p className="loading">Cargando ventas...</p>
      ) : filteredVentas.length === 0 ? (
        <p>No hay ventas disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Mes</th>
              <th>Marca</th>
              <th>Cliente ID</th>
              <th>Nombre Cliente</th>
              <th>Código Barra SAP</th>
              <th>Código Producto SAP</th>
              <th>Código Barra FYBECA</th>
              <th>Nombre Producto</th>
              <th>Código PDV</th>
              <th>Ciudad</th>
              <th>PDV</th>
              <th>Stock en Dólares</th>
              <th>Stock en Unidades</th>
              <th>ID Mantenimiento Producto</th>
              <th>Código Item</th>
              <th>Venta en Dólares</th>
              <th>Venta en Unidades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVentas.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.anio}</td>
                <td>{venta.mes}</td>
                <td>{venta.marca}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.cod_Cliente : "N/A"}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.nombre_Cliente : "N/A"}</td>
                <td>{venta.codBarra}</td>
                <td>{venta.codigo_Sap}</td>
                <td>{venta.codBarra }</td>
                <td>{venta.nombre_Producto }</td>
                <td>{venta.cod_Pdv}</td>
                <td>{venta.mantenimientoCliente ? venta.mantenimientoCliente.ciudad : "N/A"}</td>
                <td>{venta.pdv }</td>
                <td>{venta.stock_Dolares }</td>
                <td>{venta.stock_Unidades }</td>
                <td>{venta.mantenimientoProducto ? venta.mantenimientoProducto.id : "N/A"}</td>
                <td>{venta.mantenimientoProducto ? venta.mantenimientoProducto.cod_Item : "N/A"}</td>
                <td>{venta.venta_Dolares}</td>
                <td>{venta.venta_Unidad}</td>
                <td>
                  <button className="edit-btn" onClick={() => setEditVenta(venta)}>
                    Editar
                  </button>
                  <button className="delete-btn" onClick={() => eliminarVenta(venta.id)}>
                    Eliminar
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
                onChange={(e) => setEditVenta({ ...editVenta, codBarra: e.target.value })}
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
              <label>ID Mantenimiento Producto:</label>
              <input
                type="text"
                name="id_mantenimientoProducto"
                value={editVenta.mantenimientoProducto ? editVenta.mantenimientoProducto.id : ""}
                readOnly
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
              <button type="submit">Guardar Cambios</button>
              <button type="button" onClick={() => setEditVenta(null)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fybeca;