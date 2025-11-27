# Admin Panel Setup Instructions

## Setup Steps

1. **Make a user admin:**
   ```bash
   node set-admin.js your-email@example.com
   ```

2. **Access the admin panel:**
   - Log in with the admin account
   - Click on your avatar in the header
   - Select "⚙️ Admin Panel" from the dropdown

## Admin Features

### User Management
- View all users with email, username, credits, and admin status
- Edit user details (name, email, username, credits)
- Grant/revoke admin privileges
- Delete users (removes all associated data)

### Task Management
- View all tasks with title, creator, location, price, and status
- Edit task details (title, description, location, price)
- Toggle task open/closed status
- Delete tasks (removes all associated data)

## Security Notes

- Only users with `isAdmin: true` can access the admin panel
- All admin API routes are protected with `requireAdmin()` middleware
- Non-admin users will receive 403 Forbidden responses

## Files Created

- `/src/app/[locale]/admin/page.tsx` - Admin panel UI
- `/src/app/api/admin/users/route.ts` - User list API
- `/src/app/api/admin/users/[id]/route.ts` - User edit/delete API
- `/src/app/api/admin/tasks/route.ts` - Task list API
- `/src/app/api/admin/tasks/[id]/route.ts` - Task edit/delete API
- `/src/lib/admin.ts` - Admin middleware helpers
- `/set-admin.js` - Script to grant admin privileges

## Database Changes

Added `isAdmin` boolean field to User model (defaults to false)
