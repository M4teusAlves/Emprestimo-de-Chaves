package com.GGMN.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GGMN.backend.model.Chave;

@Repository
public interface ChaveRepository extends MongoRepository<Chave, String>{
	List<Chave> findByStatus(boolean status);
	List<Chave> findBySituacao(String situacao);
	List<Chave> findByNome(String nome);
    Object save(Optional<Chave> chave);
	
}
