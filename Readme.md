### Project Architecture

```
local-ai-run/
├── frontend/              # React + Vite + TypeScript (UI)
│   └── src/
├── src/                   # Node.js + TypeScript (Backend API)
├── package.json           # Root backend configuration
└── tsconfig.json          # Shared TypeScript configuration
```

### Getting Started

1. Prerequisites Node.js (v24)

Yarn (Preferred package manager)

Access to Hugging Face models (ensure your local environment supports the
required tensors/libraries for the model you choose).

### Backend Setup (Node.js + TypeScript)

The backend lives in the src folder at the root. To run it:

Bash

# Stay in the root directory

yarn install yarn dev The backend handles session logic, chat history
management, and acts as the bridge to the Hugging Face inference engine.

### Frontend Setup (React + Vite)

The frontend is isolated in its own directory:

Bash

# Navigate to frontend folder

cd frontend yarn install yarn dev

### Technical Details

Language: 100% TypeScript. This allows for shared interfaces between the
frontend and backend, ensuring the Message and ChatMetadata types are consistent
across the network.

Inference: Utilizing local Hugging Face models.

Storage: Currently Non-Persistent.

Data is stored in-memory on the backend and via sessionStorage on the frontend.

Note: Restarting the backend server will clear current chat histories as no
database is integrated yet.

UI Features:

Custom Markdown rendering with "soft-dark" slate themes.

Target-locked message sending (prevents messages from appearing in the wrong
chat when switching quickly).

Auto-focusing textarea on "New Chat" creation.

### Key Functionalities

Feature	Implementation Backend	Node.js / TypeScript / Hugging Face SDK
Frontend	React / Tailwind CSS / Vite Styling	Custom Code Block cards with
[&_pre] overrides State	Multi-chat ID locking to prevent race conditions

### Roadmap

[ ] Integrate SQLite or MongoDB for persistent history.

[ ] Add support for multiple Hugging Face model switching in the UI.

[ ] Implementation of a "Stop Generation" signal for the Node.js backend.
