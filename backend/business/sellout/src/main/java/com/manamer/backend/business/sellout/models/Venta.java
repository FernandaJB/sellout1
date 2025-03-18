/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.manamer.backend.business.sellout.models;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import jakarta.persistence.Transient;
/**
 *
 * @author Fernanda Jama
 */
@Data
@Entity
public class Venta {
    
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int anio;
    private int mes;
    private int dia;
    private String marca;
    private double venta_Dolares;
    private double venta_Unidad;
    private String nombre_Producto;
    private String codigo_Sap;

    @Column(name = "cod_Barra")
    private String codBarra;
    private String cod_Pdv;
    private String descripcion;
    private String pdv;
    private double stock_Dolares;
    private double stock_Unidades;
    
    @Transient // Este campo NO se guardará en la base de datos
    private String ciudad;

     // Cambiar 'Cliente' por 'MantenimientoCliente'
     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "id_MantenimientoCliente", referencedColumnName = "id")
     private MantenimientoCliente mantenimientoCliente;

     // Cambiar 'Producto' por 'MantenimientoProducto'
     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "id_MantenimientoProducto", referencedColumnName = "id")
     private MantenimientoProducto mantenimientoProducto;

    private String unidades_Diarias;
 }
