# 🎵 VibeFlow - Premium Music Player

<div align="center">

![VibeFlow Banner](https://via.placeholder.com/1200x400/0B0B0F/A855F7?text=VibeFlow+Music+Player)

**A modern, feature-rich music player with glassmorphism design and neon aesthetics**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](YOUR_DEMO_LINK)
[![GitHub](https://img.shields.io/badge/github-repository-blue?style=for-the-badge&logo=github)](YOUR_GITHUB_LINK)
[![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)](LICENSE)

[Live Demo](#) • [Features](#features) • [Installation](#installation) • [Usage](#usage) • [Keyboard Shortcuts](#keyboard-shortcuts)

</div>

---

## ✨ Features

### 🎧 Core Functionality
- **Full Playback Control** - Play, pause, next, previous with smooth transitions
- **Progress Seeking** - Click or drag to jump to any point in the song
- **Volume Control** - Adjustable volume with mute toggle and visual feedback
- **Playlist Management** - Interactive playlist with click-to-play functionality
- **Real-time Display** - Current time and total duration with live updates

### 🚀 Advanced Features
- **Shuffle Mode** - Smart randomization that avoids immediate repeats
- **Repeat Modes** - Off, Repeat All, Repeat One with visual indicators
- **Real-time Search** - Filter songs by title or artist instantly
- **Keyboard Shortcuts** - Full keyboard control for power users
- **State Persistence** - Remembers volume, shuffle, and repeat preferences
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **Touch Support** - Optimized touch interactions for mobile devices

### 🎨 Premium UI/UX
- **Glassmorphism Design** - Modern frosted glass aesthetic with backdrop blur
- **Neon Accents** - Purple and pink gradient theme with glowing effects
- **Animated Backgrounds** - Dynamic gradient orbs that shift smoothly
- **Floating Elements** - Subtle animations that bring the interface to life
- **Active State Glows** - Currently playing track highlighted with neon border
- **Smooth Transitions** - Every interaction feels polished and premium
- **Dark Luxury Theme** - Easy on the eyes with sophisticated color palette

### ♿ Accessibility
- **Keyboard Navigation** - Full keyboard support with logical tab order
- **ARIA Labels** - Screen reader friendly with proper semantic markup
- **Focus Indicators** - Clear visual feedback for focused elements
- **Reduced Motion** - Respects user's motion preferences
- **High Contrast Support** - Enhanced visibility for accessibility needs

---

## 🖼️ Screenshots

<div align="center">

### Desktop View
![Desktop Screenshot](https://via.placeholder.com/1000x600/0B0B0F/A855F7?text=Desktop+View)

### Mobile View
![Mobile Screenshot](https://via.placeholder.com/400x800/0B0B0F/EC4899?text=Mobile+View)

### Active Playing State
![Playing State](https://via.placeholder.com/1000x600/0B0B0F/A855F7?text=Now+Playing)

</div>

---

## 🛠️ Tech Stack

- **HTML5** - Semantic markup and audio element
- **CSS3** - Modern styling with custom properties and animations
- **Vanilla JavaScript** - No frameworks, pure ES6+ code
- **LocalStorage API** - State persistence
- **Web Audio API** - Audio playback control

---

## 📦 Installation

### Option 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/vibeflow-music-player.git

# Navigate to project directory
cd vibeflow-music-player

# Open in browser
open index.html
Option 2: Download ZIP
Download the ZIP file from GitHub
Extract to your desired location
Open index.html in your browser
Option 3: Live Demo
Visit the live demo to try it instantly!

🎵 Adding Your Music
Step 1: Add Audio Files
Place your MP3 files in the assets/music/ folder:

text

assets/
└── music/
    ├── song1.mp3
    ├── song2.mp3
    └── song3.mp3
Step 2: Add Album Covers
Place your album cover images in assets/images/:

text

assets/
└── images/
    ├── cover1.jpg
    ├── cover2.jpg
    └── cover3.jpg
Step 3: Update Playlist Data
Edit js/playlist-data.js:

JavaScript

const playlist = [
    {
        title: "Your Song Title",
        artist: "Artist Name",
        cover: "assets/images/cover1.jpg",
        audio: "assets/music/song1.mp3",
        duration: "3:45"
    },
    // Add more songs...
];
⌨️ Keyboard Shortcuts
Key	Action
Space	Play / Pause
→	Next Song
←	Previous Song
↑	Volume Up
↓	Volume Down
M	Mute / Unmute
S	Toggle Shuffle
R	Cycle Repeat Modes
📱 Browser Support
Browser	Version	Support
Chrome	Latest	✅ Full
Firefox	Latest	✅ Full
Safari	Latest	✅ Full
Edge	Latest	✅ Full
Mobile Safari	iOS 12+	✅ Full
Chrome Mobile	Latest	✅ Full
🎨 Customization
Change Color Theme
Edit css/variables.css:

CSS

:root {
    --neon-purple: #A855F7;  /* Primary color */
    --neon-pink: #EC4899;    /* Accent color */
}
Adjust Animation Speed
CSS

:root {
    --duration-normal: 0.35s;  /* Default animation speed */
}
Modify Layout
Edit css/layout.css for structural changes.

📂 Project Structure
text

vibeflow-music-player/
│
├── index.html              # Main HTML file
├── README.md               # Project documentation
├── LICENSE                 # MIT License
│
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── reset.css           # Browser reset
│   ├── layout.css          # Layout structure
│   ├── components.css      # Component styles
│   ├── animations.css      # Animations & transitions
│   └── responsive.css      # Media queries
│
├── js/
│   ├── app.js              # Main application logic
│   ├── playlist-data.js    # Song data
│   └── utils.js            # Helper functions
│
└── assets/
    ├── images/
    │   └── placeholder-album.jpg
    └── music/
        └── (your audio files)
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Design inspiration from modern music streaming platforms
Icons and UI patterns from contemporary web design trends
Community feedback and suggestions
👨‍💻 Author
Your Name

GitHub: @Vaibhavigund
LinkedIn: Vaibhavi gund
Email: vaibhavi.gund0324@gmail.com
