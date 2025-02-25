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

   // Consulta para obtener el Producto por cod_Barra (pueden existir varios productos con el mismo código de barras)
   @Query(value = "SELECT * FROM SAPHANA..CG3_360CORP.SAP_Prod sapProd WHERE sapProd.CodBarra = :codBarra", nativeQuery = true)
   List<Producto> obtenerProductoPorCodBarra(@Param("codBarra") String codBarra);

   // Si solo se necesita un resultado, se toma el primero de la lista
   default Optional<Producto> obtenerPrimerProductoPorCodBarra(@Param("codBarra") String codBarra) {
       List<Producto> productos = obtenerProductoPorCodBarra(codBarra);
       return productos.isEmpty() ? Optional.empty() : Optional.of(productos.get(0));
   }

   // Consulta para obtener el MantenimientoProducto (pueden existir varios con el mismo cod_Barra_Sap)
   @Query(value = "SELECT * FROM SELLOUT.dbo.mantenimiento_producto mp WHERE mp.cod_Barra_Sap = :codBarra", nativeQuery = true)
   List<MantenimientoProducto> obtenerMantenimientoProducto(@Param("codBarra") String codBarra);

   default Optional<MantenimientoProducto> obtenerPrimerMantenimientoProducto(@Param("codBarra") String codBarra) {
       List<MantenimientoProducto> productos = obtenerMantenimientoProducto(codBarra);
       return productos.isEmpty() ? Optional.empty() : Optional.of(productos.get(0));
   }

   // Consulta para obtener el MantenimientoCliente (en este caso, se espera un solo resultado)
   @Query(value = "SELECT * FROM SELLOUT.dbo.mantenimiento_cliente c WHERE c.id = :clienteId", nativeQuery = true)
   Optional<MantenimientoCliente> obtenerMantenimientoCliente(@Param("clienteId") Long clienteId);

   // Método alternativo para obtener solo un resultado en MantenimientoProducto con cod_Barra_Sap
   @Query("SELECT mp FROM MantenimientoProducto mp WHERE mp.cod_Barra_Sap = :codBarra")
   List<MantenimientoProducto> findMantenimientoProductoByCodBarra(@Param("codBarra") String codBarra);

   default Optional<MantenimientoProducto> findPrimerMantenimientoProductoByCodBarra(@Param("codBarra") String codBarra) {
       List<MantenimientoProducto> productos = findMantenimientoProductoByCodBarra(codBarra);
       return productos.isEmpty() ? Optional.empty() : Optional.of(productos.get(0));
   }

   // Nueva consulta que valida y limpia el codBarra antes de la consulta
   default Optional<Producto> obtenerProductoPorCodBarraLimpio(@Param("codBarra") String codBarra) {
       if (codBarra != null) {
           codBarra = codBarra.trim();
       }

       if (codBarra == null || codBarra.isEmpty()) {
           return Optional.empty();
       }

       return obtenerPrimerProductoPorCodBarra(codBarra);
   }
}
