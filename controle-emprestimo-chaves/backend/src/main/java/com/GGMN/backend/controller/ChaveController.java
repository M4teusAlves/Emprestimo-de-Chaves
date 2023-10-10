package com.GGMN.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GGMN.backend.dto.ChaveRecordDto;
import com.GGMN.backend.model.Chave;
import com.GGMN.backend.repository.ChaveRepository;

@RestController
@RequestMapping("/chaves")
public class ChaveController {
	
	@Autowired
	private ChaveRepository chaveRepository;
	
	@PostMapping
	public ResponseEntity<Chave> saveChave(@RequestBody ChaveRecordDto chaveRecordDto) {
		
		Chave chave = new Chave();
		BeanUtils.copyProperties(chaveRecordDto, chave);
		
		
		return ResponseEntity.status(HttpStatus.CREATED).body(chaveRepository.save(chave));
	}
	
	@GetMapping
	public ResponseEntity<List<Chave>> getAllChaves() {
		
		return ResponseEntity.status(HttpStatus.OK).body(chaveRepository.findAll());
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<List<Chave>> getPerStauts(@PathVariable(value="status") boolean status) {		
		
		
		return ResponseEntity.status(HttpStatus.OK).body(chaveRepository.findByStatus(status));
	}
	
	@GetMapping("/situacao/{situacao}")
	public ResponseEntity<List<Chave>> getPerSituacao(@PathVariable(value="situacao") String situacao) {		
		
		List<Chave> chaves = new ArrayList<>();
		
		for (Chave chave : chaveRepository.findBySituacao(situacao)) {
			if(chave.getStatus() == true) {
				chaves.add(chave);
			}
		}
		
		
		
		return ResponseEntity.status(HttpStatus.OK).body(chaves);
	}
}
