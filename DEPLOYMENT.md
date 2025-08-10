Firebase Hosting Deployment

Prerequisites
- Node.js 18+ and npm installed.
- Firebase CLI installed: `npm install -g firebase-tools`.
- A Firebase project created (note the project ID).

Project config
- Config files added at repo root:
  - `firebase.json`: serves the CRA build from `sqlflow-app/build` with SPA rewrite.
  - `.firebaserc`: set `projects.default` to your Firebase project ID.

One-time setup
1) Login to Firebase
   `firebase login`

2) Set the project (option A: edit .firebaserc)
   - Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your real project ID.

   Option B: use CLI to set default
   `firebase use --add <your-project-id>`

Build and deploy
1) Install deps and build the app
   `npm --prefix sqlflow-app ci || npm --prefix sqlflow-app install`
   `npm --prefix sqlflow-app run build`

2) Deploy to Hosting
   `firebase deploy --only hosting`

Useful tips
- Preview channels (no production impact):
  `firebase hosting:channel:deploy preview-<branch>`

- If deploying under a subpath, set CRA homepage in `sqlflow-app/package.json`.

- GitHub Action (optional):
  Use the official action `FirebaseExtended/action-hosting-deploy` with a deploy token.

