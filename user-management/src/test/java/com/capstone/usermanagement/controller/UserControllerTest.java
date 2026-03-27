package com.capstone.usermanagement.controller;

import com.capstone.usermanagement.dto.CreateUserRequest;
import com.capstone.usermanagement.dto.UpdateUserRequest;
import com.capstone.usermanagement.dto.UserResponse;
import com.capstone.usermanagement.exception.DuplicateEmailException;
import com.capstone.usermanagement.exception.GlobalExceptionHandler;
import com.capstone.usermanagement.exception.UserNotFoundException;
import com.capstone.usermanagement.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserResponse testUserResponse;
    private CreateUserRequest createRequest;
    private UpdateUserRequest updateRequest;

    @BeforeEach
    void setUp() {
        testUserResponse = new UserResponse();
        testUserResponse.setId(1L);
        testUserResponse.setFirstName("John");
        testUserResponse.setLastName("Doe");
        testUserResponse.setEmail("john@example.com");
        testUserResponse.setPhone("1234567890");
        testUserResponse.setRole("ADMIN");
        testUserResponse.setActive(true);
        testUserResponse.setCreatedAt(LocalDateTime.now());
        testUserResponse.setUpdatedAt(LocalDateTime.now());

        createRequest = new CreateUserRequest("John", "Doe", "john@example.com", "1234567890", "ADMIN");
        updateRequest = new UpdateUserRequest("Jane", "Smith", "jane@example.com", "0987654321", "USER");
    }

    @Nested
    @DisplayName("POST /api/users")
    class CreateUserEndpoint {

        @Test
        @DisplayName("Should create user and return 201")
        void shouldCreateUserSuccessfully() throws Exception {
            when(userService.createUser(any(CreateUserRequest.class))).thenReturn(testUserResponse);

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.firstName", is("John")))
                    .andExpect(jsonPath("$.data.email", is("john@example.com")));
        }

        @Test
        @DisplayName("Should return 409 for duplicate email")
        void shouldReturn409ForDuplicateEmail() throws Exception {
            when(userService.createUser(any(CreateUserRequest.class)))
                    .thenThrow(new DuplicateEmailException("john@example.com"));

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("Should return 400 for invalid request - missing first name")
        void shouldReturn400ForMissingFirstName() throws Exception {
            CreateUserRequest invalidRequest = new CreateUserRequest("", "Doe", "john@example.com", "1234567890", "ADMIN");

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("Should return 400 for invalid email format")
        void shouldReturn400ForInvalidEmail() throws Exception {
            CreateUserRequest invalidRequest = new CreateUserRequest("John", "Doe", "invalid-email", "1234567890", "ADMIN");

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("Should return 400 for missing required fields")
        void shouldReturn400ForMissingRequiredFields() throws Exception {
            CreateUserRequest invalidRequest = new CreateUserRequest();

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)));
        }
    }

    @Nested
    @DisplayName("GET /api/users/{id}")
    class GetUserByIdEndpoint {

        @Test
        @DisplayName("Should return user by id")
        void shouldReturnUserById() throws Exception {
            when(userService.getUserById(1L)).thenReturn(testUserResponse);

            mockMvc.perform(get("/api/users/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.id", is(1)))
                    .andExpect(jsonPath("$.data.firstName", is("John")));
        }

        @Test
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistentUser() throws Exception {
            when(userService.getUserById(99L)).thenThrow(new UserNotFoundException(99L));

            mockMvc.perform(get("/api/users/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success", is(false)));
        }
    }

    @Nested
    @DisplayName("GET /api/users")
    class GetAllUsersEndpoint {

        @Test
        @DisplayName("Should return all users")
        void shouldReturnAllUsers() throws Exception {
            UserResponse user2 = new UserResponse();
            user2.setId(2L);
            user2.setFirstName("Jane");
            user2.setLastName("Smith");
            user2.setEmail("jane@example.com");
            user2.setPhone("0987654321");
            user2.setRole("USER");
            user2.setActive(true);
            user2.setCreatedAt(LocalDateTime.now());
            user2.setUpdatedAt(LocalDateTime.now());

            when(userService.getAllUsers()).thenReturn(Arrays.asList(testUserResponse, user2));

            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(2)));
        }

        @Test
        @DisplayName("Should return empty list")
        void shouldReturnEmptyList() throws Exception {
            when(userService.getAllUsers()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/users/active")
    class GetActiveUsersEndpoint {

        @Test
        @DisplayName("Should return active users")
        void shouldReturnActiveUsers() throws Exception {
            when(userService.getActiveUsers()).thenReturn(List.of(testUserResponse));

            mockMvc.perform(get("/api/users/active"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].active", is(true)));
        }
    }

    @Nested
    @DisplayName("GET /api/users/inactive")
    class GetInactiveUsersEndpoint {

        @Test
        @DisplayName("Should return inactive users")
        void shouldReturnInactiveUsers() throws Exception {
            UserResponse inactiveUser = new UserResponse();
            inactiveUser.setId(3L);
            inactiveUser.setFirstName("Bob");
            inactiveUser.setLastName("Jones");
            inactiveUser.setEmail("bob@example.com");
            inactiveUser.setActive(false);
            inactiveUser.setCreatedAt(LocalDateTime.now());
            inactiveUser.setUpdatedAt(LocalDateTime.now());

            when(userService.getInactiveUsers()).thenReturn(List.of(inactiveUser));

            mockMvc.perform(get("/api/users/inactive"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /api/users/role/{role}")
    class GetUsersByRoleEndpoint {

        @Test
        @DisplayName("Should return users by role")
        void shouldReturnUsersByRole() throws Exception {
            when(userService.getUsersByRole("ADMIN")).thenReturn(List.of(testUserResponse));

            mockMvc.perform(get("/api/users/role/ADMIN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].role", is("ADMIN")));
        }
    }

    @Nested
    @DisplayName("GET /api/users/search")
    class SearchUsersEndpoint {

        @Test
        @DisplayName("Should return search results")
        void shouldReturnSearchResults() throws Exception {
            when(userService.searchUsers("John")).thenReturn(List.of(testUserResponse));

            mockMvc.perform(get("/api/users/search").param("keyword", "John"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /api/users/email/{email}")
    class GetUserByEmailEndpoint {

        @Test
        @DisplayName("Should return user by email")
        void shouldReturnUserByEmail() throws Exception {
            when(userService.getUserByEmail("john@example.com")).thenReturn(testUserResponse);

            mockMvc.perform(get("/api/users/email/john@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.email", is("john@example.com")));
        }

        @Test
        @DisplayName("Should return 404 for non-existent email")
        void shouldReturn404ForNonExistentEmail() throws Exception {
            when(userService.getUserByEmail("notfound@example.com"))
                    .thenThrow(new UserNotFoundException("User not found with email: notfound@example.com"));

            mockMvc.perform(get("/api/users/email/notfound@example.com"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success", is(false)));
        }
    }

    @Nested
    @DisplayName("PUT /api/users/{id}")
    class UpdateUserEndpoint {

        @Test
        @DisplayName("Should update user successfully")
        void shouldUpdateUserSuccessfully() throws Exception {
            UserResponse updatedResponse = new UserResponse();
            updatedResponse.setId(1L);
            updatedResponse.setFirstName("Jane");
            updatedResponse.setLastName("Smith");
            updatedResponse.setEmail("jane@example.com");
            updatedResponse.setPhone("0987654321");
            updatedResponse.setRole("USER");
            updatedResponse.setActive(true);
            updatedResponse.setCreatedAt(LocalDateTime.now());
            updatedResponse.setUpdatedAt(LocalDateTime.now());

            when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(updatedResponse);

            mockMvc.perform(put("/api/users/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.firstName", is("Jane")));
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent user")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            when(userService.updateUser(eq(99L), any(UpdateUserRequest.class)))
                    .thenThrow(new UserNotFoundException(99L));

            mockMvc.perform(put("/api/users/99")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PATCH /api/users/{id}/deactivate")
    class DeactivateUserEndpoint {

        @Test
        @DisplayName("Should deactivate user successfully")
        void shouldDeactivateUserSuccessfully() throws Exception {
            UserResponse deactivated = new UserResponse();
            deactivated.setId(1L);
            deactivated.setActive(false);
            deactivated.setCreatedAt(LocalDateTime.now());
            deactivated.setUpdatedAt(LocalDateTime.now());

            when(userService.deactivateUser(1L)).thenReturn(deactivated);

            mockMvc.perform(patch("/api/users/1/deactivate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.active", is(false)));
        }

        @Test
        @DisplayName("Should return 404 when deactivating non-existent user")
        void shouldReturn404WhenDeactivatingNonExistent() throws Exception {
            when(userService.deactivateUser(99L)).thenThrow(new UserNotFoundException(99L));

            mockMvc.perform(patch("/api/users/99/deactivate"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PATCH /api/users/{id}/activate")
    class ActivateUserEndpoint {

        @Test
        @DisplayName("Should activate user successfully")
        void shouldActivateUserSuccessfully() throws Exception {
            UserResponse activated = new UserResponse();
            activated.setId(1L);
            activated.setActive(true);
            activated.setCreatedAt(LocalDateTime.now());
            activated.setUpdatedAt(LocalDateTime.now());

            when(userService.activateUser(1L)).thenReturn(activated);

            mockMvc.perform(patch("/api/users/1/activate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.active", is(true)));
        }

        @Test
        @DisplayName("Should return 404 when activating non-existent user")
        void shouldReturn404WhenActivatingNonExistent() throws Exception {
            when(userService.activateUser(99L)).thenThrow(new UserNotFoundException(99L));

            mockMvc.perform(patch("/api/users/99/activate"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/users/{id}")
    class DeleteUserEndpoint {

        @Test
        @DisplayName("Should delete user successfully")
        void shouldDeleteUserSuccessfully() throws Exception {
            doNothing().when(userService).deleteUser(1L);

            mockMvc.perform(delete("/api/users/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)));
        }

        @Test
        @DisplayName("Should return 404 when deleting non-existent user")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            doThrow(new UserNotFoundException(99L)).when(userService).deleteUser(99L);

            mockMvc.perform(delete("/api/users/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/users/count")
    class GetUserCountEndpoint {

        @Test
        @DisplayName("Should return user count")
        void shouldReturnUserCount() throws Exception {
            when(userService.getUserCount()).thenReturn(5L);

            mockMvc.perform(get("/api/users/count"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", is(5)));
        }
    }
}
