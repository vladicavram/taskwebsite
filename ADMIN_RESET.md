# Admin: Reset Username/Password

A minimal admin endpoint exists to reset a user's `username` and/or `password` securely.

## Configure
Set an admin token in your environment (e.g. `.env.local`):

```
ADMIN_TOKEN=changeme-strong-token
```

Restart the dev server after changing env.

## Endpoint
- Path: `POST /api/admin/reset-user`
- Auth: `Authorization: Bearer <ADMIN_TOKEN>`
- Body (JSON):
  - `email` (string, required)
  - `username` (string, optional, 3–20 chars letters/numbers/underscores, unique)
  - `password` (string, optional, min 8 chars)

You must include `email` and at least one of `username` or `password`.

## Examples

Reset both:
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","username":"alice","password":"newsecurepass123"}' \
  http://localhost:3001/api/admin/reset-user
```

Only password:
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"newsecurepass123"}' \
  http://localhost:3001/api/admin/reset-user
```

Only username:
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","username":"alice_1"}' \
  http://localhost:3001/api/admin/reset-user
```

## Notes
- Passwords are hashed with bcryptjs (10 salt rounds).
- Username uniqueness enforced; returns 409 if taken.
- Returns updated user data (excluding password).
