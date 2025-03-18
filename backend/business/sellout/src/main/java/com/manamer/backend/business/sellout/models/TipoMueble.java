package com.manamer.backend.business.sellout.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

/**
 *
 * @author Fernanda Jama
 */
@Entity
@Data
public class TipoMueble {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cod_Pdv;

    private String nombre_Pdv;

    private String tipo_Display_Essence;

    private String tipo_Mueble_Display_Catrice;

    // Cambiar 'Cliente' por 'MantenimientoCliente'
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_Cliente", referencedColumnName = "id")
    private MantenimientoCliente mantenimientoCliente;

    private String ciudad;
}
