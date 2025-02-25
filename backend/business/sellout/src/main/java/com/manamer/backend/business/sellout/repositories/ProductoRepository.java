/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.manamer.backend.business.sellout.repositories;
import com.manamer.backend.business.sellout.models.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
/**
 *
 * @author Fernanda Jama
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long>{


}
