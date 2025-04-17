![image](https://github.com/user-attachments/assets/fa03f801-7267-4b11-bca1-a2e01f13abfa)
# LilGuy: Browser Productivity Companion ✨

![LilGuy Happy Angel State](lilguy-angel-happy.gif)
LilGuy is a virtual productivity companion designed to help you achieve your goal of **learning Next.js** by evolving based on your web Browse habits. This initial version focuses specifically on tracking progress towards Next.js learning resources, gamifying your learning journey with nostalgic gameplay while you raise a digital companion. 🥚 → 😇/😈

## Team

Created by [Ademide Akinsefunmi](https://github.com/AAdemide), [Filip Fabiszak](https://github.com/filipfabiszak), [Lisa Olsen](https://github.com/lmolsen), and [Yvonne Lu Trinh](https://github.com/yvonnelutrinh) during the Next.js Global Hackathon, April 2025.

## Features

* **Virtual companion**: Watch your LilGuy hatch from an egg based on your productivity towards learning Next.js, evolving through character states (normal, angel, devil) based on streaks.
* **Goal management**: Set and track your progress specifically for the goal of learning Next.js. Add relevant sites (documentation, tutorials, etc.) to this goal.
* **AI site categorization** : Automatically categorizes websites you visit as productive (Next.js related) or distracting using AI.
* **Cross-platform** : Seamless integration between the web app and the Chrome browser extension (utilizing content and background scripts).

## Tech Stack ⚙️

LilGuy combines the power of Next.js for the web application with a React-based Chrome extension:

* **Frontend**: Next.js
* **Backend**: Next.js API routes
* **Database**: Convex
* **Extension**: Chrome Extension API with React (Popup, Content Scripts, Background Scripts)
* **Extension bundling**: Webpack
* **State management**: React Context API + localStorage
* **Authentication**: Clerk (optional user accounts)
* **AI**: OpenAI API (utilizing a **zero-shot classification model** for site categorization)

## Getting Started

### Prerequisites

* Node.js (v18+)
* npm or yarn
* Chrome browser (for extension testing)

### Web Application Setup

1.  **Navigate to web directory:**
    ```bash
    cd web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    * Create a `.env` file by copying the example file.
        * **Bash (Linux/macOS):**
            ```bash
            cp .env.example .env
            ```
        * **PowerShell (Windows):**
            ```powershell
            copy .env.example .env
            ```
    * Edit the `.env` file and add your OpenAI API key. Currently, **only OpenAI is supported** for AI categorization.
        ```
        OPENAI_API_KEY=your_openai_api_key_here
        # Add any other required variables from .env.example
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```

The web application will be available at `http://localhost:3000`.

### Chrome Extension Setup

1.  **Navigate to extension directory:**
    ```bash
    cd extension
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Build the extension:**
    * The content and background scripts are bundled using Webpack. You need to build these assets first.
    ```bash
    npm run build
    # or
    # yarn build
    ```
    * This command typically creates a `dist` folder (or similar) within the `extension` directory containing the bundled files needed by Chrome.

4.  **Load the extension in Chrome:**
    1.  Open Chrome and navigate to `chrome://extensions/`.
    2.  Enable "Developer mode" (usually a toggle in the top right corner).
    3.  Click the "Load unpacked" button.
    4.  Select the **entire `lilguy-ext` directory** (the one containing the `manifest.json`, `popup`, `dist` folder, etc.).

## Project focus & future roadmap

This project was developed during a hackathon with a primary focus on learning and implementing Next.js effectively alongside browser extension technology. This focus is reflected in LilGuy's current functionality, which is centered around tracking progress towards the specific goal of learning Next.js.

Our future plans include expanding beyond this initial scope:

* Expand goal tracking: Allow users to define and track progress towards a wider variety of personal and professional goals.
* AI-powered productivity Tools: Introduce unlockable features based on productivity streaks.
* Experience-based evolution: Develop a more nuanced evolution system for LilGuy.
* Character variety: Add additional character types and evolution paths.
* Time tanagement: Integrate focus timers and Pomodoro technique options.
* Community features: Build community aspects like challenges and sharing progress.

