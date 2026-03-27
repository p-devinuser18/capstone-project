package com.capstone.usermanagement.exception;

public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("User already exists with email: " + email);
    }
}
