package com.manamer.backend.business.sellout.service;

import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;
import com.manamer.backend.business.sellout.models.Venta;
import com.manamer.backend.business.sellout.repositories.VentaRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;

    @Autowired
    public VentaService(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    @Autowired
    private EntityManager entityManager;

    /**
     * Método para cargar los datos del producto a partir del cod_Item.
     * 
     * @param venta Entidad de Venta que contiene el cod_Item y donde se asignarán los datos.
     * @return boolean indicando si los datos se cargaron correctamente.
     */
    public boolean cargarDatosDeProducto(Venta venta) {
        String codItem = venta.getCodBarra();
        
        if (codItem == null || codItem.trim().isEmpty()) {
            return false;
        }
        
        codItem = codItem.trim();
        
        // Consulta SQL nativa para verificar si el codItem existe y obtener el cod_Barra_Sap
        String queryStr = "SELECT p.cod_Barra_Sap "
                         + "FROM SELLOUT.dbo.mantenimiento_producto p "
                         + "WHERE p.cod_Item = :codItem";
        
        Query query = entityManager.createNativeQuery(queryStr);
        query.setParameter("codItem", codItem);
        
        try {
            List<String> codBarraSapList = query.getResultList();
            
            if (codBarraSapList.isEmpty()) {
                return false;
            }
            
            String codBarraSap = codBarraSapList.get(0);
            
            if (codBarraSap != null && !codBarraSap.trim().isEmpty()) {
                venta.setCodBarra(codBarraSap.trim());
                
                // Consulta para obtener los datos del producto según el cod_Barra_Sap
                queryStr = "SELECT c.id AS ClienteID, c.cod_Cliente, c.nombre_Cliente, c.ciudad, c.codigo_Proveedor, "
                         + "p.id AS IdProducto, p.cod_Item, p.cod_Barra_Sap, sapProd.CodProd, sapProd.CodBarra, "
                         + "sapProd.Descripcion AS DescripcionProducto, sapProd.Marca "
                         + "FROM SELLOUT.dbo.mantenimiento_producto p "
                         + "LEFT JOIN SAPHANA..CG3_360CORP.SAP_Prod sapProd ON p.cod_Barra_Sap = sapProd.CodBarra "
                         + "CROSS JOIN (SELECT TOP 1 * FROM SELLOUT.dbo.mantenimiento_cliente) c "
                         + "WHERE sapProd.CodBarra = :codBarraSap";
                
                query = entityManager.createNativeQuery(queryStr);
                query.setParameter("codBarraSap", codBarraSap);
                
                Object[] result = (Object[]) query.getSingleResult();
            
                if (result != null && result.length == 12) {
                    venta.setMantenimientoCliente(new MantenimientoCliente());
                    venta.getMantenimientoCliente().setId(((Number) result[0]).longValue());  // ClienteID
                    venta.getMantenimientoCliente().setCod_Cliente((String) result[1]);  // cod_Cliente
                    venta.getMantenimientoCliente().setNombre_Cliente((String) result[2]);  // nombre_Cliente
                    venta.getMantenimientoCliente().setCiudad((String) result[3]);  // ciudad
                    venta.getMantenimientoCliente().setCodigo_Proveedor((String) result[4]);  // codigo_Proveedor
                    
                    venta.setMantenimientoProducto(new MantenimientoProducto());
                    venta.getMantenimientoProducto().setId(((Number) result[5]).longValue());  // IdProducto
                    venta.getMantenimientoProducto().setCod_Item((String) result[6]);  // cod_Item
                    venta.getMantenimientoProducto().setCod_Barra_Sap((String) result[7]);  // cod_Barra_Sap
                    
                    venta.setCodigo_Sap((String) result[8]);  // CodProd
                    venta.setCodBarra((String) result[9]);  // CodBarra
                    venta.setDescripcion((String) result[10]);  // DescripcionProducto
                    venta.setNombre_Producto((String) result[10]);  // DescripcionProducto también se asigna a Nombre_Producto
                    venta.setMarca((String) result[11]);  // Marca
                    return true;
                }
            }
        } catch (NoResultException e) {
            return false;
        }
        return false;
    }

    public List<Venta> obtenerTodasLasVentas(int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina - 1, tamano);
        Page<Venta> ventas = ventaRepository.findAll(pageable);
        return ventas.getContent();
    }

    @Transactional
    public void guardarVentas(List<Venta> ventas) {
        int batchSize = 50;
        for (int i = 0; i < ventas.size(); i += batchSize) {
            int end = Math.min(i + batchSize, ventas.size());
            List<Venta> batchList = ventas.subList(i, end);
            ventaRepository.saveAll(batchList);
            ventaRepository.flush();
        }
    }

    // Obtener todas las ventas
    public List<Venta> obtenerTodasLasVentas() {
        return ventaRepository.findAll();
    }

    // Obtener una venta por su ID
    public Optional<Venta> obtenerVentaPorId(Long id) {
        return ventaRepository.findById(id);
    }

    // Actualizar una venta
    public Venta actualizarVenta(Long id, Venta nuevaVenta) {
        return ventaRepository.findById(id).map(venta -> {
            venta.setAnio(nuevaVenta.getAnio());
            venta.setMes(nuevaVenta.getMes());
            venta.setMarca(nuevaVenta.getMarca());
            venta.setVenta_Dolares(nuevaVenta.getVenta_Dolares());
            venta.setVenta_Unidad(nuevaVenta.getVenta_Unidad());
            venta.setNombre_Producto(nuevaVenta.getNombre_Producto());
            venta.setCodigo_Sap(nuevaVenta.getCodigo_Sap());
            venta.setCodBarra(nuevaVenta.getCodBarra());
            venta.setCod_Pdv(nuevaVenta.getCod_Pdv());
            venta.setDescripcion(nuevaVenta.getDescripcion());
            venta.setPdv(nuevaVenta.getPdv());
            venta.setStock_Dolares(nuevaVenta.getStock_Dolares());
            venta.setStock_Unidades(nuevaVenta.getStock_Unidades());
            venta.setMantenimientoCliente(nuevaVenta.getMantenimientoCliente());
            venta.setMantenimientoProducto(nuevaVenta.getMantenimientoProducto());
            return ventaRepository.save(venta);
        }).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));
    }

    // Eliminar una venta
    public boolean eliminarVenta(Long id) {
        return ventaRepository.findById(id).map(venta -> {
            ventaRepository.delete(venta);
            return true;
        }).orElse(false);
    }

    // Eliminar varias ventas por sus IDs
    public boolean eliminarVentas(List<Long> ids) {
        try {
            List<Venta> ventas = ventaRepository.findAllById(ids);
            ventaRepository.deleteAll(ventas);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Obtener todas las marcas disponibles en las ventas
    public List<String> obtenerMarcasDisponibles() {
        String queryStr = "SELECT DISTINCT v.marca FROM Venta v WHERE v.marca IS NOT NULL";
        Query query = entityManager.createQuery(queryStr);
        return query.getResultList();
    }
}
