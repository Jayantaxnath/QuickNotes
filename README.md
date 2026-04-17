# Coursera Notes Generator

![Chrome](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome&logoColor=white)
![Groq AI](https://img.shields.io/badge/AI_Powered-Groq_Llama-f56040?logo=llm&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A Chrome Extension that extracts transcripts from Coursera videos and generates ultra-concise, high-quality study notes using the Groq API.

## Features
- **One-Click Notes**: Generate concise study notes with a single click while watching a Coursera video.
- **Smart Chunking**: Automatically processes long transcripts in chunks to bypass API token limits.
- **Markdown & Math Rendering**: Renders Markdown and LaTeX equations correctly using `marked.js` and `KaTeX`.
- **Clean UI**: A sleek, popup interface demonstrating real-time processing progress.

## Directory Structure
- `manifest.json`: Chrome extension manifest.
- `src/`: Contains core extension scripts (`popup.js`, `content.js`), styling (`popup.css`), and the popup interface (`popup.html`).
- `assets/`: Contains extension icons.
- `vendor/`: Third-party dependencies (`marked.js`, `KaTeX`).
- `demo/`: Contains a generic demo layout for UI testing.

## Installation for Development
1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the directory containing this project.
5. Pin the extension to your toolbar.

## Usage
1. Go to any Coursera video page providing an active transcript.
2. Click on the extension icon.
3. Click **Generate** and let the AI process the transcript into a set of concise study notes.

## License
[MIT License](LICENSE)
