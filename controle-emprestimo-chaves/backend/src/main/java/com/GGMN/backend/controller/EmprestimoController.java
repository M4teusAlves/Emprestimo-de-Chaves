package com.GGMN.backend.controller;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GGMN.backend.dto.EmprestimoRecordDto;
import com.GGMN.backend.model.Emprestimo;
import com.GGMN.backend.repository.EmprestimoRepository;

@RestController
@RequestMapping("/emprestimos")
public class EmprestimoController {

	@Autowired
	private EmprestimoRepository emprestimoRepository;
	
	@PostMapping
	public ResponseEntity<Emprestimo> saveEmprestimo(@RequestBody EmprestimoRecordDto emprestimoRecordDto) {
		
		Emprestimo emprestimo = new Emprestimo();
		BeanUtils.copyProperties(emprestimoRecordDto, emprestimo);
		
		
		return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoRepository.save(emprestimo));
	}
	
	@GetMapping
	public ResponseEntity<List<Emprestimo>> getAllEmprestimos() {
		
		return ResponseEntity.status(HttpStatus.OK).body(emprestimoRepository.findAll());
	}
	
}
