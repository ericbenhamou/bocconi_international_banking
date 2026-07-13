# Banking Desk — International Banking Study

A private, browser-based study companion for the Bocconi International Banking 2025–2026 exam.

## Features

- Local password-protected profiles (PBKDF2-SHA-256, no plaintext passwords)
- Remembered sign-in on trusted devices
- 54 multiple-choice questions across nine course areas
- Mixed, unseen-question and wrong-answer practice modes
- Auto-saved in-progress quizzes
- Persistent quiz history and per-question mastery
- Detailed answer reviews and explanations
- JSON backup/import for moving progress between browsers
- Responsive, accessible layout and offline support

## Privacy model

There is no server-side account database. Profiles, password hashes, quiz attempts and mastery data are stored in the browser's local storage and separated by username. A remembered login is represented by a random local session token. Export a backup before clearing site data or changing devices.

## Run locally

Serve the directory with any static server. For example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

Pushes to `main` deploy automatically to GitHub Pages through the included workflow.

## Source material

The question bank was distilled from the supplied *International Banking General Exam — Academic Year 2025–2026* study document and supporting course pack.

