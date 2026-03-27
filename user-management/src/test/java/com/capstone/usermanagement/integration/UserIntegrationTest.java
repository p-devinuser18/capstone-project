package com.capstone.usermanagement.integration;

import com.capstone.usermanagement.dto.CreateUserRequest;
import com.capstone.usermanagement.dto.UpdateUserRequest;
import com.capstone.usermanagement.model.User;
import com.capstone.usermanagement.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private User createAndSaveUser(String firstName, String lastName, String email, String phone, String role) {
        User user = new User(firstName, lastName, email, phone, role);
        return userRepository.save(user);
    }

    @Nested
    @DisplayName("Create User Integration Tests")
    class CreateUserIntegration {

        @Test
        @DisplayName("Should create user end-to-end")
        void shouldCreateUserEndToEnd() throws Exception {
            CreateUserRequest request = new CreateUserRequest(
                    "John", "Doe", "john@example.com", "1234567890", "ADMIN");

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.firstName", is("John")))
                    .andExpect(jsonPath("$.data.lastName", is("Doe")))
                    .andExpect(jsonPath("$.data.email", is("john@example.com")))
                    .andExpect(jsonPath("$.data.phone", is("1234567890")))
                    .andExpect(jsonPath("$.data.role", is("ADMIN")))
                    .andExpect(jsonPath("$.data.active", is(true)))
                    .andExpect(jsonPath("$.data.id").isNotEmpty())
                    .andExpect(jsonPath("$.data.createdAt").isNotEmpty())
                    .andExpect(jsonPath("$.data.updatedAt").isNotEmpty());

            assertThat(userRepository.count()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should reject duplicate email")
        void shouldRejectDuplicateEmail() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");

            CreateUserRequest request = new CreateUserRequest(
                    "Jane", "Smith", "john@example.com", "0987654321", "USER");

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("Should reject invalid request body")
        void shouldRejectInvalidRequestBody() throws Exception {
            CreateUserRequest request = new CreateUserRequest("", "", "invalid", "123", "");

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)));
        }
    }

    @Nested
    @DisplayName("Get User Integration Tests")
    class GetUserIntegration {

        @Test
        @DisplayName("Should get user by id")
        void shouldGetUserById() throws Exception {
            User saved = createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");

            mockMvc.perform(get("/api/users/" + saved.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.firstName", is("John")))
                    .andExpect(jsonPath("$.data.email", is("john@example.com")));
        }

        @Test
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistentUser() throws Exception {
            mockMvc.perform(get("/api/users/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("Should get all users")
        void shouldGetAllUsers() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");

            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(2)));
        }

        @Test
        @DisplayName("Should get active users")
        void shouldGetActiveUsers() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            User inactive = createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");
            inactive.setActive(false);
            userRepository.save(inactive);

            mockMvc.perform(get("/api/users/active"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].active", is(true)));
        }

        @Test
        @DisplayName("Should get inactive users")
        void shouldGetInactiveUsers() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            User inactive = createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");
            inactive.setActive(false);
            userRepository.save(inactive);

            mockMvc.perform(get("/api/users/inactive"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].active", is(false)));
        }

        @Test
        @DisplayName("Should get users by role")
        void shouldGetUsersByRole() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");

            mockMvc.perform(get("/api/users/role/ADMIN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].role", is("ADMIN")));
        }

        @Test
        @DisplayName("Should search users by name")
        void shouldSearchUsersByName() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");

            mockMvc.perform(get("/api/users/search").param("keyword", "John"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].firstName", is("John")));
        }

        @Test
        @DisplayName("Should get user by email")
        void shouldGetUserByEmail() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");

            mockMvc.perform(get("/api/users/email/john@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.email", is("john@example.com")));
        }

        @Test
        @DisplayName("Should return 404 for non-existent email")
        void shouldReturn404ForNonExistentEmail() throws Exception {
            mockMvc.perform(get("/api/users/email/notfound@example.com"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("Should get user count")
        void shouldGetUserCount() throws Exception {
            createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");

            mockMvc.perform(get("/api/users/count"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", is(2)));
        }
    }

    @Nested
    @DisplayName("Update User Integration Tests")
    class UpdateUserIntegration {

        @Test
        @DisplayName("Should update user end-to-end")
        void shouldUpdateUserEndToEnd() throws Exception {
            User saved = createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");

            UpdateUserRequest request = new UpdateUserRequest(
                    "Jane", "Smith", "jane@example.com", "0987654321", "USER");

            mockMvc.perform(put("/api/users/" + saved.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.firstName", is("Jane")))
                    .andExpect(jsonPath("$.data.lastName", is("Smith")))
                    .andExpect(jsonPath("$.data.email", is("jane@example.com")));

            User updated = userRepository.findById(saved.getId()).orElseThrow();
            assertThat(updated.getFirstName()).isEqualTo("Jane");
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent user")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            UpdateUserRequest request = new UpdateUserRequest("Jane", null, null, null, null);

            mockMvc.perform(put("/api/users/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should reject duplicate email on update")
        void shouldRejectDuplicateEmailOnUpdate() throws Exception {
            User user1 = createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            createAndSaveUser("Jane", "Smith", "jane@example.com", "0987654321", "USER");

            UpdateUserRequest request = new UpdateUserRequest(null, null, "jane@example.com", null, null);

            mockMvc.perform(put("/api/users/" + user1.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("Activate/Deactivate User Integration Tests")
    class ActivateDeactivateIntegration {

        @Test
        @DisplayName("Should deactivate user end-to-end")
        void shouldDeactivateUserEndToEnd() throws Exception {
            User saved = createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");

            mockMvc.perform(patch("/api/users/" + saved.getId() + "/deactivate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.active", is(false)));

            User deactivated = userRepository.findById(saved.getId()).orElseThrow();
            assertThat(deactivated.isActive()).isFalse();
        }

        @Test
        @DisplayName("Should activate user end-to-end")
        void shouldActivateUserEndToEnd() throws Exception {
            User saved = createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            saved.setActive(false);
            userRepository.save(saved);

            mockMvc.perform(patch("/api/users/" + saved.getId() + "/activate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.active", is(true)));

            User activated = userRepository.findById(saved.getId()).orElseThrow();
            assertThat(activated.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should return 404 when deactivating non-existent user")
        void shouldReturn404WhenDeactivatingNonExistent() throws Exception {
            mockMvc.perform(patch("/api/users/999/deactivate"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when activating non-existent user")
        void shouldReturn404WhenActivatingNonExistent() throws Exception {
            mockMvc.perform(patch("/api/users/999/activate"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Delete User Integration Tests")
    class DeleteUserIntegration {

        @Test
        @DisplayName("Should delete user end-to-end")
        void shouldDeleteUserEndToEnd() throws Exception {
            User saved = createAndSaveUser("John", "Doe", "john@example.com", "1234567890", "ADMIN");

            mockMvc.perform(delete("/api/users/" + saved.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)));

            assertThat(userRepository.findById(saved.getId())).isEmpty();
        }

        @Test
        @DisplayName("Should return 404 when deleting non-existent user")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            mockMvc.perform(delete("/api/users/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Full Workflow Integration Tests")
    class FullWorkflowIntegration {

        @Test
        @DisplayName("Should support complete CRUD workflow")
        void shouldSupportCompleteCrudWorkflow() throws Exception {
            // Create
            CreateUserRequest createRequest = new CreateUserRequest(
                    "John", "Doe", "john@example.com", "1234567890", "ADMIN");

            String createResponse = mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Long userId = objectMapper.readTree(createResponse).get("data").get("id").asLong();

            // Read
            mockMvc.perform(get("/api/users/" + userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.firstName", is("John")));

            // Update
            UpdateUserRequest updateRequest = new UpdateUserRequest("Updated", null, null, null, null);
            mockMvc.perform(put("/api/users/" + userId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.firstName", is("Updated")));

            // Deactivate
            mockMvc.perform(patch("/api/users/" + userId + "/deactivate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.active", is(false)));

            // Activate
            mockMvc.perform(patch("/api/users/" + userId + "/activate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.active", is(true)));

            // Delete
            mockMvc.perform(delete("/api/users/" + userId))
                    .andExpect(status().isOk());

            // Verify deleted
            mockMvc.perform(get("/api/users/" + userId))
                    .andExpect(status().isNotFound());
        }
    }
}
