# Contribution Tracker

A web application to track contributions, built with React, Vite, and Supabase.

## Features

- User authentication (signup and login) using Supabase.
- Tracks total contributions, individual contributions, and the number of contributors.
- Offline support with a service worker.
- Responsive design using Tailwind CSS.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Contribution-Tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:

   ```plaintext
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   ```

6. Preview the production build:
   ```bash
   npm run preview
   ```

## License

This project is licensed under the MIT License.
