package com.manamer.backend.business.sellout.controller;

import com.manamer.backend.business.sellout.models.Cliente;
import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;
import com.manamer.backend.business.sellout.models.Producto;
import com.manamer.backend.business.sellout.models.TipoMueble;
import com.manamer.backend.business.sellout.models.Venta;
import com.manamer.backend.business.sellout.repositories.ClienteRepository;
import com.manamer.backend.business.sellout.repositories.MantenimientoProductoRepository;
import com.manamer.backend.business.sellout.repositories.ProductoRepository;
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
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/fybeca")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class FybecaController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProductoRepository productoRepository;

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

    // Métodos para productos
    @GetMapping("/productos") // Endpoints relacionados con productos
    public List<Producto> obtenerProductos() {
        return productoRepository.findAll();
    }

    @GetMapping("/producto/{id}")
    public ResponseEntity<Producto> obtenerProducto(@PathVariable Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        return producto.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/producto")
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        Producto nuevoProducto = productoRepository.save(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/producto/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        producto.setId(id);
        Producto productoActualizado = productoRepository.save(producto);
        return ResponseEntity.ok(productoActualizado);
    }

    @DeleteMapping("/producto/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        productoRepository.deleteById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // Métodos para clientes
    @GetMapping("/clientes") // Endpoint para obtener todos los clientes
    public List<Cliente> getAllClientes() {
        return clienteService.getAllClientes();
    }

    // Métodos para ventas
    @GetMapping("/ventas") // Obtener todas las ventas
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

    @DeleteMapping("/eliminar-ventas-forma-masiva")
    public ResponseEntity<Void> eliminarVentas(@RequestBody List<Long> ids) {
        if (ventaService.eliminarVentas(ids)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/subir-archivo")
    public ResponseEntity<String> subirArchivo(@RequestParam("file") MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Venta> ventas = new ArrayList<>();

            // Iterar sobre todas las filas a partir de la fila 2 (índice 1)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    Venta venta = new Venta();

                    if (row.getCell(0) != null && row.getCell(0).getCellType() == CellType.NUMERIC) {
                        venta.setAnio((int) row.getCell(0).getNumericCellValue());
                    }
                    if (row.getCell(1) != null && row.getCell(1).getCellType() == CellType.NUMERIC) {
                        venta.setMes((int) row.getCell(1).getNumericCellValue());
                    }
                    if (row.getCell(2) != null) {
                        if (row.getCell(2).getCellType() == CellType.NUMERIC) {
                            venta.setVenta_Dolares(row.getCell(2).getNumericCellValue());
                        } else if (row.getCell(2).getCellType() == CellType.STRING) {
                            try {
                                venta.setVenta_Dolares(Double.parseDouble(row.getCell(2).getStringCellValue()));
                            } catch (NumberFormatException e) {
                                e.printStackTrace(); // Manejar el error si el valor no es un número válido
                            }
                        }
                    }
                    if (row.getCell(3) != null && row.getCell(3).getCellType() == CellType.NUMERIC) {
                        venta.setVenta_Unidad(row.getCell(3).getNumericCellValue());
                    }
                    if (row.getCell(4) != null) {
                        if (row.getCell(4).getCellType() == CellType.STRING) {
                            venta.setCodBarra(row.getCell(4).getStringCellValue());
                        } else if (row.getCell(4).getCellType() == CellType.NUMERIC) {
                            row.getCell(4).setCellType(CellType.STRING);
                            venta.setCodBarra(row.getCell(4).getStringCellValue());
                        }
                    }
                    if (row.getCell(5) != null) {
                        if (row.getCell(5).getCellType() == CellType.STRING) {
                            venta.setCod_Pdv(row.getCell(5).getStringCellValue());
                        } else if (row.getCell(5).getCellType() == CellType.NUMERIC) {
                            row.getCell(5).setCellType(CellType.STRING);
                            venta.setCod_Pdv(row.getCell(5).getStringCellValue());
                        }
                    }
                    if (row.getCell(6) != null) {
                        if (row.getCell(6).getCellType() == CellType.STRING) {
                            venta.setPdv(row.getCell(6).getStringCellValue());
                        } else if (row.getCell(6).getCellType() == CellType.NUMERIC) {
                            row.getCell(6).setCellType(CellType.STRING);
                            venta.setPdv(row.getCell(6).getStringCellValue());
                        }
                    }
                    if (row.getCell(7) != null) {
                        if (row.getCell(7).getCellType() == CellType.NUMERIC) {
                            venta.setStock_Dolares(row.getCell(7).getNumericCellValue());
                        } else if (row.getCell(7).getCellType() == CellType.STRING) {
                            try {
                                venta.setStock_Dolares(Double.parseDouble(row.getCell(7).getStringCellValue()));
                            } catch (NumberFormatException e) {
                                e.printStackTrace(); // Manejar el error si el valor no es un número válido
                            }
                        }
                    }
                    if (row.getCell(8) != null && row.getCell(8).getCellType() == CellType.NUMERIC) {
                        venta.setStock_Unidades(row.getCell(8).getNumericCellValue());
                    }

                    // Llamar al servicio para cargar los datos del producto
                    boolean datosCargados = ventaService.cargarDatosDeProducto(venta);

                    if (!datosCargados) {
                        return new ResponseEntity<>("El código de barra no existe en el sistema", HttpStatus.BAD_REQUEST);
                    }

                    // Agregar la venta a la lista
                    ventas.add(venta);
                }
            }

            // Procesar las ventas en paralelo
            ExecutorService executor = Executors.newFixedThreadPool(4);
            int batchSize = 100;
            for (int i = 0; i < ventas.size(); i += batchSize) {
                int start = i;
                int end = Math.min(i + batchSize, ventas.size());
                List<Venta> batchList = ventas.subList(start, end);
                executor.submit(() -> ventaService.guardarVentas(batchList));
            }
            executor.shutdown();
            executor.awaitTermination(1, TimeUnit.HOURS);

            return ResponseEntity.ok("Archivo subido y procesado correctamente.");
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al procesar el archivo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Endpoint para obtener todas las marcas disponibles
    @GetMapping("/marcas-ventas")
    public List<String> obtenerMarcasDisponibles() {
        return ventaService.obtenerMarcasDisponibles();
    }
    
    // Métodos para mantenimiento de clientes
    @GetMapping("/mantenimiento/clientes")
    public List<MantenimientoCliente> tablaMantenimientoClientes() {
        return serviceClienteService.getAllClientes();
    }

    @GetMapping("/mantenimiento/cliente/{id}")
    public ResponseEntity<MantenimientoCliente> obtenerMantenimientoCliente(@PathVariable Long id) {
        return serviceClienteService.getClienteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mantenimiento/cliente")
    public MantenimientoCliente crearMantenimientoCliente(@RequestBody MantenimientoCliente cliente) {
        return serviceClienteService.saveOrUpdate(cliente);
    }

    @PutMapping("/mantenimiento/cliente/{id}")
    public ResponseEntity<MantenimientoCliente> actualizarMantenimientoCliente(@PathVariable Long id, @RequestBody MantenimientoCliente cliente) {
        if (!serviceClienteService.getClienteById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        cliente.setId(id);
        return ResponseEntity.ok(serviceClienteService.saveOrUpdate(cliente));
    }

    @DeleteMapping("/mantenimiento/cliente/{id}")
    public ResponseEntity<Void> eliminarMantenimientoCliente(@PathVariable Long id) {
        if (!serviceClienteService.getClienteById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        serviceClienteService.deleteCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mantenimiento/clientes/upload")
    public String uploadClientes(@RequestParam("file") MultipartFile file) {
        return servicio.uploadClientesFromExcel(file);
    }

    // Métodos para mantenimiento de productos
    @GetMapping("/mantenimiento/productos")
    public List<MantenimientoProducto> tablaMantenimientoProductos() {
        return serviceProductoService.getAllProductos();
    }

    @PostMapping("/mantenimiento/producto")
    public MantenimientoProducto crearMantenimientoProducto(@RequestBody MantenimientoProducto producto) {
        return serviceProductoService.saveOrUpdate(producto);
    }

    @PostMapping("/mantenimiento/productos/cargar")
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

    @DeleteMapping("/mantenimiento/productos/eliminar")
    public ResponseEntity<String> eliminarProductos(@RequestBody List<Long> ids) {
        try {
            mantenimientoProductoService.deleteProductos(ids);
            return ResponseEntity.ok("Productos eliminados correctamente.");
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    //CRUD de tabla Tipo Mueble

    @PostMapping("/crear-nuevo-tipo-mueble")
    public ResponseEntity<TipoMueble> crearTipoMueble(@RequestBody TipoMueble tipoMueble) {
        TipoMueble nuevoTipoMueble = tipoMuebleService.guardarTipoMueble(tipoMueble);
        return ResponseEntity.ok(nuevoTipoMueble);
    }

    @GetMapping("/find-all-tipo-mueble")
    public ResponseEntity<List<TipoMueble>> obtenerTodosLosTiposMueble() {
        List<TipoMueble> tiposMueble = tipoMuebleService.obtenerTodosLosTiposMueble();
        return ResponseEntity.ok(tiposMueble);
    }

    @GetMapping("/find-id-tipo-mueble/{id}")
    public ResponseEntity<TipoMueble> obtenerTipoMueblePorId(@PathVariable Long id) {
        Optional<TipoMueble> tipoMueble = tipoMuebleService.obtenerTipoMueblePorId(id);
        return tipoMueble.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/actualizar-tipo-mueble/{id}")
    public ResponseEntity<TipoMueble> actualizarTipoMueble(@PathVariable Long id, @RequestBody TipoMueble nuevoTipoMueble) {
        try {
            TipoMueble tipoMuebleActualizado = tipoMuebleService.actualizarTipoMueble(id, nuevoTipoMueble);
            return ResponseEntity.ok(tipoMuebleActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/eliminar-id-tipo-mueble/{id}")
    public ResponseEntity<Void> eliminarTipoMueble(@PathVariable Long id) {
        if (tipoMuebleService.eliminarTipoMueble(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/subir-template-tipo-muebles")
    public ResponseEntity<List<TipoMueble>> subirTipoMuebles(@RequestParam("file") MultipartFile file) {
        List<TipoMueble> tipoMuebles = tipoMuebleService.cargarTipoMueblesDesdeArchivo(file);
        return ResponseEntity.ok(tipoMuebles);
    }

    @DeleteMapping("/eliminar-varios-tipo-mueble")
    public ResponseEntity<String> eliminarTiposMueble(@RequestBody List<Long> ids) {
        boolean todosEliminados = tipoMuebleService.eliminarTiposMueble(ids);
        if (todosEliminados) {
            return ResponseEntity.ok("Tipos de muebles eliminados correctamente.");
        } else {
            return ResponseEntity.status(404).body("Algunos tipos de muebles no se encontraron.");
        }
    } // Método para eliminar múltiples TipoMueble por ID
        
}
