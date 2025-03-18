package com.manamer.backend.business.sellout.service;

import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;
import com.manamer.backend.business.sellout.models.Venta;
import com.manamer.backend.business.sellout.repositories.VentaRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.NonUniqueResultException;
import jakarta.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.nio.file.Paths;
import java.nio.file.Files;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.nio.file.Path;
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
            System.out.println("El código de item no puede ser nulo o vacío");
            return false;
        }

        codItem = codItem.trim();

        String queryStr = "SELECT p.cod_Barra_Sap "
                         + "FROM SELLOUT.dbo.mantenimiento_producto p "
                         + "WHERE p.cod_Item = :codItem";

        Query query = entityManager.createNativeQuery(queryStr);
        query.setParameter("codItem", codItem);

        try {
            List<String> codBarraSapList = query.getResultList();

            if (codBarraSapList.isEmpty()) {
                guardarCodigoNoEncontrado(codItem);
                return false;
            }

            // Manejar múltiples resultados seleccionando el primero
            String codBarraSap = codBarraSapList.get(0);
            venta.setCodBarra(codBarraSap.trim());

            // Consulta SQL para obtener los datos del producto
            queryStr = "SELECT c.id AS ClienteID, c.cod_Cliente, c.nombre_Cliente, c.ciudad, c.codigo_Proveedor, "
                     + "p.id AS IdProducto, p.cod_Item, p.cod_Barra_Sap, sapProd.CodProd, sapProd.CodBarra, "
                     + "sapProd.Descripcion AS DescripcionProducto, sapProd.Marca "
                     + "FROM SELLOUT.dbo.mantenimiento_producto p "
                     + "LEFT JOIN SAPHANA..CG3_360CORP.SAP_Prod sapProd ON p.cod_Barra_Sap = sapProd.CodBarra "
                     + "CROSS JOIN (SELECT TOP 1 * FROM SELLOUT.dbo.mantenimiento_cliente) c "
                     + "WHERE sapProd.CodBarra = :codBarraSap";

            query = entityManager.createNativeQuery(queryStr);
            query.setParameter("codBarraSap", codBarraSap);

            List<Object[]> results = query.getResultList();
            
            if (results.isEmpty()) {
                guardarCodigoNoEncontrado(codItem);
                return false;
            }

            Object[] result = results.get(0); // Tomar el primer resultado válido

            if (result.length == 12) {
                venta.setMantenimientoCliente(new MantenimientoCliente());
                venta.getMantenimientoCliente().setId(((Number) result[0]).longValue());
                venta.getMantenimientoCliente().setCod_Cliente((String) result[1]);
                venta.getMantenimientoCliente().setNombre_Cliente((String) result[2]);
                venta.getMantenimientoCliente().setCiudad((String) result[3]);
                venta.getMantenimientoCliente().setCodigo_Proveedor((String) result[4]);

                venta.setMantenimientoProducto(new MantenimientoProducto());
                venta.getMantenimientoProducto().setId(((Number) result[5]).longValue());
                venta.getMantenimientoProducto().setCod_Item((String) result[6]);
                venta.getMantenimientoProducto().setCod_Barra_Sap((String) result[7]);

                venta.setCodigo_Sap((String) result[8]);
                venta.setCodBarra((String) result[9]);
                venta.setDescripcion((String) result[10]);
                venta.setNombre_Producto((String) result[10]);
                venta.setMarca((String) result[11]);

                return true;
            }

        } catch (NoResultException e) {
            guardarCodigoNoEncontrado(codItem);
            return false;
        } catch (NonUniqueResultException e) {
            System.out.println("Advertencia: Se encontraron múltiples resultados para el código de item: " + codItem);
            guardarCodigoNoEncontrado(codItem);
            return false;
        }

        return false;
    }

    /**
     * Guarda en un archivo de texto los códigos de barra que no se encontraron en la base de datos.
     * 
     * @param codItem Código de item no encontrado.
     */
    private void guardarCodigoNoEncontrado(String codItem) {
        String userHome = System.getProperty("user.home");
        String downloadPath = Paths.get(userHome, "Downloads", "codigos_no_encontrados.txt").toString();
        System.out.println("Intentando guardar archivo en: " + downloadPath);
        try (BufferedWriter writer = Files.newBufferedWriter(Paths.get(downloadPath), 
                StandardOpenOption.CREATE, StandardOpenOption.APPEND)) {
            
            writer.write(codItem);
            writer.newLine();
            System.out.println("Código guardado en archivo en: " + downloadPath);
        } catch (IOException e) {
            System.err.println("Error al guardar código no encontrado: " + e.getMessage());
        }
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

    @Transactional
    public void guardarVentasConExecutorService(List<Venta> ventas) {
        int batchSize = 50;
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        try {
            for (int i = 0; i < ventas.size(); i += batchSize) {
                int end = Math.min(i + batchSize, ventas.size());
                List<Venta> batchList = ventas.subList(i, end);
                executorService.submit(() -> {
                    try {
                        ventaRepository.saveAll(batchList);
                        ventaRepository.flush();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
        } finally {
            executorService.shutdown();
            try {
                if (!executorService.awaitTermination(60, TimeUnit.SECONDS)) {
                    executorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                executorService.shutdownNow();
            }
        }
    }

    public List<Venta> obtenerTodasLasVentas() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> obtenerVentaPorId(Long id) {
        return ventaRepository.findById(id);
    }


    /**
     * Guarda en un archivo de texto todos los códigos de barra que no se encontraron en la carpeta de Descargas.
     *
     * @param codigosNoEncontrados Lista de códigos de barra no encontrados.
     */
    public File guardarCodigosNoEncontradosEnArchivo(List<String> codigosNoEncontrados) {
        if (codigosNoEncontrados.isEmpty()) {
            return null;
        }

        try {
            Path tempFile = Files.createTempFile("codigos_no_encontrados_", ".txt");
            try (BufferedWriter writer = Files.newBufferedWriter(tempFile, StandardOpenOption.CREATE, StandardOpenOption.APPEND)) {
                writer.write("Códigos de barra no encontrados - " + java.time.LocalDateTime.now());
                writer.newLine();
                for (String codigo : codigosNoEncontrados) {
                    writer.write(codigo);
                    writer.newLine();
                }
                writer.write("--------------------------------------------------");
                writer.newLine();
            }
            return tempFile.toFile();
        } catch (IOException e) {
            return null;
        }
    }

    public ResponseEntity<Resource> obtenerArchivoCodigosNoEncontrados(List<String> codigosNoEncontrados) {
        File archivo = guardarCodigosNoEncontradosEnArchivo(codigosNoEncontrados);
        if (archivo == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
        }

        Resource fileResource = new FileSystemResource(archivo);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + archivo.getName())
            .contentType(MediaType.TEXT_PLAIN)
            .contentLength(archivo.length())
            .body(fileResource);
    }


    // Actualizar una venta
    public Venta actualizarVenta(Long id, Venta nuevaVenta) {
        return ventaRepository.findById(id).map(venta -> {
            venta.setAnio(nuevaVenta.getAnio());
            venta.setMes(nuevaVenta.getMes());
            venta.setDia(nuevaVenta.getDia()); // Nuevo campo
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

    @Transactional
    public List<Object[]> obtenerReporteVentas() {
        String sql = """
            WITH VentasMensuales AS (
                SELECT 
                    v.cod_Pdv,
                    v.pdv,
                    FORMAT(v.anio, '0000') + '-' + FORMAT(v.mes, '00') AS periodo,
                    SUM(CAST(v.venta_Unidad AS INT)) AS total_unidades
                FROM [SELLOUT].[dbo].[venta] v
                GROUP BY v.cod_Pdv, v.pdv, v.anio, v.mes
            ),
            PromedioUnidades AS (
                SELECT 
                    cod_Pdv,
                    AVG(total_unidades) AS promedio_mensual
                FROM VentasMensuales
                WHERE periodo IN (
                    SELECT DISTINCT TOP 3 periodo 
                    FROM VentasMensuales 
                    ORDER BY periodo DESC
                )
                GROUP BY cod_Pdv
            )
            SELECT 
                vm.cod_Pdv,
                vm.pdv,
                tm.ciudad,
                tm.tipo_Display_Essence,
                tm.tipo_Mueble_Display_Catrice,
                COALESCE(SUM(vm.total_unidades), 0) AS total_unidades_mes,
                COALESCE(pu.promedio_mensual, 0) AS promedio_mes,
                ROUND(COALESCE(pu.promedio_mensual, 0) / 30, 2) AS unidad_diaria
            FROM VentasMensuales vm
            INNER JOIN [SELLOUT].[dbo].[tipo_mueble] tm 
                ON vm.cod_Pdv = tm.cod_Pdv
            LEFT JOIN PromedioUnidades pu 
                ON vm.cod_Pdv = pu.cod_Pdv
            GROUP BY 
                vm.cod_Pdv, vm.pdv, 
                tm.ciudad, 
                tm.tipo_Display_Essence, 
                tm.tipo_Mueble_Display_Catrice, 
                pu.promedio_mensual;
        """;

        Query query = entityManager.createNativeQuery(sql);
        return query.getResultList();
    }
}
