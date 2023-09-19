package com.GGMN.backend.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;

public class Servidor {
	
	@Id
	private String id;
	
	private String nome;
	private String cpf;
	private String contato;
	private LocalDate dataNascimento;
	private boolean status;
	

	public Servidor() {
	
	}


	public Servidor(String nome, String cpf, String contato, LocalDate dataNascimento, boolean status) {
		this.nome = nome;
		this.cpf = cpf;
		this.contato = contato;
		this.dataNascimento = dataNascimento;
		this.status = status;
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


	public String getCpf() {
		return cpf;
	}


	public void setCpf(String cpf) {
		this.cpf = cpf;
	}


	public String getContato() {
		return contato;
	}


	public void setContato(String contato) {
		this.contato = contato;
	}


	public LocalDate getDataNascimento() {
		return dataNascimento;
	}


	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}


	public boolean isStatus() {
		return status;
	}


	public void setStatus(boolean status) {
		this.status = status;
	}


	@Override
	public String toString() {
		return "Servidor [id=" + id + ", nome=" + nome + ", cpf=" + cpf + ", contato=" + contato + ", dataNascimento="
				+ dataNascimento + ", status=" + status + "]";
	}
	

}
