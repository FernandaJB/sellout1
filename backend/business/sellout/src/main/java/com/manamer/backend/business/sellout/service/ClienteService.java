package com.manamer.backend.business.sellout.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.manamer.backend.business.sellout.models.Cliente;
import com.manamer.backend.business.sellout.repositories.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {
@Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }
}
