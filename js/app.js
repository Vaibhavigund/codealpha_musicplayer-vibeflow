// ================================
// VIBEFLOW MUSIC PLAYER
// Main Application - Enhanced
// ================================

/**
 * Repeat Mode Enum
 */
const RepeatMode = {
    OFF: 'off',
    ALL: 'all',
    ONE: 'one'
};

/**
 * Main Music Player Class - Enhanced
 * Handles all player functionality and state management
 */
class MusicPlayer {
    constructor() {
        // Audio element
        this.audio = document.getElementById('audio');
        
        // Player state
        this.state = {
            currentIndex: 0,
            isPlaying: false,
            isSeeking: false,
            volume: loadFromStorage('vibeflow-volume', 0.7),
            previousVolume: 0.7,
            // NEW: Advanced features state
            isShuffled: loadFromStorage('vibeflow-shuffle', false),
            repeatMode: loadFromStorage('vibeflow-repeat', RepeatMode.OFF),
            shuffleHistory: [],
            originalPlaylist: [...playlist],
            filteredPlaylist: [...playlist]
        };
        
        // DOM elements - Controls
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // DOM elements - Display
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.albumCover = document.getElementById('albumCover');
        this.albumPlaceholder = document.getElementById('albumPlaceholder');
        this.albumCoverContainer = document.getElementById('albumCoverContainer');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.playlistContainer = document.getElementById('playlistContainer');
        this.playlistCount = document.getElementById('playlistCount');
        
        // DOM elements - Icons
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        
        // DOM elements - Progress
        this.progressBar = document.getElementById('progressBar');
        this.progressFilled = document.getElementById('progressFilled');
        this.progressHandle = document.getElementById('progressHandle');
        
        // DOM elements - Volume
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeBar = document.getElementById('volumeBar');
        this.volumeFilled = document.getElementById('volumeFilled');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.volumeHighIcon = document.getElementById('volumeHighIcon');
        this.volumeMuteIcon = document.getElementById('volumeMuteIcon');
        
        // DOM elements - Search
        this.searchInput = document.getElementById('searchInput');
        
        // Initialize player
        this.init();
    }
    
