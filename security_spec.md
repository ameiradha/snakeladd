# Security Specification: Snake & Ladder Quiz Arena

## 1. Data Invariants
- Each user profile is isolated to `/users/{userId}` where `{userId}` must match `request.auth.uid`.
- Each quiz document belongs to a specific user and contains `userId`, `userEmail`, `title`, `description`, `language`, `questions`, `createdAt`, `updatedAt`, `isPrivate`.
- Quizzes are stored either in `/users/{userId}/quizzes/{quizId}` or `/quizzes/{quizId}` with `resource.data.userId == request.auth.uid`.
- Using subcollection `/users/{userId}/quizzes/{quizId}` guarantees strict ABAC isolation by Master Gate pattern.
- A user can ONLY read, list, create, update, and delete their own quizzes (`request.auth.uid == userId`).
- Public reads are forbidden: No other user can access or view another user's quiz.
- Users cannot forge or modify the `userId` or `userEmail` fields.
- Document IDs must conform to `isValidId(quizId)`.

## 2. Dirty Dozen Payloads (Negative Tests)
1. Read another user's quiz: `GET /users/victim123/quizzes/q1` by `attacker456` -> DENIED.
2. List another user's quizzes: `LIST /users/victim123/quizzes` by `attacker456` -> DENIED.
3. Unauthenticated read: `GET /users/victim123/quizzes/q1` with `request.auth == null` -> DENIED.
4. Forge userId on create: `POST /users/victim123/quizzes/q1` with `auth.uid = attacker456` -> DENIED.
5. Create quiz with oversized title (> 200 chars) -> DENIED.
6. Create quiz with invalid questions array (> 100 questions or empty string) -> DENIED.
7. Update quiz and hijack ownership: `PUT /users/user1/quizzes/q1` modifying `userId` to `user2` -> DENIED.
8. Unverified email write attempt: `request.auth.token.email_verified == false` -> DENIED.
9. Malicious path injection: `GET /users/../admin/secrets` -> DENIED.
10. Blanket query without filtering by user -> DENIED.
11. Update immutable `createdAt` timestamp -> DENIED.
12. Attempt to write shadow fields into user private profile -> DENIED.
