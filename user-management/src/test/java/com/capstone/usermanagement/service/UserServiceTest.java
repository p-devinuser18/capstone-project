package com.capstone.usermanagement.service;

import com.capstone.usermanagement.dto.CreateUserRequest;
import com.capstone.usermanagement.dto.UpdateUserRequest;
import com.capstone.usermanagement.dto.UserResponse;
import com.capstone.usermanagement.exception.DuplicateEmailException;
import com.capstone.usermanagement.exception.UserNotFoundException;
import com.capstone.usermanagement.model.User;
import com.capstone.usermanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private CreateUserRequest createRequest;
    private UpdateUserRequest updateRequest;

    @BeforeEach
    void setUp() {
        testUser = new User("John", "Doe", "john@example.com", "1234567890", "ADMIN");
        testUser.setId(1L);
        testUser.setActive(true);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        createRequest = new CreateUserRequest("John", "Doe", "john@example.com", "1234567890", "ADMIN");
        updateRequest = new UpdateUserRequest("Jane", "Smith", "jane@example.com", "0987654321", "USER");
    }

    @Nested
    @DisplayName("Create User Tests")
    class CreateUserTests {

        @Test
        @DisplayName("Should create user successfully")
        void shouldCreateUserSuccessfully() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UserResponse response = userService.createUser(createRequest);

            assertThat(response).isNotNull();
            assertThat(response.getFirstName()).isEqualTo("John");
            assertThat(response.getLastName()).isEqualTo("Doe");
            assertThat(response.getEmail()).isEqualTo("john@example.com");
            verify(userRepository, times(1)).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw DuplicateEmailException when email exists")
        void shouldThrowDuplicateEmailException() {
            when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(createRequest))
                    .isInstanceOf(DuplicateEmailException.class)
                    .hasMessageContaining("john@example.com");

            verify(userRepository, never()).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Get User Tests")
    class GetUserTests {

        @Test
        @DisplayName("Should get user by id successfully")
        void shouldGetUserByIdSuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserResponse response = userService.getUserById(1L);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getFirstName()).isEqualTo("John");
        }

        @Test
        @DisplayName("Should throw UserNotFoundException when user not found")
        void shouldThrowUserNotFoundExceptionForInvalidId() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(99L))
                    .isInstanceOf(UserNotFoundException.class)
                    .hasMessageContaining("99");
        }

        @Test
        @DisplayName("Should get all users")
        void shouldGetAllUsers() {
            User user2 = new User("Jane", "Smith", "jane@example.com", "0987654321", "USER");
            user2.setId(2L);
            user2.setActive(true);
            user2.setCreatedAt(LocalDateTime.now());
            user2.setUpdatedAt(LocalDateTime.now());

            when(userRepository.findAll()).thenReturn(Arrays.asList(testUser, user2));

            List<UserResponse> users = userService.getAllUsers();

            assertThat(users).hasSize(2);
            verify(userRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no users exist")
        void shouldReturnEmptyListWhenNoUsers() {
            when(userRepository.findAll()).thenReturn(Collections.emptyList());

            List<UserResponse> users = userService.getAllUsers();

            assertThat(users).isEmpty();
        }

        @Test
        @DisplayName("Should get active users")
        void shouldGetActiveUsers() {
            when(userRepository.findByActiveTrue()).thenReturn(List.of(testUser));

            List<UserResponse> users = userService.getActiveUsers();

            assertThat(users).hasSize(1);
            assertThat(users.get(0).isActive()).isTrue();
        }

        @Test
        @DisplayName("Should get inactive users")
        void shouldGetInactiveUsers() {
            User inactiveUser = new User("Bob", "Jones", "bob@example.com", "5551234567", "USER");
            inactiveUser.setId(3L);
            inactiveUser.setActive(false);
            inactiveUser.setCreatedAt(LocalDateTime.now());
            inactiveUser.setUpdatedAt(LocalDateTime.now());

            when(userRepository.findByActiveFalse()).thenReturn(List.of(inactiveUser));

            List<UserResponse> users = userService.getInactiveUsers();

            assertThat(users).hasSize(1);
            assertThat(users.get(0).isActive()).isFalse();
        }

        @Test
        @DisplayName("Should get users by role")
        void shouldGetUsersByRole() {
            when(userRepository.findByRole("ADMIN")).thenReturn(List.of(testUser));

            List<UserResponse> users = userService.getUsersByRole("ADMIN");

            assertThat(users).hasSize(1);
            assertThat(users.get(0).getRole()).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("Should search users by keyword")
        void shouldSearchUsersByKeyword() {
            when(userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase("John", "John"))
                    .thenReturn(List.of(testUser));

            List<UserResponse> users = userService.searchUsers("John");

            assertThat(users).hasSize(1);
            assertThat(users.get(0).getFirstName()).isEqualTo("John");
        }

        @Test
        @DisplayName("Should get user by email successfully")
        void shouldGetUserByEmailSuccessfully() {
            when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

            UserResponse response = userService.getUserByEmail("john@example.com");

            assertThat(response).isNotNull();
            assertThat(response.getEmail()).isEqualTo("john@example.com");
        }

        @Test
        @DisplayName("Should throw UserNotFoundException for invalid email")
        void shouldThrowUserNotFoundExceptionForInvalidEmail() {
            when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserByEmail("notfound@example.com"))
                    .isInstanceOf(UserNotFoundException.class)
                    .hasMessageContaining("notfound@example.com");
        }
    }

    @Nested
    @DisplayName("Update User Tests")
    class UpdateUserTests {

        @Test
        @DisplayName("Should update user successfully")
        void shouldUpdateUserSuccessfully() {
            User updatedUser = new User("Jane", "Smith", "jane@example.com", "0987654321", "USER");
            updatedUser.setId(1L);
            updatedUser.setActive(true);
            updatedUser.setCreatedAt(LocalDateTime.now());
            updatedUser.setUpdatedAt(LocalDateTime.now());

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(updatedUser);

            UserResponse response = userService.updateUser(1L, updateRequest);

            assertThat(response).isNotNull();
            assertThat(response.getFirstName()).isEqualTo("Jane");
            assertThat(response.getEmail()).isEqualTo("jane@example.com");
        }

        @Test
        @DisplayName("Should throw UserNotFoundException when updating non-existent user")
        void shouldThrowUserNotFoundWhenUpdating() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUser(99L, updateRequest))
                    .isInstanceOf(UserNotFoundException.class);
        }

        @Test
        @DisplayName("Should throw DuplicateEmailException when updating to existing email")
        void shouldThrowDuplicateEmailWhenUpdating() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(1L, updateRequest))
                    .isInstanceOf(DuplicateEmailException.class);
        }

        @Test
        @DisplayName("Should update user with same email without throwing exception")
        void shouldUpdateUserWithSameEmail() {
            UpdateUserRequest sameEmailRequest = new UpdateUserRequest("Updated", null, "john@example.com", null, null);

            User updatedUser = new User("Updated", "Doe", "john@example.com", "1234567890", "ADMIN");
            updatedUser.setId(1L);
            updatedUser.setActive(true);
            updatedUser.setCreatedAt(LocalDateTime.now());
            updatedUser.setUpdatedAt(LocalDateTime.now());

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(updatedUser);

            UserResponse response = userService.updateUser(1L, sameEmailRequest);

            assertThat(response.getFirstName()).isEqualTo("Updated");
            verify(userRepository, never()).existsByEmail(anyString());
        }

        @Test
        @DisplayName("Should update only provided fields")
        void shouldUpdateOnlyProvidedFields() {
            UpdateUserRequest partialRequest = new UpdateUserRequest();
            partialRequest.setFirstName("Updated");

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            userService.updateUser(1L, partialRequest);

            verify(userRepository, times(1)).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Activate/Deactivate User Tests")
    class ActivateDeactivateTests {

        @Test
        @DisplayName("Should deactivate user successfully")
        void shouldDeactivateUserSuccessfully() {
            User deactivatedUser = new User("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            deactivatedUser.setId(1L);
            deactivatedUser.setActive(false);
            deactivatedUser.setCreatedAt(LocalDateTime.now());
            deactivatedUser.setUpdatedAt(LocalDateTime.now());

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(deactivatedUser);

            UserResponse response = userService.deactivateUser(1L);

            assertThat(response.isActive()).isFalse();
        }

        @Test
        @DisplayName("Should throw UserNotFoundException when deactivating non-existent user")
        void shouldThrowWhenDeactivatingNonExistent() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deactivateUser(99L))
                    .isInstanceOf(UserNotFoundException.class);
        }

        @Test
        @DisplayName("Should activate user successfully")
        void shouldActivateUserSuccessfully() {
            User inactiveUser = new User("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            inactiveUser.setId(1L);
            inactiveUser.setActive(false);
            inactiveUser.setCreatedAt(LocalDateTime.now());
            inactiveUser.setUpdatedAt(LocalDateTime.now());

            User activatedUser = new User("John", "Doe", "john@example.com", "1234567890", "ADMIN");
            activatedUser.setId(1L);
            activatedUser.setActive(true);
            activatedUser.setCreatedAt(LocalDateTime.now());
            activatedUser.setUpdatedAt(LocalDateTime.now());

            when(userRepository.findById(1L)).thenReturn(Optional.of(inactiveUser));
            when(userRepository.save(any(User.class))).thenReturn(activatedUser);

            UserResponse response = userService.activateUser(1L);

            assertThat(response.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should throw UserNotFoundException when activating non-existent user")
        void shouldThrowWhenActivatingNonExistent() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.activateUser(99L))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Delete User Tests")
    class DeleteUserTests {

        @Test
        @DisplayName("Should delete user successfully")
        void shouldDeleteUserSuccessfully() {
            when(userRepository.existsById(1L)).thenReturn(true);

            userService.deleteUser(1L);

            verify(userRepository, times(1)).deleteById(1L);
        }

        @Test
        @DisplayName("Should throw UserNotFoundException when deleting non-existent user")
        void shouldThrowWhenDeletingNonExistent() {
            when(userRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> userService.deleteUser(99L))
                    .isInstanceOf(UserNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Count Users Tests")
    class CountUsersTests {

        @Test
        @DisplayName("Should return user count")
        void shouldReturnUserCount() {
            when(userRepository.count()).thenReturn(5L);

            long count = userService.getUserCount();

            assertThat(count).isEqualTo(5L);
        }
    }
}
