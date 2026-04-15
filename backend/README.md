# StemiGlide Backend

Node.js + Express backend for the semester project, prepared for PostgreSQL.

## What this backend already does

- Exposes REST API endpoints for health, testimonials, inquiries, and recent orders
- Validates incoming inquiry payloads
- Maps your front-end form data into `users`, `address`, and `orders` shaped records
- Uses a PostgreSQL repository layer so the front end never talks to SQL directly

## What you still need to do

1. Run `npm install` inside `backend`.
2. Make sure your real `.env` has the PostgreSQL connection values.
3. Run the SQL in `src/sql/schema.sql` against your database.
4. Point the React app form to `http://localhost:3001/api/inquiries`.

## API Endpoints

- `GET /api/health`
- `GET /api/testimonials`
- `POST /api/inquiries`
- `GET /api/inquiries/orders`

## Example inquiry request

```json
{
  "firstName": "Kaden",
  "lastName": "White",
  "email": "kaden@example.com",
  "phone": "702-555-0123",
  "organization": "Las Vegas Fire Department",
  "quantity": 2,
  "message": "Interested in pilot pricing."
}
```

## Database files

- Connection config: `src/config/db.js`
- SQL repository: `src/repositories/database.js`
- Table setup script: `src/sql/schema.sql`

## Notes

- The API expects PostgreSQL tables named `users`, `testimonials`, `orders`, and `address`.
- The database columns are expected to be snake_case such as `user_id`, `product_name`, `total_price`, and `created_at`.
- The backend maps those snake_case columns back into camelCase JSON for the React app.
- The contact form includes a `message`, but your ERD does not currently have a table or column for it. The backend accepts the field and returns it in the API response, but it does not persist it unless you extend your schema later.
