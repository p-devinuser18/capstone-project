package com.capstone.usermanagement.config;

import com.capstone.usermanagement.model.User;
import com.capstone.usermanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User("John", "Doe", "john.doe@example.com", "1234567890", "ADMIN"));
                userRepository.save(new User("Jane", "Smith", "jane.smith@example.com", "0987654321", "USER"));
                userRepository.save(new User("Bob", "Johnson", "bob.johnson@example.com", "5551234567", "USER"));
                userRepository.save(new User("Alice", "Williams", "alice.williams@example.com", "5559876543", "MANAGER"));
                userRepository.save(new User("Charlie", "Brown", "charlie.brown@example.com", "5555551234", "USER"));
            }
        };
    }
}
