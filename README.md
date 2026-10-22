# SNAKE & LADDER QUIZ ARENA 🎲🪜🐍
**Interactive Educational Board Game Web Application for Classrooms**

An interactive digital board game engineered for primary school teachers to conduct multiplayer classroom quiz games using a single computer or tablet connected to a projector or smart display.

Students play in collaborative groups while the teacher controls the turns, rolls the digital dice, reads out questions, and records answers. No student accounts, individual devices, or internet connection are required during gameplay.

---

## 🌟 Key Features

### 1. 100-Square Alternating Game Board
- Standard 100-square board with mathematically accurate alternating rows (Row 1: 1–10 L→R, Row 2: 11–20 R←L, up to Row 10: 91–100 R←L).
- Custom SVG ladders with wooden rungs and smooth curved snakes with heads and tails.
- Zero invalid endpoints (no loops, no endpoints on square 1 or 100).
- Multi-team chip stacking prevents visual collisions even with 12+ teams sharing the same square.
- Turn indicators, square numbers, and glowing active team highlighting.

### 2. Digital 3D Dice System & Answering Flow
- Six-sided digital dice with animated pip faces and roll prevention locks.
- Teacher-controlled turn cycle: Roll Dice &rarr; Question Displayed &rarr; Record Answer &rarr; Confirm & Reveal &rarr; Animated Movement &rarr; Ladder/Snake Check &rarr; Next Turn.
- Full support for:
  - **Multiple Choice Questions (MCQ)** (A, B, C, D)
  - **True or False** (large, high-contrast buttons)
  - **Short Answer** (auto-checking against accepted synonyms + manual teacher judgment override)

### 3. Match Customization & Penalty Rules
- **Winning Rules**:
  - *Reach or Pass*: First team to hit or pass square 100 wins.
  - *Exact Finish*: Must roll the exact number required to hit square 100.
- **Wrong-Answer Penalties**:
  - *Stay Put (No Move)*: Team remains on current square.
  - *Skip Next Turn*: Team stays on square and loses their next turn.
  - *Teacher's Choice*: Teacher chooses penalty on the spot.
- **Question Countdown Timer**: Configurable (Untimed, 15s, 30s, 45s, 60s).

### 4. Classroom Mode & Accessibility
- **Classroom Mode**: Maximizes board and scoreboard for high-resolution classroom projector screens.
- **Synthesized Audio (Web Audio API)**: Sound effects for dice rolls, correct answers, wrong answers, ladder climbs, snake slides, and victory fanfares (switchable in Settings).
- **Reduced Motion**: Respects prefers-reduced-motion and provides in-app toggle for projector displays.
- **Bilingual Interface**: Seamless switching between **English** and **Bahasa Melayu**.

### 5. AI Quiz Generator (Gemini Server-Side Integration)
- Powered by Google Gemini (`gemini-3.8-flash`) through a secure Express proxy route (`/api/generate-quiz`).
- Secret API key is never exposed to browser code.
- Configurable subject, year level, topic, language, question count, difficulty, and curriculum criteria.
- Full pre-save teacher review: edit question text, modify options, alter explanations, or delete questions.
- Graceful offline fallback: displays clear configuration instructions if `GEMINI_API_KEY` is not present, while keeping all offline features 100% active.

### 6. Robust Text-Based Quiz Importer
- Import multiple questions using plain text formatted with `QUESTION:`, `TYPE:`, options (`A:`, `B:`, `C:`, `D:`), `ANSWER:`, `DIFFICULTY:`, and `EXPLANATION:`.
- Real-time syntax and structural validation with line-by-line error feedback.
- Full UTF-8 support for Bahasa Melayu accents.

### 7. Offline-First Architecture & PWA
- Progressive Web App (PWA) with Service Worker and Web App Manifest.
- Zero-dependency client-side **IndexedDB** database storing Quizzes, Game History, and Settings.
- Preloaded with 4 curriculum-aligned default quizzes (both English and Bahasa Melayu).
- Non-intrusive offline indicator badge.
- In-app PWA install button for Chromium, Android, and iOS Safari.

### 8. JSON Backup & Restore
- Versioned JSON export schema (v1.0) for individual quizzes, complete quiz library, game records, and app settings.
- Import preview with duplicate resolution modes: *Import as Copy*, *Skip Duplicates*, or *Overwrite*.

---

## 🏗️ Project Architecture & Modules

