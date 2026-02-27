<div align="center">
  
# 🚀 ConnectPilot

**Intelligent Keyword-Based LinkedIn Auto Networking Assistant**

A production-ready Google Chrome extension designed to intelligently automate LinkedIn networking. Built strictly on Manifest V3 architecture with a focus on safety, human mimicry, and a premium user experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-success.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange.svg)

</div>

---

## 📖 Overview

Networking is the key to growth, but manually finding and connecting with the right people at scale takes hours. **ConnectPilot** is a custom Chrome Extension that automates this process by searching for specific niches (e.g., "Cybersecurity", "Software Engineer") and sending connections on your behalf.

Unlike basic scripts that risk triggering spam filters, ConnectPilot is built to **simulate real human behavior**. It dynamically scrolls, paginates through search results, and utilizes randomized delay engines to keep your account safe.

## ✨ Features

- 🎯 **Targeted Lead Generation**: Enter a keyword, and the bot automatically navigates to the associated LinkedIn people search.
- 🧠 **Smart DOM Parsing**: Dynamically detects valid connection buttons, ignoring pending invites, follow buttons, and incomplete profiles.
- ⏳ **Human Mimicry Engine**: Implements variable delays (`Safe`, `Normal`, `Fast`, `Ultra Fast`) and action jitters to mimic localized human interaction.
- 🔄 **Auto-Pagination logic**: Automatically scrolls down to load dynamic results and clicks "Next" when the current page's connectable profiles are exhausted.
- 🛡️ **Safety Guardrails**: Set strict connection limits per session to prevent aggressive automation flags. Intercepts and aborts if LinkedIn demands an email verification to connect.
- 🎨 **Premium UI/UX**: A sleek, dark glassmorphism popup dashboard displaying real-time analytics, sent counts, and an active operation log.

## 🛠️ Tech Stack

- **JavaScript (ES6+)**: Core logic, DOM manipulation, asynchronous state management.
- **HTML5 & CSS3**: Premium glassmorphism UI with custom animations and dynamic SVGs.
- **Chrome Extensions API**: Manifest V3, Service Workers (`background.js`), Content Scripts (`content.js`), and `chrome.storage.local` for state persistence.

## 📂 Project Structure

```text
ConnectPilot/
├── manifest.json              # Extension configuration and permissions
├── popup.html                 # Extension UI dashboard
├── popup.js                   # UI logic and user input handling
├── styles.css                 # Dark theme glassmorphism styling
├── background.js              # Service Worker for navigation and cross-script communication
├── content.js                 # Primary DOM interaction and sequence execution
├── automationController.js    # State machine and limit tracking
├── scrollEngine.js            # Dynamic vertical navigation and pagination
└── delayManager.js            # Randomized human mimicry algorithms
```

## 🚀 Installation & Usage

### 1. Load Unpacked Extension
1. Download or clone this repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/ConnectPilot.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `ConnectPilot` directory.

### 2. Run the Bot
1. Log into your LinkedIn account.
2. Click the ConnectPilot icon in your Chrome toolbar.
3. Enter your target **Keyword** (e.g., "AI Engineer").
4. Set the **Target Connections** limit.
5. Select your desired **Speed Mode**. (Start with *Normal* or *Safe* for established accounts).
6. Click **Start Bot**. The bot will navigate to the search results page and begin the process.

## ⚠️ Disclaimer & Fair Use

**ConnectPilot** is meant to assist with networking and should be used responsibly. 
- Do not mass-spam users.
- ConnectPilot does not bypass LinkedIn's weekly connection limits.
- The developers are not responsible for any account restrictions or bans resulting from the aggressive use of this tool. Use the `Safe` or `Normal` speed modes to minimize risk.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/yourusername/ConnectPilot/issues).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
