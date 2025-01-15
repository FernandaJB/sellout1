package com.manamer.backend.business.sellout.repositories;

import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;
import com.manamer.backend.business.sellout.models.Producto;
import com.manamer.backend.business.sellout.models.Venta;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

   // Consulta para obtener el Producto por el cod_Barra desde la tabla SAP_Prod (SAPHANA..CG3_360CORP.SAP_Prod)
   @Query(value = "SELECT * FROM SAPHANA..CG3_360CORP.SAP_Prod sapProd WHERE sapProd.CodBarra = :codBarra", nativeQuery = true)
   Producto obtenerProductoPorCodBarra(@Param("codBarra") String codBarra);

   // Consulta para obtener el MantenimientoProducto por el cod_Barra desde la tabla SELLOUT.dbo.mantenimiento_producto
   @Query(value = "SELECT * FROM SELLOUT.dbo.mantenimiento_producto mp WHERE mp.cod_Barra_Sap = :codBarra", nativeQuery = true)
   MantenimientoProducto obtenerMantenimientoProducto(@Param("codBarra") String codBarra);

   // Consulta para obtener el MantenimientoCliente (suponiendo que está en SELLOUT.dbo.mantenimiento_cliente)
   @Query(value = "SELECT * FROM SELLOUT.dbo.mantenimiento_cliente c WHERE c.id = :clienteId", nativeQuery = true)
   MantenimientoCliente obtenerMantenimientoCliente(@Param("clienteId") Long clienteId);

   @Query("SELECT mp FROM MantenimientoProducto mp WHERE mp.cod_Barra_Sap = :codBarra")
    MantenimientoProducto findMantenimientoProductoByCodBarra(@Param("codBarra") String codBarra);

   // Nueva consulta que valida y limpia el codBarra antes de la consulta
   default Producto obtenerProductoPorCodBarraLimpio(@Param("codBarra") String codBarra) {
       // Limpiar el código de barra antes de usarlo en la consulta
       if (codBarra != null) {
           codBarra = codBarra.trim();  // Elimina espacios en blanco alrededor
       }
       
       // Verificar si el código de barra es nulo o vacío
       if (codBarra == null || codBarra.isEmpty()) {
           return null;  // Retorna null si el código de barra no es válido
       }
       
       // Llamar al método existente para obtener el producto usando el código limpio
       return obtenerProductoPorCodBarra(codBarra);
   }
}