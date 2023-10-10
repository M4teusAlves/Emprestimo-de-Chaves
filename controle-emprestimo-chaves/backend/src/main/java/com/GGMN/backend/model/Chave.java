package com.GGMN.backend.model;


import java.io.Serializable;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.annotation.Generated;

@Document(collection = "chaves")
public class Chave{
	
	@Id
	private String id;
	
	private String nome;
	
	private String situacao;
	
	private boolean status;
	

	public Chave(String nome, String situacao, boolean status) {
		this.nome = nome;
		this.situacao = situacao;
		this.status = status;
	}
	
	public Chave() {
		
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public String getNome() {
		return nome;
	}

	
	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getSituacao() {
		return situacao;
	}

	public void setSituacao(String situacao) {
		this.situacao = situacao;
	}

	public boolean getStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

	@Override
	public String toString() {
		return "Chave [id=" + id + ", stuacao=" + situacao + ", status=" + status + "]";
	}

	
}
