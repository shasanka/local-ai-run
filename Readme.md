## 🏗 Project Architecture

```
local-ai-run/
├── src/                     # Node.js + TypeScript (Backend API)
│   └── ...
├── package.json             # Backend configuration
├── tsconfig.json            # Backend TypeScript config
│
└── frontend/                # React + Vite + TypeScript (UI)
    ├── src/
    ├── package.json         # Frontend dependencies
    ├── tsconfig.json        # Frontend TypeScript config
    ├── vite.config.ts
    └── ...
```

### Architecture Clarification

**Backend (root)**

- Node.js + TypeScript
- Runs local Hugging Face models
- Manages sessions and chat history
- Has its own package.json and tsconfig.json

**Frontend (/frontend)**

- React + Vite + TypeScript
- Fully isolated build setup
- Separate package.json
- Separate tsconfig.json

## 🚀 Getting Started

**Prerequisites:**

- Node.js (v24 recommended)
- Yarn (preferred package manager)
- A machine capable of running Hugging Face models locally\
  (Ensure required ONNX/DirectML/CPU support depending on your setup)

## 🔧 Backend Setup (Node.js + TypeScript)

The backend is located in the root src/ directory.

From the root of the project:

```
yarn install 
yarn dev
```

**The backend:**

- Manages sessions
- Maintains chat history in memory
- Interfaces with Hugging Face Transformers.js for local model inference

## 💻 Frontend Setup (React + Vite)

The frontend is isolated inside the frontend/ directory.

```
cd frontend
yarn install
yarn dev
```

The UI will start on the default Vite development port.

### Language

- 100% TypeScript
- Shared types between frontend and backend
- Consistent Message and ChatMetadata interfaces across network boundaries

### Inference

- Local Hugging Face models
- No external API calls
- Inference handled by the Node.js backend

### Storage

- Backend: In-memory storage
- Frontend: sessionStorage
- No database (yet)

⚠ Restarting the backend will clear all chat history.

## 🎨 UI Features

- Custom Markdown rendering *Soft-dark slate-themed interface *Styled code block
  cards with custom [&_pre] overrides *Auto-focus on textarea when creating a
  new chat Target-locked message dispatching to prevent race conditions when
  switching chats

## ⚙ Key Functionalities

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Backend    | Node.js, TypeScript, Hugging Face Transformers.js   |
| Frontend   | React, Vite, Tailwind CSS                           |
| Styling    | Custom Markdown + Code Block Components             |
| State Mgmt | Multi-chat ID locking to prevent concurrency issues |

## 🛣 Roadmap

- [ ] Add SQLite or MongoDB for persistent chat history
- [ ] Support multiple model selection from the UI
- [ ] Implement "Stop Generation" signal for backend inference
- [ ] Improve GPU compatibility and inference fallbacks
