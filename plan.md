Below is the detailed plan for building the “dahill” invoice app. This project will be split into a Node.js backend and an Angular frontend. The backend will use Express, Prisma (with dummy data), and JWT authentication while the frontend will be built with Angular, Tailwind CSS, and NG‑ZORRO (Ant Design for Angular) components to achieve a modern, responsive user interface.

---

## Project Structure Overview

```
/dahill
  
├── backend
  │     ├── package.json
  │     ├── .env
  │     ├── server.js
  │     ├── config/
  │     │      └── config.js
  │     ├── prisma/
  │     │      ├── schema.prisma
  │     │      └── seed.js        // (optional for seeding dummy data)
  │     ├── controllers/
  │     │      ├── authController.js
  │     │      ├── customerController.js
  │     │      └── invoiceController.js
  │     ├── routes/
  │     │      ├── authRoutes.js
  │     │      ├── customerRoutes.js
  │     │      └── invoiceRoutes.js
  │     └── middleware/
  │            ├── authMiddleware.js
  │            └── errorHandler.js
  └── frontend
        ├── angular.json
        ├── package.json
        ├── tailwind.config.js
        ├── postcss.config.js
        └── src/
              ├── main.ts
              ├── app/
              │      ├── app.module.ts
              │      ├── app-routing.module.ts
              │      ├── components/
              │      │       ├── header.component.ts/html/css
              │      │       └── footer.component.ts/html/css   // (if needed)
              │      ├── pages/
              │      │       ├── login/
              │      │       │      ├── login.component.ts/html/css
              │      │       ├── dashboard/
              │      │       │      ├── dashboard.component.ts/html/css
              │      │       ├── customers/
              │      │       │      ├── customer-list.component.ts/html/css
              │      │       │      └── customer-details.component.ts/html/css
              │      │       └── invoices/
              │      │              ├── invoice-list.component.ts/html/css
              │      │              └── invoice-form.component.ts/html/css
              │      └── services/
              │              ├── auth.service.ts
              │              ├── customer.service.ts
              │              └── invoice.service.ts
              └── assets/   // (if additional graphics/assets are needed)
```

---

## Backend (Node.js with Express, Prisma & JWT)

1. **package.json**  
   - Define dependencies: express, prisma, @prisma/client, jsonwebtoken, bcryptjs, dotenv, cors, morgan, and any validation library (e.g. express-validator).  
   - Add start and dev scripts (using nodemon for development).

2. **.env**  
   - Create environment variables:  
     - PORT (e.g., 3000)  
     - JWT_SECRET (a secure dummy secret)  
     - DATABASE_URL (dummy MariaDB connection string).

3. **server.js**  
   - Initialize an Express server and include middleware (express.json, cors, morgan).
   - Import and mount routes from `/routes`.
   - Add a global error handler using middleware/errorHandler.js.
   - Listen on the port specified in config.

4. **config/config.js**  
   - Export config variables (PORT, JWT_SECRET) to be consumed in controllers and middleware.

5. **prisma/schema.prisma**  
   - Define models:  
     - User (fields: id, username, password)  
     - Customer (fields: id, name, address, phone, email, jobLocation)  
     - Invoice (fields: id, date, description, amount, note, customerId linked to Customer)
   - Set the datasource to use a MariaDB provider (dummy URL for now).

6. **controllers/authController.js**  
   - Implement a login function that verifies user credentials (hard-coded/dummy data) and returns a JWT token.
   - Handle errors gracefully and return proper HTTP status codes.

7. **controllers/customerController.js**  
   - Create functions for:  
     - Listing customers  
     - Adding a new customer  
     - Editing customer details  
     - Deleting a customer  
   - Use try/catch blocks and call next(error) for centralized error handling.

8. **controllers/invoiceController.js**  
   - Implement endpoints for:  
     - Creating an invoice (with customer details, date, description, amount, note)  
     - Editing, deleting, and listing invoices  
     - A download endpoint that streams a PDF (simulate content with dummy data).
   - Validate request bodies and handle errors using middleware.

9. **routes/**  
   - **authRoutes.js:** Route for POST /api/auth/login, using authController.  
   - **customerRoutes.js:** Routes for customer management (GET, POST, PUT, DELETE).  
   - **invoiceRoutes.js:** Routes for invoice management (GET, POST, PUT, DELETE, and download).

10. **middleware/authMiddleware.js**  
    - Create middleware to verify JWT tokens from the Authorization header.
    - On successful verification, attach the user object to req; otherwise, return a 401 error.

11. **middleware/errorHandler.js**  
    - Centralized error handler middleware that logs errors and sends proper HTTP responses.

12. **(Optional) prisma/seed.js**  
    - Script to seed dummy data into the database for testing.

---

## Frontend (Angular with Tailwind CSS & NG‑ZORRO)

1. **Project Setup:**  
   - Use Angular CLI to create a new project named “dahill-frontend”.
   - Install Tailwind CSS by adding `tailwind.config.js` and `postcss.config.js`, and configure Angular’s styles (in angular.json) for Tailwind.
   - Install NG‑ZORRO via `ng add ng-zorro-antd` to use Ant Design components.

2. **app.module.ts & app-routing.module.ts:**  
   - Declare and import modules for forms, HTTP client, and NG‑ZORRO UI components.
   - Configure routes for Login, Dashboard, Customer Management, and Invoice Management.
   - Use route guards for authenticated routes.

3. **Pages & Components:**  
   - **Login Page:**  
     - Create a reactive form with fields for username and password.  
     - Use NG‑ZORRO form and button components.  
   - **Dashboard:**  
     - Build a simple landing page that shows a summary and navigation.
   - **Customer Management:**  
     - CustomerListComponent: Render a table (NG‑ZORRO table) with customer data and responsive design using Tailwind grid and spacing classes.  
     - CustomerDetailsComponent: Form (using reactive forms) for adding/editing customer details (name, address, phone, email, job location).
   - **Invoice Management:**  
     - InvoiceListComponent: List all invoices with edit/delete options.  
     - InvoiceFormComponent: Form with fields for date, description, amount, note and an option to add a new customer inline if needed.
   - **Shared Components:**  
     - HeaderComponent: A modern, responsive header using typography and spacing with no icon libraries.  
     - (Optional) FooterComponent for general information.

4. **Services & HTTP Interceptor:**  
   - **AuthService:** Handle login and store JWT token in localStorage.  
   - **CustomerService & InvoiceService:** Make HTTP calls to the backend endpoints.
   - **HTTP Interceptor:** Automatically attach the JWT token to outgoing requests and process error responses.

5. **UI/UX Considerations:**  
   - Use NG‑ZORRO components styled with Tailwind to achieve a modern look.
   - Ensure layout responsiveness by using Tailwind’s mobile-first utility classes.
   - Use form validations and clear feedback messages for errors.
   - Maintain uniform typography, spacing, and a simple color palette to mimic Ant Design aesthetics without external images or icons.

---

## Summary

- The backend (in /backend) uses Express, Prisma (with a MariaDB dummy URL), and JWT-based authentication with dedicated controllers, routes, and error middleware.  
- Key files include server.js, schema.prisma, authMiddleware.js, and respective controllers.  
- The Angular frontend (in /frontend) is scaffolded with Angular CLI, integrated with Tailwind CSS and NG‑ZORRO components.  
- Essential pages include Login, Dashboard, Customer Management, and Invoice Management with responsive form and table layouts.  
- Services and an HTTP interceptor are set up for secure API communication using JWT tokens.  
- Error handling and validations are implemented across both backend and frontend for robustness and a seamless user experience.