```
├── .env.example                # Environment variables template
├── metadata.json               # AI Studio applet metadata & capabilities
├── package.json                # Project dependencies and fullstack scripts
├── server.ts                   # Express server entrypoint & Gemini AI proxy
├── vite.config.ts              # Vite configuration with VitePWA plugin
├── public/
│   └── icon.svg                # Brand SVG vector icon for PWA & favicon
└── src/
    ├── main.tsx                # React application entrypoint
    ├── index.css               # Global styles, fonts and Tailwind imports
    ├── App.tsx                 # Main application state and view router
    ├── types/
    │   └── index.ts            # TypeScript data models and interfaces
    ├── i18n/
    │   └── translations.ts     # Bilingual dictionary (English & Bahasa Melayu)
    ├── game/
    │   ├── constants.ts        # Board geometry, snakes, ladders, team presets
    │   └── engine.ts           # Game state machine, rules, penalties & undo stack
    ├── services/
    │   ├── db.ts               # IndexedDB storage service & preloaded quizzes
    │   ├── sound.ts            # Web Audio API sound synthesis
    │   └── ai.ts               # Server-side API client for AI quiz generation
    ├── hooks/
    │   ├── usePWAInstall.ts    # PWA beforeinstallprompt & iOS detection
    │   └── useOnlineStatus.ts  # Browser online/offline listener
    └── components/
        ├── Header.tsx          # Top bar adhering to Top Bar Contract
        ├── Dashboard.tsx       # Main teacher dashboard with metrics & actions
        ├── GameBoard.tsx       # 100-square SVG board with multi-token arrangement
        ├── DiceRoller.tsx      # 3D animated digital dice with pips
        ├── QuestionModal.tsx   # Quiz answering modal with teacher overrides
        ├── Scoreboard.tsx      # Live classroom scoreboard with accuracy %
        ├── TeamManager.tsx     # Team configuration for 12+ teams
        ├── QuizLibrary.tsx     # Searchable, filterable quiz manager
        ├── QuizEditor.tsx      # Manual quiz & question authoring tool
        ├── AIQuizGenerator.tsx # Gemini AI generator with review & edit
        ├── TextQuizImporter.tsx# Validating plain text quiz parser
        ├── GameHistoryView.tsx # Match logs, standings & CSV export
        ├── JSONBackupModal.tsx # Full JSON backup, restore & conflict resolver
        ├── VictoryModal.tsx    # Confetti celebration & podium standings
        ├── SettingsModal.tsx   # Language, sound, rule & timer preferences
        ├── PWAInstallButton.tsx# In-app PWA installation button
        └── OfflineIndicator.tsx# Offline mode banner
```

---

## 🚀 Setup & Local Development Instructions

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (optional for local AI generation):
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

3. Start the fullstack development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Run TypeScript checks:
   ```bash
   npm run lint
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Start production server:
   ```bash
   npm run start
   ```

---

## ☁️ Vercel / Cloud Deployment Instructions

### Deploying to Vercel
1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **Add New &rarr; Project** and select your repository.
3. Configure the Build and Output settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
5. Click **Deploy**.

*Note*: If deploying as a pure static site on static hosts (e.g. GitHub Pages), all core features (Game Board, Dice, Quizzes, Text Importer, JSON Backup, Scoreboard, Sounds, and Offline Gameplay) work 100% in the client browser. Server-side AI generation requires the Express backend or a serverless function endpoint.

---

## 📱 PWA Installation & Offline Instructions

1. **Chromium (Chrome / Edge / Brave)**:
   - Click the **Install App** button in the top navigation bar.
   - Or click the install icon in the browser address bar.
2. **Apple iOS Safari (iPad / iPhone)**:
   - Tap the **Share** button in Safari's toolbar.
   - Tap **Add to Home Screen**.
3. **Offline Verification**:
   - Load the app once in your browser.
   - Turn off Wi-Fi or disconnect your network cable.
   - Notice the yellow **Offline Mode Active** indicator in the bottom corner.
   - You can create teams, play complete games, roll dice, track scores, edit quizzes, and import text quizzes without any internet connection.

---

## 🧪 Completed Testing Checklist

- [x] **2-Team Gameplay**: Completed full game from square 1 to 100.
- [x] **12+ Teams Scalability**: Tested 12 teams with unique colors, icons, and chip stacking.
- [x] **Dice Mechanics**: True random rolls from 1 to 6 with anti-spam lockout.
- [x] **Movement & Animations**: Smooth square-by-square advancement on correct answer.
- [x] **Penalties**: Correctly applied *No Move*, *Skip Next Turn*, and *Teacher's Choice*.
- [x] **Snakes & Ladders Logic**: All 8 ladders climb upwards; all 8 snakes slide downwards; no invalid endpoints.
- [x] **Winning Conditions**: Verified both *Exact Finish* and *Reach or Pass* rules.
- [x] **Full State Undo**: Restores previous square, turn pointer, dice, scores, and skipped status cleanly.
- [x] **Text Importer**: Tested MCQ, True/False, and Short Answer parsing with error validation.
- [x] **AI Quiz Generator**: Validates schema and permits teacher editing before saving.
- [x] **IndexedDB Persistence**: Quizzes, game history, and settings survive browser reloads.
- [x] **JSON Export & Import**: Verified roundtrip export and import with conflict handling.
- [x] **Web Audio API**: Tested synthesized sound effects on desktop and tablet browsers.
- [x] **Projector / Classroom Mode**: Tested high-contrast display layout with maximized board.
