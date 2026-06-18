// ================================
// VIBEFLOW MUSIC PLAYER
// Final Optimized Version
// ================================

/**
 * Main Music Player Class
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
            isLoading: false,
            volume: loadFromStorage('vibeflow-volume', 0.7),
            previousVolume: 0.7,
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
        
        // Validate playlist
        if (!playlist || playlist.length === 0) {
            this.showEmptyPlaylistState();
            return;
        }
        
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
     * Show empty playlist state
     */
    showEmptyPlaylistState() {
        this.playlistContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin: 0 auto 1.5rem;">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem; font-weight: 600;">No Music Found</p>
                <p style="font-size: 0.875rem;">Add songs to your playlist to get started</p>
            </div>
        `;
        this.playBtn.disabled = true;
        this.nextBtn.disabled = true;
        this.prevBtn.disabled = true;
    }
    
    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Playback controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        
        // Advanced controls
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.cycleRepeatMode());
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onSongEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        this.audio.addEventListener('waiting', () => this.onBuffering());
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        
        // Progress bar seeking
        this.progressBar.addEventListener('click', (e) => this.seekByClick(e));
        this.progressHandle.addEventListener('mousedown', (e) => this.startSeek(e));
        
        // Touch support for progress bar
        this.progressBar.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.seekByClick({clientX: touch.clientX});
        });
        
        // Volume control
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeBar.addEventListener('click', (e) => this.setVolumeByClick(e));
        this.volumeHandle.addEventListener('mousedown', (e) => this.startVolumeSeek(e));
        
        // Playlist interaction
        this.playlistContainer.addEventListener('click', (e) => this.onPlaylistClick(e));
        
        // Search functionality
        this.searchInput.addEventListener('input', debounce((e) => this.onSearch(e), 300));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.onKeyPress(e));
        
        // Visibility change (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isPlaying) {
                // Optionally pause when tab is hidden
                // this.pauseSong();
            }
        });
    }
    
    /**
     * Render the playlist UI
     */
    renderPlaylist(playlistToRender = this.state.filteredPlaylist) {
        this.playlistContainer.innerHTML = '';
        
        if (playlistToRender.length === 0) {
            this.showNoSearchResults();
            return;
        }
        
        playlistToRender.forEach((song, displayIndex) => {
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
     * Show no search results message
     */
    showNoSearchResults() {
        this.playlistContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.3; margin: 0 auto 1rem;">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem; font-weight: 600;">No songs found</p>
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
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Play ${song.title} by ${song.artist}`);
        
        item.innerHTML = `
            <div class="playlist-item-number">${displayIndex + 1}</div>
            <div class="playlist-item-cover">
                <img src="${song.cover}" alt="${song.title} cover" 
                     onerror="this.style.display='none'; this.parentElement.classList.add('no-image')"
                     loading="lazy">
                <div class="cover-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                </div>
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${this.sanitizeHTML(song.title)}</div>
                <div class="playlist-item-artist">${this.sanitizeHTML(song.artist)}</div>
            </div>
            <div class="playlist-item-duration">${song.duration}</div>
        `;
        
        // Keyboard support
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
        
        return item;
    }
    
    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
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
        if (index < 0 || index >= playlist.length) {
            console.error('Invalid song index:', index);
            return;
        }
        
        const song = playlist[index];
        
        // Update state
        this.state.currentIndex = index;
        this.state.isLoading = true;
        
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
        // Fade out
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
        
        // Update document title
        document.title = `${song.title} - VibeFlow`;
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
                    this.state.isLoading = false;
                    this.updatePlayPauseUI();
                    this.albumCoverContainer.classList.add('playing');
                    console.log('▶️ Playing');
                })
                .catch((error) => {
                    console.error('Playback failed:', error);
                    this.state.isLoading = false;
                    if (error.name === 'NotAllowedError') {
                        console.warn('Autoplay blocked. User interaction required.');
                        this.showNotification('Click play to start music');
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
        this.albumCoverContainer.classList.remove('playing');
        console.log('⏸️ Paused');
    }
    
    /**
     * Play next song
     */
    nextSong() {
        let nextIndex;
        
        if (this.state.isShuffled) {
            nextIndex = this.getRandomSongIndex();
        } else {
            nextIndex = this.state.currentIndex + 1;
            if (nextIndex >= playlist.length) {
                nextIndex = 0;
            }
        }
        
        this.loadSong(nextIndex);
        
        if (this.state.isPlaying) {
            setTimeout(() => this.playSong(), 100);
        }
    }
    
    /**
     * Play previous song
     */
    prevSong() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        
        let prevIndex;
        
        if (this.state.isShuffled) {
            prevIndex = this.getPreviousShuffledSong();
        } else {
            prevIndex = this.state.currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = playlist.length - 1;
            }
        }
        
        this.loadSong(prevIndex);
        
        if (this.state.isPlaying) {
            setTimeout(() => this.playSong(), 100);
        }
    }
    
    /**
     * Handle song ended event
     */
    onSongEnded() {
        console.log('🏁 Song ended');
        
        switch (this.state.repeatMode) {
            case RepeatMode.ONE:
                this.audio.currentTime = 0;
                this.playSong();
                console.log('🔂 Repeating current song');
                break;
                
            case RepeatMode.ALL:
                this.nextSong();
                break;
                
            case RepeatMode.OFF:
            default:
                if (this.state.currentIndex < playlist.length - 1 || this.state.isShuffled) {
                    this.nextSong();
                } else {
                    this.pauseSong();
                    this.audio.currentTime = 0;
                    console.log('✋ Playlist ended');
                }
                break;
        }
    }
    
    /**
     * Handle buffering state
     */
    onBuffering() {
        this.state.isLoading = true;
        console.log('⏳ Buffering...');
    }
    
    /**
     * Handle can play state
     */
    onCanPlay() {
        this.state.isLoading = false;
        console.log('✅ Ready to play');
    }
    
    /**
     * Show notification (optional enhancement)
     */
    showNotification(message) {
        console.log('💬 ' + message);
        // Could add toast notification UI here
    }
    
    // ================================
    // SHUFFLE MODE
    // ================================
    
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
    
    getRandomSongIndex() {
        const playlistSize = playlist.length;
        
        if (this.state.shuffleHistory.length >= playlistSize - 1) {
            this.state.shuffleHistory = [this.state.currentIndex];
        }
        
        const availableIndices = [];
        for (let i = 0; i < playlistSize; i++) {
            if (!this.state.shuffleHistory.includes(i)) {
                availableIndices.push(i);
            }
        }
        
        if (availableIndices.length > 0) {
            const randomIdx = Math.floor(Math.random() * availableIndices.length);
            return availableIndices[randomIdx];
        }
        
        return (this.state.currentIndex + 1) % playlistSize;
    }
    
    addToShuffleHistory(index) {
        if (!this.state.shuffleHistory.includes(index)) {
            this.state.shuffleHistory.push(index);
        }
        
        if (this.state.shuffleHistory.length > playlist.length) {
            this.state.shuffleHistory.shift();
        }
    }
    
    getPreviousShuffledSong() {
        if (this.state.shuffleHistory.length > 1) {
            this.state.shuffleHistory.pop();
            return this.state.shuffleHistory[this.state.shuffleHistory.length - 1];
        }
        return this.getRandomSongIndex();
    }
    
    // ================================
    // REPEAT MODE
    // ================================
    
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
    
    updateRepeatUI() {
        this.repeatBtn.classList.remove('active', 'repeat-one');
        
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
    
    onSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            this.state.filteredPlaylist = [...playlist];
            this.renderPlaylist();
            return;
        }
        
        this.state.filteredPlaylist = playlist.filter(song => {
            const titleMatch = song.title.toLowerCase().includes(query);
            const artistMatch = song.artist.toLowerCase().includes(query);
            return titleMatch || artistMatch;
        });
        
        this.renderPlaylist(this.state.filteredPlaylist);
        
        console.log(`🔍 Search: "${query}" - ${this.state.filteredPlaylist.length} results`);
    }
    
    // ================================
    // KEYBOARD SHORTCUTS
    // ================================
    
    onKeyPress(e) {
        if (e.target === this.searchInput || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'arrowright':
                e.preventDefault();
                this.nextSong();
                break;
            case 'arrowleft':
                e.preventDefault();
                this.prevSong();
                break;
            case 'arrowup':
                e.preventDefault();
                this.adjustVolume(0.1);
                break;
            case 'arrowdown':
                e.preventDefault();
                this.adjustVolume(-0.1);
                break;
            case 'm':
                e.preventDefault();
                this.toggleMute();
                break;
            case 's':
                e.preventDefault();
                this.toggleShuffle();
                break;
            case 'r':
                e.preventDefault();
                this.cycleRepeatMode();
                break;
        }
    }
    
    adjustVolume(delta) {
        const newVolume = clamp(this.state.volume + delta, 0, 1);
        this.setVolume(newVolume);
    }
    
    // ================================
    // UI UPDATE METHODS
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
        this.showNotification(`Error loading ${song.title}`);
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
// REPEAT MODE ENUM
// ================================

const RepeatMode = {
    OFF: 'off',
    ALL: 'all',
    ONE: 'one'
};

// ================================
// INITIALIZE APPLICATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
    
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

// ================================
// SERVICE WORKER (Optional PWA)
// ================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.registerServiceWorker('/sw.js')
        //     .then(reg => console.log('✅ Service Worker registered'))
        //     .catch(err => console.log('❌ Service Worker failed', err));
    });
}