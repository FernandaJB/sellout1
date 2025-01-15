/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.manamer.backend.business.sellout.repositories;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.manamer.backend.business.sellout.models.*;
/**
 *
 * @author Fernanda Jama
 */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long>{

    
}
