package com.GGMN.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.GGMN.backend.model.Servidor;

@Repository
public interface ServidorRepository extends MongoRepository<Servidor, String>{

}
