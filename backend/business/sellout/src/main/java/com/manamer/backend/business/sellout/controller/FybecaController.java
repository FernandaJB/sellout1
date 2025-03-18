package com.manamer.backend.business.sellout.controller;

import com.manamer.backend.business.sellout.models.Cliente;
import com.manamer.backend.business.sellout.models.ExcelUtils;
import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;
import com.manamer.backend.business.sellout.models.TipoMueble;
import com.manamer.backend.business.sellout.models.Venta;
import com.manamer.backend.business.sellout.repositories.MantenimientoProductoRepository;
import com.manamer.backend.business.sellout.service.ClienteService;
import com.manamer.backend.business.sellout.service.MantenimientoClienteService;
import com.manamer.backend.business.sellout.service.MantenimientoProductoService;
import com.manamer.backend.business.sellout.service.TipoMuebleService;
import com.manamer.backend.business.sellout.service.VentaService;
import org.springframework.http.ResponseEntity;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import org.springframework.http.HttpStatus;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.springframework.core.io.Resource;
@RestController
@RequestMapping("/api/fybeca")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class FybecaController {

    private final VentaService ventaService;

    @Autowired
    private MantenimientoClienteService serviceClienteService;

    @Autowired
    private MantenimientoProductoService serviceProductoService;

    @Autowired
    private MantenimientoProductoRepository repository;

    @Autowired
    private MantenimientoClienteService servicio;

    @Autowired
    private ClienteService clienteService;

    private static final Logger logger = LoggerFactory.getLogger(FybecaController.class);

    @Autowired
    private MantenimientoClienteService mantenimientoClienteService;  // Inyección del servicio

    @Autowired
    private MantenimientoProductoService mantenimientoProductoService;  // Inyección del servicio

    private final TipoMuebleService tipoMuebleService;

    @Autowired
    public FybecaController(MantenimientoClienteService mantenimientoClienteService,
                            MantenimientoProductoService mantenimientoProductoService,
                            VentaService ventaService,
                            TipoMuebleService tipoMuebleService) {
        this.mantenimientoClienteService = mantenimientoClienteService;
        this.mantenimientoProductoService = mantenimientoProductoService;
        this.ventaService = ventaService;
        this.tipoMuebleService = tipoMuebleService;
    }


    // Métodos para clientes
    @GetMapping("/cliente") // Endpoint para obtener todos los clientes
    public List<Cliente> getAllClientes() {
        return clienteService.getAllClientes();
    }

    // Métodos para ventas
    @GetMapping("/venta") // Obtener todas las ventas
    public ResponseEntity<List<Venta>> obtenerTodasLasVentas() {
        List<Venta> ventas = ventaService.obtenerTodasLasVentas();
        return ResponseEntity.ok(ventas);
    }

    @GetMapping("/venta/{id}")
    public ResponseEntity<Venta> obtenerVentaPorId(@PathVariable Long id) {
        Optional<Venta> venta = ventaService.obtenerVentaPorId(id);
        return venta.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/venta/{id}")
    public ResponseEntity<Venta> actualizarVenta(@PathVariable Long id, @RequestBody Venta nuevaVenta) {
        try {
            Venta ventaActualizada = ventaService.actualizarVenta(id, nuevaVenta);
            return ResponseEntity.ok(ventaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/venta/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        try {
            ventaService.eliminarVenta(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/ventas-forma-masiva")
    public ResponseEntity<Void> eliminarVentas(@RequestBody List<Long> ids) {
        if (ventaService.eliminarVentas(ids)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/subir-archivo-venta")
    public ResponseEntity<Resource> subirArchivo(@RequestParam("file") MultipartFile file) {
        List<String> codigosNoEncontrados = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Venta> ventas = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    Venta venta = new Venta();

                    venta.setAnio(obtenerValorCelda(row.getCell(0), Integer.class));
                    venta.setMes(obtenerValorCelda(row.getCell(1), Integer.class));
                    venta.setDia(obtenerValorCelda(row.getCell(2), Integer.class));
                    venta.setVenta_Dolares(obtenerValorCelda(row.getCell(3), Double.class));
                    venta.setVenta_Unidad(obtenerValorCelda(row.getCell(4), Double.class));
                    venta.setCodBarra(obtenerValorCelda(row.getCell(5), String.class));

                    venta.setCod_Pdv(obtenerValorCelda(row.getCell(6), String.class));
                    if (venta.getCod_Pdv() == null || venta.getCod_Pdv().isEmpty()) {
                        System.err.println("Advertencia: cod_Pdv vacío en la fila " + i);
                    }

                    venta.setPdv(obtenerValorCelda(row.getCell(7), String.class));
                    venta.setStock_Dolares(obtenerValorCelda(row.getCell(8), Double.class));
                    venta.setStock_Unidades(obtenerValorCelda(row.getCell(9), Double.class));

                    if (venta.getCodBarra() == null || venta.getCodBarra().trim().isEmpty()) {
                        codigosNoEncontrados.add("Fila " + i + ": Código de barra vacío");
                        continue;
                    }

                    boolean datosCargados = ventaService.cargarDatosDeProducto(venta);
                    if (!datosCargados) {
                        codigosNoEncontrados.add("Fila " + i + ": " + venta.getCodBarra());
                        continue;
                    }

                    ventas.add(venta);
                }
            }

            ExecutorService executor = Executors.newFixedThreadPool(4);
            List<Future<?>> futures = new ArrayList<>();
            int batchSize = 100;

            for (int i = 0; i < ventas.size(); i += batchSize) {
                int start = i;
                int end = Math.min(i + batchSize, ventas.size());
                List<Venta> batchList = ventas.subList(start, end);

                Future<?> future = executor.submit(() -> {
                    try {
                        ventaService.guardarVentas(batchList);
                    } catch (Exception e) {
                        System.err.println("Error al guardar lote: " + e.getMessage());
                        e.printStackTrace();
                    }
                });
                futures.add(future);
            }

            for (Future<?> future : futures) {
                try {
                    future.get();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            executor.shutdown();
            executor.awaitTermination(1, TimeUnit.HOURS);

            return ventaService.obtenerArchivoCodigosNoEncontrados(codigosNoEncontrados);

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private <T> T obtenerValorCelda(Cell cell, Class<T> clazz) {
        if (cell == null) return null;

        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    if (clazz == Integer.class) {
                        return clazz.cast((int) cell.getNumericCellValue());
                    } else if (clazz == Double.class) {
                        return clazz.cast(cell.getNumericCellValue());
                    } else if (clazz == String.class) {
                        return clazz.cast(String.valueOf((int) cell.getNumericCellValue()));
                    }
                    break;
                case STRING:
                    String value = cell.getStringCellValue().trim();
                    if (clazz == Integer.class) {
                        return clazz.cast(Integer.parseInt(value));
                    } else if (clazz == Double.class) {
                        return clazz.cast(Double.parseDouble(value));
                    } else {
                        return clazz.cast(value);
                    }
                case BLANK:
                    return null;
                default:
                    return null;
            }
        } catch (Exception e) {
            System.err.println("Error al convertir celda: " + cell.toString());
            e.printStackTrace();
        }
        return null;
    }

    @GetMapping("/reporte-ranquin-ventas")
    public ResponseEntity<List<Object[]>> obtenerReporteVentas() {
        List<Object[]> resultado = ventaService.obtenerReporteVentas();
        return ResponseEntity.ok(resultado);
    }

    // Endpoint para obtener todas las marcas disponibles
    @GetMapping("/marcas-ventas")
    public List<String> obtenerMarcasDisponibles() {
        return ventaService.obtenerMarcasDisponibles();
    }
    
    // Métodos Para la Tabla de CLientes
    @GetMapping("/mantenimiento-cliente")
    public List<MantenimientoCliente> tablaMantenimientoClientes() {
        return serviceClienteService.getAllClientes();
    }

    @GetMapping("/mantenimiento-cliente/{id}")
    public ResponseEntity<MantenimientoCliente> obtenerMantenimientoCliente(@PathVariable Long id) {
        return serviceClienteService.getClienteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mantenimiento-cliente")
    public MantenimientoCliente crearMantenimientoCliente(@RequestBody MantenimientoCliente cliente) {
        return serviceClienteService.saveOrUpdate(cliente);
    }

    @PutMapping("/mantenimiento-cliente/{id}")
    public ResponseEntity<MantenimientoCliente> actualizarMantenimientoCliente(@PathVariable Long id, @RequestBody MantenimientoCliente cliente) {
        if (!serviceClienteService.getClienteById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        cliente.setId(id);
        return ResponseEntity.ok(serviceClienteService.saveOrUpdate(cliente));
    }

    @DeleteMapping("/mantenimiento-cliente/{id}")
    public ResponseEntity<Void> eliminarMantenimientoCliente(@PathVariable Long id) {
        if (!serviceClienteService.getClienteById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        serviceClienteService.deleteCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mantenimiento-cliente/upload")
    public String uploadClientes(@RequestParam("file") MultipartFile file) {
        return servicio.uploadClientesFromExcel(file);
    }

    // Métodos para mantenimiento de productos
    @GetMapping("/mantenimiento-productos")
    public List<MantenimientoProducto> tablaMantenimientoProductos() {
        return serviceProductoService.getAllProductos();
    }

    @PostMapping("/mantenimiento-producto")
    public MantenimientoProducto crearMantenimientoProducto(@RequestBody MantenimientoProducto producto) {
        return serviceProductoService.saveOrUpdate(producto);
    }

    @PostMapping("/template-mantenimiento-productos")
    public ResponseEntity<String> cargarProductosDesdeArchivo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("Por favor, seleccione un archivo", HttpStatus.BAD_REQUEST);
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<MantenimientoProducto> productos = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() < 1) {
                    continue; // Saltar la fila de encabezado
                }

                MantenimientoProducto producto = new MantenimientoProducto();

                if (row.getCell(0) != null) {
                    Cell cell = row.getCell(0);
                    if (cell.getCellType() == CellType.NUMERIC) {
                        producto.setCod_Item(String.valueOf((long) cell.getNumericCellValue()));
                    } else {
                        producto.setCod_Item(cell.getStringCellValue());
                    }
                }

                if (row.getCell(1) != null) {
                    Cell cell = row.getCell(1);
                    if (cell.getCellType() == CellType.NUMERIC) {
                        producto.setCod_Barra_Sap(String.valueOf((long) cell.getNumericCellValue()));
                    } else {
                        producto.setCod_Barra_Sap(cell.getStringCellValue());
                    }
                }

                productos.add(producto);
            }

            mantenimientoProductoService.guardarProductos(productos);
            return ResponseEntity.ok("Archivo cargado y procesado correctamente.");
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al procesar el archivo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Métodos para eliminación de productos
    public void deleteProductos(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("No se proporcionaron IDs para eliminar.");
        }

        int batchSize = 2000;
        List<List<Long>> batches = new ArrayList<>();

        for (int i = 0; i < ids.size(); i += batchSize) {
            int end = Math.min(i + batchSize, ids.size());
            batches.add(ids.subList(i, end));
        }

        for (List<Long> batch : batches) {
            repository.deleteAllById(batch);
        }
    }

    @DeleteMapping("/mantenimiento-productos")
    public ResponseEntity<String> eliminarProductos(@RequestBody List<Long> ids) {
        try {
            mantenimientoProductoService.deleteProductos(ids);
            return ResponseEntity.ok("Productos eliminados correctamente.");
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    //CRUD de tabla Tipo Mueble

    @PostMapping("/tipo-mueble")
    public ResponseEntity<TipoMueble> crearTipoMueble(@RequestBody TipoMueble tipoMueble) {
        TipoMueble nuevoTipoMueble = tipoMuebleService.guardarTipoMueble(tipoMueble);
        return ResponseEntity.ok(nuevoTipoMueble);
    }

    @GetMapping("/tipo-mueble")
    public ResponseEntity<List<TipoMueble>> obtenerTodosLosTiposMueble() {
        List<TipoMueble> tiposMueble = tipoMuebleService.obtenerTodosLosTiposMueble();
        return ResponseEntity.ok(tiposMueble);
    }

    @GetMapping("/tipo-mueble/{id}")
    public ResponseEntity<TipoMueble> obtenerTipoMueblePorId(@PathVariable Long id) {
        Optional<TipoMueble> tipoMueble = tipoMuebleService.obtenerTipoMueblePorId(id);
        return tipoMueble.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/tipo-mueble/{id}")
    public ResponseEntity<TipoMueble> actualizarTipoMueble(@PathVariable Long id, @RequestBody TipoMueble nuevoTipoMueble) {
        try {
            TipoMueble tipoMuebleActualizado = tipoMuebleService.actualizarTipoMueble(id, nuevoTipoMueble);
            return ResponseEntity.ok(tipoMuebleActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/tipo-mueble/{id}")
    public ResponseEntity<Void> eliminarTipoMueble(@PathVariable Long id) {
        if (tipoMuebleService.eliminarTipoMueble(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/template-tipo-muebles")
    public ResponseEntity<List<TipoMueble>> subirTipoMuebles(@RequestParam("file") MultipartFile file) {
        List<TipoMueble> tipoMuebles = tipoMuebleService.cargarTipoMueblesDesdeArchivo(file);
        return ResponseEntity.ok(tipoMuebles);
    }

     // Método para eliminar múltiples TipoMueble por ID
    @DeleteMapping("/eliminar-varios-tipo-mueble")
    public ResponseEntity<String> eliminarTiposMueble(@RequestBody List<Long> ids) {
        boolean todosEliminados = tipoMuebleService.eliminarTiposMueble(ids);
        if (todosEliminados) {
            return ResponseEntity.ok("Tipos de muebles eliminados correctamente.");
        } else {
            return ResponseEntity.status(404).body("Algunos tipos de muebles no se encontraron.");
        }
    }

    public static byte[] convertWorkbookToByteArray(XSSFWorkbook workbook) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return out.toByteArray();
        }
    }  
    
    // Método para descargar reporte de Ventas
    @GetMapping("/reporte-ventas")
    public ResponseEntity<byte[]> generarReporteVentas() {
        try {
            List<Venta> ventas = ventaService.obtenerTodasLasVentas();

            // Crear libro de Excel
            XSSFWorkbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Ventas");

            // Crear encabezados
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Año");
            header.createCell(1).setCellValue("Mes");
            header.createCell(2).setCellValue("Marca");
            header.createCell(3).setCellValue("Código Cliente");
            header.createCell(4).setCellValue("Nombre Cliente");
            header.createCell(5).setCellValue("Código Barra SAP");
            header.createCell(6).setCellValue("Código Producto SAP");
            header.createCell(7).setCellValue("Código Item");
            header.createCell(8).setCellValue("Nombre Producto");
            header.createCell(9).setCellValue("Código PDV");
            header.createCell(10).setCellValue("Ciudad");
            header.createCell(11).setCellValue("PDV");
            header.createCell(12).setCellValue("Stock en Dólares");
            header.createCell(13).setCellValue("Stock en Unidades");
            header.createCell(14).setCellValue("Venta en Dólares");
            header.createCell(15).setCellValue("Venta en Unidades");

            // Llenar datos
            int rowNum = 1;
            for (Venta venta : ventas) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(venta.getAnio());
                row.createCell(1).setCellValue(venta.getMes());
                row.createCell(2).setCellValue(venta.getMarca());

                // MantenimientoCliente
                if (venta.getMantenimientoCliente() != null) {
                    row.createCell(3).setCellValue(venta.getMantenimientoCliente().getCod_Cliente());
                    row.createCell(4).setCellValue(venta.getMantenimientoCliente().getNombre_Cliente());
                    row.createCell(10).setCellValue(venta.getMantenimientoCliente().getCiudad());
                } else {
                    
                    row.createCell(3).setCellValue("N/A");
                    row.createCell(4).setCellValue("N/A");
                    row.createCell(10).setCellValue("N/A");
                }

                row.createCell(5).setCellValue(venta.getCodBarra());
                row.createCell(6).setCellValue(venta.getCodigo_Sap());

                // MantenimientoProducto
                if (venta.getMantenimientoProducto() != null) {
                    row.createCell(7).setCellValue(venta.getMantenimientoProducto().getCod_Item());
                    row.createCell(8).setCellValue(venta.getNombre_Producto());
                } else {
                    row.createCell(7).setCellValue("N/A");
                    row.createCell(8).setCellValue("N/A");
                }

                row.createCell(9).setCellValue(venta.getCod_Pdv());
                row.createCell(11).setCellValue(venta.getPdv());
                row.createCell(12).setCellValue(venta.getStock_Dolares());
                row.createCell(13).setCellValue(venta.getStock_Unidades());
                row.createCell(14).setCellValue(venta.getVenta_Dolares());
                row.createCell(15).setCellValue(venta.getVenta_Unidad());
            }

        
            // Convertir a bytes
            byte[] byteArray = ExcelUtils.convertWorkbookToByteArray(workbook);
            // Cerrar el archivo
            workbook.close();
            // Retornar el archivo Excel
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=reporte_ventas.xlsx")
                    .body(byteArray);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/reporte-mantenimiento-productos")
    public ResponseEntity<byte[]> generarReporteMantenimientoProductos() {
        try {
            List<MantenimientoProducto> productos = repository.findAll();

            // Crear libro de Excel
            XSSFWorkbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Mantenimiento Productos");

            // Crear encabezados
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Código Item");
            header.createCell(1).setCellValue("Código Barra SAP");

            // Llenar datos
            int rowNum = 1;
            for (MantenimientoProducto producto : productos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(producto.getCod_Item());
                row.createCell(1).setCellValue(producto.getCod_Barra_Sap());
            }

            // Convertir a bytes
            byte[] byteArray = ExcelUtils.convertWorkbookToByteArray(workbook);

            // Cerrar el archivo
            workbook.close();

            // Retornar el archivo Excel
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=reporte_mantenimiento_productos.xlsx")
                    .body(byteArray);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/reporte-tipo-mueble")
    public ResponseEntity<byte[]> generarReporteTipoMueble() {
        try {
            // Obtener todos los tipos de mueble
            List<TipoMueble> tiposMueble = tipoMuebleService.obtenerTodosLosTiposMueble();

            // Crear libro de Excel
            XSSFWorkbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Tipos de Mueble");

            // Crear encabezados
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Código Cliente");
            header.createCell(1).setCellValue("Nombre Cliente");
            header.createCell(2).setCellValue("Ciudad");
            header.createCell(3).setCellValue("Código PDV");
            header.createCell(4).setCellValue("Nombre PDV");
            header.createCell(5).setCellValue("Tipo Display Essence");
            header.createCell(6).setCellValue("Tipo Mueble Display Catrice");

            // Llenar datos
            int rowNum = 1;
            for (TipoMueble tipoMueble : tiposMueble) {
                Row row = sheet.createRow(rowNum++);
                
                // Asegurarse de que el MantenimientoCliente no sea null
                if (tipoMueble.getMantenimientoCliente() != null) {
                    row.createCell(0).setCellValue(tipoMueble.getMantenimientoCliente().getCod_Cliente());
                    row.createCell(1).setCellValue(tipoMueble.getMantenimientoCliente().getNombre_Cliente());
                    row.createCell(2).setCellValue(tipoMueble.getCiudad());
                } else {
                    row.createCell(0).setCellValue("N/A");
                    row.createCell(1).setCellValue("N/A");
                    row.createCell(2).setCellValue("N/A");
                }
                
                // Otros campos de TipoMueble
                row.createCell(3).setCellValue(tipoMueble.getCod_Pdv());
                row.createCell(4).setCellValue(tipoMueble.getNombre_Pdv());
                row.createCell(5).setCellValue(tipoMueble.getTipo_Display_Essence());
                row.createCell(6).setCellValue(tipoMueble.getTipo_Mueble_Display_Catrice());
            }

            // Convertir a bytes
            byte[] byteArray = ExcelUtils.convertWorkbookToByteArray(workbook);

            // Cerrar el archivo
            workbook.close();

            // Retornar el archivo Excel
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=reporte_tipo_mueble.xlsx")
                    .body(byteArray);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
}
