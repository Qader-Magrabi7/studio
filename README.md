# Lore Explorer

Welcome to Lore Explorer, an application that generates unique, AI-powered stories based on locations you provide. Discover the hidden tales of landmarks, cities, or even your current location.

## Getting Started

To run this application locally, you will need to set up Firebase and configure your environment variables.

1.  Create a Firebase project.
2.  Set up Firestore in your project.
3.  Create a `.env.local` file in the root of the project and add your Firebase configuration:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```
4. Also ensure your Google AI API key is set up for Genkit:
    ```
    GOOGLE_API_KEY=...
    ```

5.  Install dependencies and run the development server:

    ```bash
    npm install
    npm run dev
    ```

The app will be available at `http://localhost:9002`.
