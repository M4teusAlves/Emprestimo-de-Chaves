package com.GGMN.backend.dto;

import java.time.LocalDate;

public record ServidorRecordDto(String nome, String cpf, String contato, LocalDate nascimento) {

}
