package com.GGMN.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.GGMN.backend.model.Emprestimo;

public interface EmprestimoRepository extends MongoRepository<Emprestimo, String>{

}
