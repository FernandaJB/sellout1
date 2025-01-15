package com.manamer.backend.business.sellout.service;

import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;
import com.manamer.backend.business.sellout.models.Venta;
import com.manamer.backend.business.sellout.repositories.VentaRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
     * Método para cargar los datos del producto a partir del codBarra.
     * 
     * @param venta Entidad de Venta que contiene el codBarra y donde se asignarán los datos.
     */
    public void cargarDatosDeProducto(Venta venta) {
        // Limpia el código de barra (eliminar espacios en blanco) antes de la comparación
        String codBarra = venta.getCodBarra();
        
        // Mostrar el valor que llega para verificar si está correcto
        System.out.println("Código de barra recibido: '" + codBarra + "'");
        
        if (codBarra == null || codBarra.trim().isEmpty()) {
            System.out.println("El código de barra no puede ser nulo o vacío");
            return;  // No realizamos la consulta si el código de barra es inválido
        }
        
        // Eliminar espacios en blanco al principio y al final
        codBarra = codBarra.trim();
        
        // Consulta SQL nativa para obtener los datos del producto según el codBarra
        String queryStr = "SELECT sapProd.Marca, sapProd.Descripcion, sapProd.CodProd, sapProd.Descripcion "
                         + "FROM SAPHANA..CG3_360CORP.SAP_Prod sapProd "
                         + "WHERE sapProd.CodBarra = :codBarra";
        
        // Ejecutar la consulta
        Query query = entityManager.createNativeQuery(queryStr);
        query.setParameter("codBarra", codBarra);
        
        try {
            // Obtener los resultados
            Object[] result = (Object[]) query.getSingleResult();
        
            if (result != null && result.length == 4) {
                // Asignamos los valores a la entidad Venta
                venta.setMarca((String) result[0]);  // Marca
                venta.setNombre_Producto((String) result[1]);  // Descripción se asigna a Nombre_Producto
                venta.setCodigo_Sap((String) result[2]);  // Código SAP
                venta.setDescripcion((String) result[3]);  // Descripción del Producto
                
                // Obtener el id del producto de la tabla mantenimiento_producto
                MantenimientoProducto producto = ventaRepository.findMantenimientoProductoByCodBarra(codBarra);
                if (producto != null) {
                    venta.setMantenimientoProducto(producto); // Asignar el producto
                } else {
                    System.out.println("No se encontró ningún producto en mantenimiento_producto con el código de barra: " + codBarra);
                }

                // Asignar el id del cliente de la tabla mantenimiento_cliente
                MantenimientoCliente cliente = new MantenimientoCliente();
                cliente.setId(5969L); // Asignar el id fijo
                venta.setMantenimientoCliente(cliente); // Asignar el cliente
            }
        } catch (NoResultException e) {
            // Manejar el caso donde no se encuentra ningún resultado
            System.out.println("No se encontró ningún producto con el código de barra: " + codBarra);
        }
    }

    
    public Venta guardarVenta(Venta venta) {
        return ventaRepository.save(venta);
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
}