    /**
     * Initialize the music player
     */
    init() {
        console.log('🎵 VibeFlow Music Player Initializing...');
        
        // Set initial volume
        this.audio.volume = this.state.volume;
        this.updateVolumeUI();
        
        // Apply saved shuffle state
        if (this.state.isShuffled) {
            this.shuffleBtn.classList.add('active');
        }
        
        // Apply saved repeat mode
        this.updateRepeatUI();
        
        // Render playlist
        this.renderPlaylist();
        
        // Load first song
        this.loadSong(0);
        
        // Attach event listeners
        this.attachEventListeners();
        
        console.log('✅ Music Player Ready!');
        console.log(`🔀 Shuffle: ${this.state.isShuffled ? 'ON' : 'OFF'}`);
        console.log(`🔁 Repeat: ${this.state.repeatMode.toUpperCase()}`);
    }
    
    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Playback controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        
        // NEW: Advanced controls
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.cycleRepeatMode());
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onSongEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        
        // Progress bar seeking
        this.progressBar.addEventListener('click', (e) => this.seekByClick(e));
        this.progressHandle.addEventListener('mousedown', (e) => this.startSeek(e));
        
        // Volume control
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeBar.addEventListener('click', (e) => this.setVolumeByClick(e));
        this.volumeHandle.addEventListener('mousedown', (e) => this.startVolumeSeek(e));
        
        // Playlist interaction
        this.playlistContainer.addEventListener('click', (e) => this.onPlaylistClick(e));
        
        // Search functionality
        this.searchInput.addEventListener('input', debounce((e) => this.onSearch(e), 300));
        
        // NEW: Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => this.onKeyPress(e));
    }
    
    /**
     * Render the playlist UI
     */
    renderPlaylist(playlistToRender = this.state.filteredPlaylist) {
        this.playlistContainer.innerHTML = '';
        
        if (playlistToRender.length === 0) {
            this.showNoResults();
            return;
        }
        
        playlistToRender.forEach((song, displayIndex) => {
            // Find original index for proper tracking
            const originalIndex = playlist.findIndex(s => 
                s.title === song.title && s.artist === song.artist
            );
            const playlistItem = this.createPlaylistItem(song, originalIndex, displayIndex);
            this.playlistContainer.appendChild(playlistItem);
        });
        
        this.updatePlaylistCount(playlistToRender.length);
        this.highlightCurrentSong();
    }
    
    /**
     * Show no results message
     */
    showNoResults() {
        this.playlistContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.3; margin-bottom: 1rem;">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">No songs found</p>
                <p style="font-size: 0.875rem;">Try a different search term</p>
            </div>
        `;
        this.updatePlaylistCount(0);
    }
    
    /**
     * Create a playlist item element
     */
    createPlaylistItem(song, originalIndex, displayIndex) {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.dataset.index = originalIndex;
        item.tabIndex = 0;
        
        item.innerHTML = `
            <div class="playlist-item-number">${displayIndex + 1}</div>
            <div class="playlist-item-cover">
                <img src="${song.cover}" alt="${song.title} cover" 
                     onerror="this.style.display='none'; this.parentElement.classList.add('no-image')">
                <div class="cover-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                </div>
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
            <div class="playlist-item-duration">${song.duration}</div>
        `;
        
        return item;
    }
    
    /**
     * Update playlist count display
     */
    updatePlaylistCount(count = playlist.length) {
        this.playlistCount.textContent = `${count} song${count !== 1 ? 's' : ''}`;
    }
    
    /**
     * Load a song by index
     */
    loadSong(index) {
        // Validate index
        if (index < 0 || index >= playlist.length) {
            console.error('Invalid song index:', index);
            return;
        }
        
        const song = playlist[index];
        
        // Update state
        this.state.currentIndex = index;
        
        // Add to shuffle history
        if (this.state.isShuffled) {
            this.addToShuffleHistory(index);
        }
        
        // Update audio source
        this.audio.src = song.audio;
        this.audio.load();
        
        // Update UI
        this.updateSongInfo(song);
        this.highlightCurrentSong();
        
        console.log(`📀 Loaded: ${song.title} by ${song.artist}`);
    }
    
    /**
     * Update song information display
     */
    updateSongInfo(song) {
        // Update text with fade effect
        this.songTitle.style.opacity = '0';
        this.songArtist.style.opacity = '0';
        
        setTimeout(() => {
            this.songTitle.textContent = song.title;
            this.songArtist.textContent = song.artist;
            
            // Remove empty state classes
            this.songTitle.classList.remove('empty-state');
            this.songArtist.classList.remove('empty-state');
            
            // Fade in
            this.songTitle.style.opacity = '1';
            this.songArtist.style.opacity = '1';
        }, 150);
        
        // Update album cover
        this.albumCover.src = song.cover;
        this.albumCover.style.display = 'block';
        this.albumPlaceholder.style.display = 'none';
        
        // Handle image load error
        this.albumCover.onerror = () => {
            this.albumCover.style.display = 'none';
            this.albumPlaceholder.style.display = 'flex';
        };
    }
    
    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.state.isPlaying) {
            this.pauseSong();
        } else {
            this.playSong();
        }
    }
    
    /**
     * Play the current song
     */
    playSong() {
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.state.isPlaying = true;
                    this.updatePlayPauseUI();
                    // Start album rotation
                    this.albumCoverContainer.classList.remove('paused');
                    this.albumCoverContainer.classList.add('playing');
                    console.log('▶️ Playing');
                })
                .catch((error) => {
                    console.error('Playback failed:', error);
                    if (error.name === 'NotAllowedError') {
                        console.warn('Autoplay blocked. User interaction required.');
                    }
                });
        }
    }
    
    /**
     * Pause the current song
     */
    pauseSong() {
        this.audio.pause();
        this.state.isPlaying = false;
        this.updatePlayPauseUI();
        // Stop album rotation
        this.albumCoverContainer.classList.remove('playing');
        this.albumCoverContainer.classList.add('paused');
        console.log('⏸️ Paused');
    }
    
    /**
     * Play next song (with shuffle support)
     */
    nextSong() {
        let nextIndex;
        
        if (this.state.isShuffled) {
            nextIndex = this.getRandomSongIndex();
        } else {
            nextIndex = this.state.currentIndex + 1;
            
            // Loop back to start if at end and repeat all is on
            if (nextIndex >= playlist.length) {
                nextIndex = 0;
            }
        }
        
        this.loadSong(nextIndex);
        
        // Continue playing if currently playing
        if (this.state.isPlaying) {
            this.playSong();
        }
    }
    
    /**
     * Play previous song
     */
    prevSong() {
        // If song has played more than 3 seconds, restart it
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        
        let prevIndex;
        
        if (this.state.isShuffled) {
            // Get from shuffle history or random
            prevIndex = this.getPreviousShuffledSong();
        } else {
            prevIndex = this.state.currentIndex - 1;
            
            // Loop to end if at start
            if (prevIndex < 0) {
                prevIndex = playlist.length - 1;
            }
        }
        
        this.loadSong(prevIndex);
        
        // Continue playing if currently playing
        if (this.state.isPlaying) {
            this.playSong();
        }
    }
    
    /**
     * Handle song ended event (with repeat mode support)
     */
    onSongEnded() {
        console.log('🏁 Song ended');
        
        switch (this.state.repeatMode) {
            case RepeatMode.ONE:
                // Replay current song
                this.audio.currentTime = 0;
                this.playSong();
                console.log('🔂 Repeating current song');
                break;
                
            case RepeatMode.ALL:
                // Play next song (will loop at end)
                this.nextSong();
                break;
                
            case RepeatMode.OFF:
            default:
                // Play next if not at end
                if (this.state.currentIndex < playlist.length - 1 || this.state.isShuffled) {
                    this.nextSong();
                } else {
                    // Stop at end
                    this.pauseSong();
                    this.audio.currentTime = 0;
                    console.log('✋ Playlist ended');
                }
                break;
        }
    }
    
    // ================================
    // SHUFFLE MODE
    // ================================
    
    /**
     * Toggle shuffle mode
     */
    toggleShuffle() {
        this.state.isShuffled = !this.state.isShuffled;
        
        if (this.state.isShuffled) {
            this.shuffleBtn.classList.add('active');
            this.state.shuffleHistory = [this.state.currentIndex];
            console.log('🔀 Shuffle: ON');
        } else {
            this.shuffleBtn.classList.remove('active');
            this.state.shuffleHistory = [];
            console.log('🔀 Shuffle: OFF');
        }
        
        saveToStorage('vibeflow-shuffle', this.state.isShuffled);
    }
    
    /**
     * Get random song index (excluding recent plays)
     */
    getRandomSongIndex() {
        const playlistSize = playlist.length;
        
        // If we've played most songs, reset history
        if (this.state.shuffleHistory.length >= playlistSize - 1) {
            this.state.shuffleHistory = [this.state.currentIndex];
        }
        
        // Get available songs
        const availableIndices = [];
        for (let i = 0; i < playlistSize; i++) {
            if (!this.state.shuffleHistory.includes(i)) {
                availableIndices.push(i);
            }
        }
        
        // Pick random from available
        if (availableIndices.length > 0) {
            const randomIdx = Math.floor(Math.random() * availableIndices.length);
            return availableIndices[randomIdx];
        }
        
        // Fallback
        return (this.state.currentIndex + 1) % playlistSize;
    }
    
    /**
     * Add song to shuffle history
     */
    addToShuffleHistory(index) {
        if (!this.state.shuffleHistory.includes(index)) {
            this.state.shuffleHistory.push(index);
        }
        
        // Keep history manageable
        if (this.state.shuffleHistory.length > playlist.length) {
            this.state.shuffleHistory.shift();
        }
    }
    
    /**
     * Get previous shuffled song
     */
    getPreviousShuffledSong() {
        if (this.state.shuffleHistory.length > 1) {
            // Remove current
            this.state.shuffleHistory.pop();
            // Get previous
            return this.state.shuffleHistory[this.state.shuffleHistory.length - 1];
        }
        return this.getRandomSongIndex();
    }
    
    // ================================
    // REPEAT MODE
    // ================================
    
    /**
     * Cycle through repeat modes: OFF → ALL → ONE → OFF
     */
    cycleRepeatMode() {
        switch (this.state.repeatMode) {
            case RepeatMode.OFF:
                this.state.repeatMode = RepeatMode.ALL;
                console.log('🔁 Repeat: ALL');
                break;
            case RepeatMode.ALL:
                this.state.repeatMode = RepeatMode.ONE;
                console.log('🔂 Repeat: ONE');
                break;
            case RepeatMode.ONE:
                this.state.repeatMode = RepeatMode.OFF;
                console.log('🔁 Repeat: OFF');
                break;
        }
        
        this.updateRepeatUI();
        saveToStorage('vibeflow-repeat', this.state.repeatMode);
    }
    
    /**
     * Update repeat button UI
     */
    updateRepeatUI() {
        // Remove all states
        this.repeatBtn.classList.remove('active', 'repeat-one');
        
        // Add appropriate state
        switch (this.state.repeatMode) {
            case RepeatMode.ALL:
                this.repeatBtn.classList.add('active');
                this.repeatBtn.setAttribute('title', 'Repeat: All');
                break;
            case RepeatMode.ONE:
                this.repeatBtn.classList.add('active', 'repeat-one');
                this.repeatBtn.setAttribute('title', 'Repeat: One');
                break;
            case RepeatMode.OFF:
            default:
                this.repeatBtn.setAttribute('title', 'Repeat: Off');
                break;
        }
    }
    
    // ================================
    // SEARCH FUNCTIONALITY
    // ================================
    
    /**
     * Enhanced search with real-time filtering
     */
    onSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            // Show all songs
            this.state.filteredPlaylist = [...playlist];
            this.renderPlaylist();
            return;
        }
        
        // Filter playlist
        this.state.filteredPlaylist = playlist.filter(song => {
            const titleMatch = song.title.toLowerCase().includes(query);
            const artistMatch = song.artist.toLowerCase().includes(query);
            return titleMatch || artistMatch;
        });
        
        // Re-render with filtered results
        this.renderPlaylist(this.state.filteredPlaylist);
        
        console.log(`🔍 Search: "${query}" - ${this.state.filteredPlaylist.length} results`);
    }
    
    // ================================
    // KEYBOARD SHORTCUTS
    // ================================
    
    /**
     * Enhanced keyboard shortcuts handler
     */
    onKeyPress(e) {
        // Don't trigger if typing in search
        if (e.target === this.searchInput) {
            return;
        }
        
        // Don't trigger if typing in any input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.togglePlay();
                console.log('⌨️ Keyboard: Play/Pause');
                break;
                
            case 'arrowright':
                e.preventDefault();
                this.nextSong();
                console.log('⌨️ Keyboard: Next');
                break;
                
            case 'arrowleft':
                e.preventDefault();
                this.prevSong();
                console.log('⌨️ Keyboard: Previous');
                break;
                
            case 'arrowup':
                e.preventDefault();
                this.adjustVolume(0.1);
                console.log('⌨️ Keyboard: Volume Up');
                break;
                
            case 'arrowdown':
                e.preventDefault();
                this.adjustVolume(-0.1);
                console.log('⌨️ Keyboard: Volume Down');
                break;
                
            case 'm':
                e.preventDefault();
                this.toggleMute();
                console.log('⌨️ Keyboard: Mute Toggle');
                break;
                
            case 's':
                e.preventDefault();
                this.toggleShuffle();
                console.log('⌨️ Keyboard: Shuffle Toggle');
                break;
                
            case 'r':
                e.preventDefault();
                this.cycleRepeatMode();
                console.log('⌨️ Keyboard: Repeat Cycle');
                break;
        }
    }
    
    /**
     * Adjust volume by delta
     */
    adjustVolume(delta) {
        const newVolume = clamp(this.state.volume + delta, 0, 1);
        this.setVolume(newVolume);
    }
    
    // ================================
    // EXISTING METHODS (from Task 2)
    // ================================
    
    updatePlayPauseUI() {
        if (this.state.isPlaying) {
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
            this.playBtn.setAttribute('aria-label', 'Pause');
            this.playBtn.setAttribute('title', 'Pause');
        } else {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
            this.playBtn.setAttribute('aria-label', 'Play');
            this.playBtn.setAttribute('title', 'Play');
        }
    }
    
    updateProgress() {
        if (this.state.isSeeking) return;
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        this.currentTime.textContent = formatTime(currentTime);
        
        if (duration && !isNaN(duration)) {
            const percentage = getPercentage(currentTime, duration);
            this.progressFilled.style.width = `${percentage}%`;
        }
    }
    
    onMetadataLoaded() {
        const duration = this.audio.duration;
        this.totalTime.textContent = formatTime(duration);
    }
    
    onPlay() {
        this.state.isPlaying = true;
        this.updatePlayPauseUI();
    }
    
    onPause() {
        this.state.isPlaying = false;
        this.updatePlayPauseUI();
    }
    
    onAudioError(e) {
        console.error('Audio error:', e);
        const song = playlist[this.state.currentIndex];
        console.error(`Failed to load: ${song.title}`);
    }
    
    seekByClick(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clamp((clickX / rect.width) * 100, 0, 100);
        const newTime = getValueFromPercentage(percentage, this.audio.duration);
        
        this.audio.currentTime = newTime;
        this.progressFilled.style.width = `${percentage}%`;
    }
    
    startSeek(e) {
        e.preventDefault();
        this.state.isSeeking = true;
        
        const onMouseMove = (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const moveX = e.clientX - rect.left;
            const percentage = clamp((moveX / rect.width) * 100, 0, 100);
            
            this.progressFilled.style.width = `${percentage}%`;
            const newTime = getValueFromPercentage(percentage, this.audio.duration);
            this.currentTime.textContent = formatTime(newTime);
        };
        
        const onMouseUp = () => {
            this.state.isSeeking = false;
            const percentage = parseFloat(this.progressFilled.style.width);
            const newTime = getValueFromPercentage(percentage, this.audio.duration);
            this.audio.currentTime = newTime;
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    setVolumeByClick(e) {
        const rect = this.volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clamp((clickX / rect.width) * 100, 0, 100);
        const volume = percentage / 100;
        
        this.setVolume(volume);
    }
    
    startVolumeSeek(e) {
        e.preventDefault();
        
        const onMouseMove = (e) => {
            const rect = this.volumeBar.getBoundingClientRect();
            const moveX = e.clientX - rect.left;
            const percentage = clamp((moveX / rect.width) * 100, 0, 100);
            const volume = percentage / 100;
            
            this.setVolume(volume);
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    setVolume(volume) {
        volume = clamp(volume, 0, 1);
        this.audio.volume = volume;
        this.state.volume = volume;
        this.updateVolumeUI();
        saveToStorage('vibeflow-volume', volume);
    }
    
    toggleMute() {
        if (this.state.volume > 0) {
            this.state.previousVolume = this.state.volume;
            this.setVolume(0);
        } else {
            this.setVolume(this.state.previousVolume || 0.7);
        }
    }
    
    updateVolumeUI() {
        const percentage = this.state.volume * 100;
        this.volumeFilled.style.width = `${percentage}%`;
        
        if (this.state.volume === 0) {
            this.volumeHighIcon.classList.add('hidden');
            this.volumeMuteIcon.classList.remove('hidden');
        } else {
            this.volumeHighIcon.classList.remove('hidden');
            this.volumeMuteIcon.classList.add('hidden');
        }
    }
    
    highlightCurrentSong() {
        const items = this.playlistContainer.querySelectorAll('.playlist-item');
        items.forEach(item => item.classList.remove('active'));
        
        const currentItem = this.playlistContainer.querySelector(
            `.playlist-item[data-index="${this.state.currentIndex}"]`
        );
        if (currentItem) {
            currentItem.classList.add('active');
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    onPlaylistClick(e) {
        const playlistItem = e.target.closest('.playlist-item');
        if (!playlistItem) return;
        
        const index = parseInt(playlistItem.dataset.index);
        
        this.loadSong(index);
        this.playSong();
    }
}

// ================================
// INITIALIZE APPLICATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
    
    // Log keyboard shortcuts for user reference
    console.log(`
🎹 KEYBOARD SHORTCUTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Space       Play/Pause
  →           Next song
  ←           Previous song
  ↑           Volume up
  ↓           Volume down
  M           Mute/Unmute
  S           Toggle shuffle
  R           Cycle repeat modes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});