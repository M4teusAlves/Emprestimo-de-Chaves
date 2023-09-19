package com.GGMN.backend.model;


import org.springframework.data.annotation.Id;

public class Chave {
	@Id
	private String id;
	
	private String stuacao;
	
	private boolean status;
	
	public Chave() {
		
	}

	public Chave(String stuacao, boolean status) {
		this.stuacao = stuacao;
		this.status = status;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getStuacao() {
		return stuacao;
	}

	public void setStuacao(String stuacao) {
		this.stuacao = stuacao;
	}

	public boolean isStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

	@Override
	public String toString() {
		return "Chave [id=" + id + ", stuacao=" + stuacao + ", status=" + status + "]";
	}

	
}
