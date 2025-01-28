package com.manamer.backend.business.sellout.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.manamer.backend.business.sellout.models.MantenimientoCliente;
import com.manamer.backend.business.sellout.models.TipoMueble;
import com.manamer.backend.business.sellout.repositories.MantenimientoClienteRepository;
import com.manamer.backend.business.sellout.repositories.TipoMuebleRepository;

@Service
public class TipoMuebleService {

    private final TipoMuebleRepository tipoMuebleRepository;

    private final MantenimientoClienteRepository mantenimientoClienteRepository;

    @Autowired
    public TipoMuebleService(TipoMuebleRepository tipoMuebleRepository, MantenimientoClienteRepository mantenimientoClienteRepository) {
        this.tipoMuebleRepository = tipoMuebleRepository;
        this.mantenimientoClienteRepository = mantenimientoClienteRepository;
    }

    public TipoMueble guardarTipoMueble(TipoMueble tipoMueble) {
        return tipoMuebleRepository.save(tipoMueble);
    }

    public List<TipoMueble> obtenerTodosLosTiposMueble() {
        return tipoMuebleRepository.findAll();
    }

    public Optional<TipoMueble> obtenerTipoMueblePorId(Long id) {
        return tipoMuebleRepository.findById(id);
    }

    public TipoMueble actualizarTipoMueble(Long id, TipoMueble nuevoTipoMueble) {
        return tipoMuebleRepository.findById(id).map(tipoMueble -> {
            tipoMueble.setCod_Pdv(nuevoTipoMueble.getCod_Pdv());
            tipoMueble.setNombre_Pdv(nuevoTipoMueble.getNombre_Pdv());
            tipoMueble.setTipo_Display_Essence(nuevoTipoMueble.getTipo_Display_Essence());
            tipoMueble.setTipo_Mueble_Display_Catrice(nuevoTipoMueble.getTipo_Mueble_Display_Catrice());
            tipoMueble.setMantenimientoCliente(nuevoTipoMueble.getMantenimientoCliente());
            return tipoMuebleRepository.save(tipoMueble);
        }).orElseThrow(() -> new RuntimeException("TipoMueble no encontrado con el ID: " + id));
    }

    public boolean eliminarTipoMueble(Long id) {
        return tipoMuebleRepository.findById(id).map(tipoMueble -> {
            tipoMuebleRepository.delete(tipoMueble);
            return true;
        }).orElse(false);
    }

    public List<TipoMueble> cargarTipoMueblesDesdeArchivo(MultipartFile file) {
        List<TipoMueble> tipoMuebles = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0) {
                    continue; // Skip header row
                }
                TipoMueble tipoMueble = new TipoMueble();
                tipoMueble.setCod_Pdv(getCellValueAsString(row.getCell(0)));
                tipoMueble.setNombre_Pdv(getCellValueAsString(row.getCell(1)));
                tipoMueble.setTipo_Display_Essence(getCellValueAsString(row.getCell(2)));
                tipoMueble.setTipo_Mueble_Display_Catrice(getCellValueAsString(row.getCell(3)));

                // Asignar siempre el clienteId 5969
                Long clienteId = 5969L;
                MantenimientoCliente mantenimientoCliente = mantenimientoClienteRepository.findById(clienteId)
                        .orElseThrow(() -> new RuntimeException("MantenimientoCliente no encontrado con el ID: " + clienteId));
                tipoMueble.setMantenimientoCliente(mantenimientoCliente);

                tipoMuebles.add(tipoMueble);
            }
            tipoMuebleRepository.saveAll(tipoMuebles);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al cargar el archivo: " + e.getMessage());
        }
        return tipoMuebles;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    public boolean eliminarTiposMueble(List<Long> ids) {
        List<TipoMueble> tiposMuebles = tipoMuebleRepository.findAllById(ids);
        if (tiposMuebles.isEmpty()) {
            return false;
        }
        tipoMuebleRepository.deleteAll(tiposMuebles);
        return true;
    }
    
}