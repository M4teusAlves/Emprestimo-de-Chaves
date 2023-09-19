package com.GGMN.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;

public class Emprestimo {
	
	@Id
	private String id;
	private LocalDateTime dataHoraEmprestimo;
	private LocalDateTime dataHoraDevolucao;
	private Chave chave;
	private Servidor servidorRetirou;
	private Servidor servidorDevolveu;
	private boolean status;
	

	public Emprestimo() {
		
	}


	public Emprestimo(String id, LocalDateTime dataHoraEmprestimo, LocalDateTime dataHoraDevolucao, Chave chave,
			Servidor servidorRetirou, Servidor servidorDevolveu, boolean status) {
		this.dataHoraEmprestimo = dataHoraEmprestimo;
		this.dataHoraDevolucao = dataHoraDevolucao;
		this.chave = chave;
		this.servidorRetirou = servidorRetirou;
		this.servidorDevolveu = servidorDevolveu;
		this.status = status;
	}


	public String getId() {
		return id;
	}


	public void setId(String id) {
		this.id = id;
	}


	public LocalDateTime getDataHoraEmprestimo() {
		return dataHoraEmprestimo;
	}


	public void setDataHoraEmprestimo(LocalDateTime dataHoraEmprestimo) {
		this.dataHoraEmprestimo = dataHoraEmprestimo;
	}


	public LocalDateTime getDataHoraDevolucao() {
		return dataHoraDevolucao;
	}


	public void setDataHoraDevolucao(LocalDateTime dataHoraDevolucao) {
		this.dataHoraDevolucao = dataHoraDevolucao;
	}


	public Chave getChave() {
		return chave;
	}


	public void setChave(Chave chave) {
		this.chave = chave;
	}


	public Servidor getServidorRetirou() {
		return servidorRetirou;
	}


	public void setServidorRetirou(Servidor servidorRetirou) {
		this.servidorRetirou = servidorRetirou;
	}


	public Servidor getServidorDevolveu() {
		return servidorDevolveu;
	}


	public void setServidorDevolveu(Servidor servidorDevolveu) {
		this.servidorDevolveu = servidorDevolveu;
	}


	public boolean isStatus() {
		return status;
	}


	public void setStatus(boolean status) {
		this.status = status;
	}


	@Override
	public String toString() {
		return "Emprestimo [id=" + id + ", dataHoraEmprestimo=" + dataHoraEmprestimo + ", dataHoraDevolucao="
				+ dataHoraDevolucao + ", chave=" + chave + ", servidorRetirou=" + servidorRetirou
				+ ", servidorDevolveu=" + servidorDevolveu + ", status=" + status + "]";
	}
	
	

}
