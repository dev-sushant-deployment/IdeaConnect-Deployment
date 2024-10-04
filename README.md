# IdeaConnect

## Description
**IdeaConnect** is a collaborative social media platform aimed at sharing and developing ideas. It allows users to post their innovative concepts, collaborate with others, and track progress over time. The platform includes features for real-time communication, including group chats, peer-to-peer video calls, and media sharing, fostering smooth and efficient collaboration.

## Features
- **User Authentication & Authorization**: Secure login, registration, and user access management.
- **Idea Submission & Browsing**: Post new ideas, explore others' ideas, and join collaborative projects.
- **Progress Tracking**: Monitor the development of ideas through milestones and updates.
- **Real-time Communication**: Chat in groups, conduct peer-to-peer video calls, and share media files.

## Tech Stack
- **Frontend**: ReactJS, Tailwind CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: WebSocket, WebRTC
- **File Upload Management**: Multer

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sushant-wayal/ideaconnect.git
2. **Install the dependencies:**
   ```bash
   cd ideaconnect
   npm install
3. **Set up the environment variables:**
   - Create a `.env` file in the root directory.
   - Add the following environment variables to the file:
     ```env
     PORT=5000
     MONGODB_URI=<your_mongodb_uri>
     JWT_SECRET=<your_jwt_secret>
     ```
     Replace `<your_mongodb_uri>` with the MongoDB connection string and `<your_jwt_secret>` with a secret key for JWT token generation.
4. **Start the development server:**
    ```bash
    cd Backend
    npm run dev
    ```
5. **Start Frontend Client:**
    ```bash
    cd Frontend
    npm run dev
    ```
6. **Open the application:**
    - Open [http://localhost:5173](http://localhost:5173) in your browser to access the application.
    - if 5173 port is already in use, it will automatically switch to the next available port.

## Usage

1. **Register/Login:** 
    -Sign up as a new user or log in with an existing account.
2. **Submit Ideas:** 
    -Once logged in, users can submit new ideas via the "Create Idea" button.
3. **Collaborate:**
    -Users can browse others' ideas and join collaborative projects by commenting, contributing to the discussion, or using real-time chat features.
4. **Real-time Communication:**
    -Use the built-in group chats or initiate a peer-to-peer video call for better collaboration.
5. **Track Progress:**
    -Users can track the progress of their ideas, set milestones, and update collaborators.

## Contributing

Contributions are welcome! Here's how you can contribute to the project:
- Fork the repository.
- Create a new branch (`git checkout -b feature-branch`).
- Make changes and commit them (`git commit -am 'Add new feature'`).
- Push the changes to the branch (`git push origin feature-branch`).
- Create a new pull request.
- Submit a pull request. Ensure your code follows the project's coding standards and passes all tests before submitting.

## Credits

This project was developed by [Sushant Wayal]


