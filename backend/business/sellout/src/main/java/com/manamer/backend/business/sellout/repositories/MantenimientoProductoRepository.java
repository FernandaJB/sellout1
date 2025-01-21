package com.manamer.backend.business.sellout.repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.google.common.base.Optional;
import com.manamer.backend.business.sellout.models.MantenimientoProducto;

@Repository
public interface MantenimientoProductoRepository extends JpaRepository<MantenimientoProducto, Long> {
    
    
}

