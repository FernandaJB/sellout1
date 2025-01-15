/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.manamer.backend.business.sellout.models;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
/**
 *
 * @author Fernanda Jama
 */
@Entity
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre_Producto;
    private String codigo_Sap;
    private String cod_Barra;
    private String cod_Pdv;
    private String descripcion;
    private String pdv;

    @Column(name = "stock_Dolares")
    private double stock_Dolares;
    
    @Column(name = "stock_Unidades")
    private double stock_Unidades;
    
    private Long idMantenimientoCliente;
    private Long idMantenimientoProducto;
}
