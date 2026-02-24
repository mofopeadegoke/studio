# SportLink

**SportLink** is a social networking platform built for the sports community — connecting Players, Fans, Teams, and Scouts in one place. It supports profile management, social connections, content posting with AI assistance, real-time leaderboards, direct messaging, and event registration.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)

---

## Features

- **User Account Management** – Players, Fans, Teams, and Scouts can create and manage profiles with personal information, profile pictures, and bios.
- **Connection Management** – Send and accept connection requests between different account types.
- **AI-Enhanced Content Posting** – Create and share posts with text, images, and videos. An AI tool powered by Google Genkit enriches posts with relevant contextual data (e.g., location and time).
- **Direct Messaging** – Private messaging between Players, Teams, and Scouts, with Fans able to reply to messages from connected Players.
- **Event Registration** – Browse upcoming sports events and register directly within the app.
- **Dynamic Leaderboard** – Real-time leaderboards for challenges, updated based on user participation and backend data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI |
| AI / Genkit | [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google AI |
| Backend / Auth | [Firebase](https://firebase.google.com/) (Authentication, Firestore, App Hosting) |
| Real-time | Socket.IO |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) (recommended) — install with `npm install -g pnpm`
- A [Firebase](https://console.firebase.google.com/) project with Authentication and Firestore enabled
- A Google AI API key (for Genkit AI features)

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/mofopeadegoke/studio.git
   cd studio
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables))

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:9002`.

---

## Environment Variables

Create a `.env.local` file in the project root and populate it with your Firebase and Google AI credentials:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI (Genkit)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

> **Note:** Never commit `.env.local` or any file containing secrets to version control. It is already listed in `.gitignore`.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js development server on port 9002 (Turbopack) |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint across the project |
| `pnpm typecheck` | Run TypeScript type checking without emitting files |
| `pnpm genkit:dev` | Start the Genkit developer UI alongside the app |
| `pnpm genkit:watch` | Start the Genkit developer UI with file watching |

---

## Project Structure

```
studio/
├── docs/                   # Project documentation and blueprints
├── src/
│   ├── ai/                 # Genkit AI configuration and flows
│   │   ├── flows/          # AI flow definitions (e.g., post enhancement)
│   │   ├── dev.ts          # Genkit dev server entry point
│   │   └── genkit.ts       # Genkit client initialization
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (app)/          # Authenticated app routes
│   │   │   ├── home/       # Home / feed page
│   │   │   ├── events/     # Events listing and registration
│   │   │   ├── leaderboard/# Leaderboard page
│   │   │   ├── messages/   # Direct messaging
│   │   │   └── profile/    # User profile pages
│   │   ├── (auth)/         # Authentication routes (login, signup)
│   │   ├── admin/          # Admin pages
│   │   ├── actions.ts      # Next.js server actions
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Root page (redirects to login)
│   ├── components/         # Reusable React components
│   ├── context/            # React context providers (e.g., AuthContext)
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Shared utilities and helpers
├── apphosting.yaml         # Firebase App Hosting configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

