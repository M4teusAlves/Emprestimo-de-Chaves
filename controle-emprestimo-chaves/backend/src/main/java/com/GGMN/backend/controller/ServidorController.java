package com.GGMN.backend.controller;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GGMN.backend.dto.ServidorRecordDto;
import com.GGMN.backend.model.Servidor;
import com.GGMN.backend.repository.ServidorRepository;

@RestController
@RequestMapping("/servidores")
public class ServidorController {
	
	@Autowired
	private ServidorRepository servidorRepository;
	
	@PostMapping
	public ResponseEntity<Servidor> saveServidor(@RequestBody ServidorRecordDto servidorRecordDto) {
		
		Servidor servidor = new Servidor();
		BeanUtils.copyProperties(servidorRecordDto, servidor);
		
		
		return ResponseEntity.status(HttpStatus.CREATED).body(servidorRepository.save(servidor));
	}
	
	@GetMapping
	public ResponseEntity<List<Servidor>> getAllServidores() {
		
		return ResponseEntity.status(HttpStatus.OK).body(servidorRepository.findAll());
	}

}
