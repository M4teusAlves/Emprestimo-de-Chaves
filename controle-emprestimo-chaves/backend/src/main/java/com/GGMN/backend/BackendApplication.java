package com.GGMN.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.GGMN.backend.controller.ChaveController;



@SpringBootApplication
public class BackendApplication{

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
	

}
