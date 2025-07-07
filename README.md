# Leave Management System

A full-stack web application for managing leave requests, approvals.

## Features

-   **User Authentication**: Secure signup, login, and logout.
-   **Dashboard**: Overview of leave status and team calendar.
-   **Leave Management**: Submit, view, and track leave applications.
-   **Admin Panel**: Approve or reject leave requests and manage user roles.
-   **Cloudinary Integration**: For image uploads (e.g., user profiles).

## Tech Stack

**Frontend:**
-   React
-   React Router
-   Redux for state management

**Backend:**
-   Node.js
-   Express.js
-   MongoDB for the database
-   Mongoose (ODM)
-   JWT for authentication
-   Cloudinary SDK

## Getting Started

Follow these steps to run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/monish-2004/Leave-Management-System.git](https://github.com/monish-2004/Leave-Management-System.git)
    cd Leave-Management-System
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory with the following variables:
    ```env
    MONGO_URI=your_mongodb_atlas_connection_string
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    CLOUDINARY_NAME=your_cloudinary_cloud_name
    PORT=5000
    NODE_ENV=development
    ```
    *(Note: For the `MONGO_URI`, use the connection string from your MongoDB Atlas cluster, not a localhost address.)*

4.  **Run the application:**
    ```bash
    npm start
    ```

The application will be available at `http://localhost:5000`.