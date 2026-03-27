# Testing: User Management Spring Boot API

## Prerequisites
- Java 17+ installed
- Maven installed (`sudo apt-get install -y maven` if missing)

## Build & Run Tests
```bash
mvn clean test -f user-management/pom.xml
```
- All 72 tests should pass (unit + integration)
- JaCoCo coverage report generated at `user-management/target/site/jacoco/jacoco.csv`
- Target: 90%+ instruction coverage

## Start the App Locally
```bash
mvn spring-boot:run -f user-management/pom.xml
```
- Runs on port 8080
- H2 in-memory database (data resets on restart)
- 5 seed users auto-loaded (John Doe/ADMIN, Jane Smith/USER, Bob Johnson/USER, Alice Williams/MANAGER, Charlie Brown/USER)
- H2 console available at http://localhost:8080/h2-console

## API Endpoints (base: /api/users)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/users | Create user |
| GET | /api/users | List all users |
| GET | /api/users/{id} | Get user by ID |
| GET | /api/users/active | List active users |
| GET | /api/users/inactive | List inactive users |
| GET | /api/users/role/{role} | Filter by role |
| GET | /api/users/search?keyword=X | Search by name |
| GET | /api/users/email/{email} | Lookup by email |
| PUT | /api/users/{id} | Update user |
| PATCH | /api/users/{id}/deactivate | Soft-deactivate |
| PATCH | /api/users/{id}/activate | Re-activate |
| DELETE | /api/users/{id} | Hard delete |
| GET | /api/users/count | User count |

## Testing Tips
- Use curl with `-o /tmp/resp.json -w "%{http_code}"` to capture both HTTP status and body
- Test validation: POST with empty/invalid fields expects HTTP 400 with field-level error messages
- Test duplicate email: POST with existing email expects HTTP 409
- Test not-found: GET non-existent ID expects HTTP 404
- Email lookup with dots (e.g. john.doe@example.com) works correctly in Spring Boot 3.3.5 without needing `{email:.+}` regex
- Run the app in a background shell to keep it available during testing

## Devin Secrets Needed
None — this project uses an H2 in-memory database with no external credentials.
