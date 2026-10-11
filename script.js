

const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const muteBtn = document.getElementById("muteBtn");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const songTitle = document.getElementById("songTitle");
const artist = document.getElementById("artist");
const songCategory = document.getElementById("songCategory");
const albumCover = document.getElementById("albumCover");
const favoriteBtn = document.getElementById("favoriteBtn");
const playlistBtn = document.getElementById("playlistBtn");
const favoriteListBtn = document.getElementById("favoriteListBtn");
const songList = document.getElementById("songList");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const emptyText = document.getElementById("emptyText");
const songCount = document.getElementById("songCount");
const playlistTitle = document.getElementById("playlistTitle");
const speed = document.getElementById("speed");
const themeBtn = document.getElementById("themeBtn");
const visualizer = document.getElementById("visualizer");
const categoriesBox = document.getElementById("categories");
const tabs = document.querySelectorAll(".tab");

/
const songs = [
    {
        title: "Dreams",
        artist: "Luna Waves",
        category: "Pop",
        src: "songs/song1.mp3",
        color: "linear-gradient(135deg,#667eea,#764ba2)"
    },
    {
        title: "Night Drive",
        artist: "Neon Sky",
        category: "Electronic",
        src: "songs/song2.mp3",
        color: "linear-gradient(135deg,#141e30,#243b55)"
    },
    {
        title: "Lost Memories",
        artist: "Silent Echo",
        category: "Lofi",
        src: "songs/song3.mp3",
        color: "linear-gradient(135deg,#ff758c,#ff7eb3)"
    },
    {
        title: "Ocean Waves",
        artist: "Blue Horizon",
        category: "Chill",
        src: "songs/song4.mp3",
        color: "linear-gradient(135deg,#00c6ff,#0072ff)"
    },
    {
        title: "Midnight",
        artist: "Dark Avenue",
        category: "Rock",
        src: "songs/song5.mp3",
        color: "linear-gradient(135deg,#232526,#414345)"
    },
    {
        title: "Sunset",
        artist: "Golden Hour",
        category: "Pop",
        src: "songs/song6.mp3",
        color: "linear-gradient(135deg,#f7971e,#ffd200)"
    }
];


let currentSong = 0;
let isPlaying = false;
let shuffleMode = false;
let repeatMode = false;

let currentView = "all";          
let activeCategory = "All";

let favorites = loadList("favorites");
let myPlaylist = loadList("myPlaylist");

function loadList(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}



function loadSong(index) {
    const song = songs[index];

    currentSong = index;

    songTitle.textContent = song.title;
    artist.textContent = song.artist;
    songCategory.textContent = song.category;
    audio.src = song.src;
    albumCover.style.background = song.color;

    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    audio.playbackRate = Number(speed.value);

    renderList();
    updateFavoriteButton();
    updatePlaylistButton();
}

function playSong() {
    audio.play()
        .then(() => {
            isPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            visualizer.classList.add("playing");
        })
        .catch((error) => {
            // Jab user jaldi jaldi song badle to AbortError aata hai, usay ignore karein
            if (error && error.name === "AbortError") {
                return;
            }
            alert("Please add MP3 songs inside the songs folder.");
        });
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    visualizer.classList.remove("playing");
}

function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

playBtn.addEventListener("click", togglePlay);



function changeSong(direction) {
    const list = getVisibleSongs();

    if (list.length === 0) {
        return;
    }

    let nextIndex;

    if (shuffleMode && list.length > 1) {
        do {
            nextIndex = list[Math.floor(Math.random() * list.length)];
        } while (nextIndex === currentSong);
    } else {
        const position = list.indexOf(currentSong);

        if (position === -1) {
            nextIndex = direction > 0 ? list[0] : list[list.length - 1];
        } else {
            nextIndex = list[(position + direction + list.length) % list.length];
        }
    }

    loadSong(nextIndex);
    playSong();
}

function nextSong() {
    changeSong(1);
}

function previousSong() {
    changeSong(-1);
}

nextBtn.addEventListener("click", nextSong);
previousBtn.addEventListener("click", previousSong);



shuffleBtn.addEventListener("click", () => {
    shuffleMode = !shuffleMode;
    shuffleBtn.classList.toggle("active", shuffleMode);
});

repeatBtn.addEventListener("click", () => {
    repeatMode = !repeatMode;
    repeatBtn.classList.toggle("active", repeatMode);
});

audio.addEventListener("ended", () => {
    if (repeatMode) {
        audio.currentTime = 0;
        playSong();
    } else {
        nextSong();
    }
});


audio.addEventListener("timeupdate", () => {
    if (!audio.duration) {
        return;
    }

    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
    if (!audio.duration) {
        return;
    }

    audio.currentTime = (progress.value / 100) * audio.duration;
});



volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);

    if (audio.muted && audio.volume > 0) {
        audio.muted = false;
    }

    volumeValue.textContent = Math.round(volume.value * 100) + "%";
    updateVolumeIcon();
});

muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    updateVolumeIcon();
});

function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else if (audio.volume < 0.5) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
    } else {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
}

speed.addEventListener("change", () => {
    audio.playbackRate = Number(speed.value);
});


function toggleFavorite(index) {
    if (favorites.includes(index)) {
        favorites = favorites.filter((item) => item !== index);
    } else {
        favorites.push(index);
    }

    saveList("favorites", favorites);
    updateFavoriteButton();
    renderList();
}

favoriteBtn.addEventListener("click", () => {
    toggleFavorite(currentSong);
});

function updateFavoriteButton() {
    const isFavorite = favorites.includes(currentSong);

    favoriteBtn.classList.toggle("active", isFavorite);
    favoriteBtn.title = isFavorite ? "Remove from Favorites" : "Add to Favorites";
    favoriteBtn.innerHTML = isFavorite
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';
}


favoriteListBtn.addEventListener("click", () => {
    setView("favorites");
});



function togglePlaylist(index) {
    if (myPlaylist.includes(index)) {
        myPlaylist = myPlaylist.filter((item) => item !== index);
    } else {
        myPlaylist.push(index);
    }

    saveList("myPlaylist", myPlaylist);
    updatePlaylistButton();
    renderList();
}

playlistBtn.addEventListener("click", () => {
    togglePlaylist(currentSong);
});

function updatePlaylistButton() {
    const added = myPlaylist.includes(currentSong);

    playlistBtn.classList.toggle("active", added);
    playlistBtn.title = added ? "Remove from My Playlist" : "Add to My Playlist";
    playlistBtn.innerHTML = added
        ? '<i class="fa-solid fa-check"></i>'
        : '<i class="fa-solid fa-plus"></i>';
}



function setView(view) {
    currentView = view;

    tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.view === view);
    });

    renderList();
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        setView(tab.dataset.view);
    });
});



function buildCategories() {
    const names = ["All"];

    songs.forEach((song) => {
        if (!names.includes(song.category)) {
            names.push(song.category);
        }
    });

    categoriesBox.innerHTML = "";

    names.forEach((name) => {
        const chip = document.createElement("button");

        chip.className = "chip";
        chip.textContent = name;
        chip.dataset.category = name;

        if (name === activeCategory) {
            chip.classList.add("active");
        }

        chip.addEventListener("click", () => {
            activeCategory = name;

            document.querySelectorAll(".chip").forEach((item) => {
                item.classList.toggle("active", item.dataset.category === name);
            });

            renderList();
        });

        categoriesBox.appendChild(chip);
    });
}


// Tab + category + search teeno ke hisab se songs ke index wapas deta hai
function getVisibleSongs() {
    const value = searchInput.value.toLowerCase().trim();
    const result = [];

    songs.forEach((song, index) => {
        if (currentView === "favorites" && !favorites.includes(index)) {
            return;
        }

        if (currentView === "playlist" && !myPlaylist.includes(index)) {
            return;
        }

        if (activeCategory !== "All" && song.category !== activeCategory) {
            return;
        }

        const matches =
            song.title.toLowerCase().includes(value) ||
            song.artist.toLowerCase().includes(value) ||
            song.category.toLowerCase().includes(value);

        if (matches) {
            result.push(index);
        }
    });

    return result;
}

function getEmptyText() {
    if (currentView === "favorites" && favorites.length === 0) {
        return "No favorites yet. Tap the heart on a song.";
    }

    if (currentView === "playlist" && myPlaylist.length === 0) {
        return "Your playlist is empty. Tap + on a song to add it.";
    }

    return "No songs found";
}

function renderList() {
    const list = getVisibleSongs();

    const titles = {
        all: "Playlist",
        favorites: "Favorites",
        playlist: "My Playlist"
    };

    playlistTitle.textContent = titles[currentView];
    songCount.textContent = list.length + (list.length === 1 ? " Song" : " Songs");

    songList.innerHTML = "";

    if (list.length === 0) {
        emptyText.textContent = getEmptyText();
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    list.forEach((index) => {
        const song = songs[index];
        const item = document.createElement("div");

        item.className = "song-item";

        if (index === currentSong) {
            item.classList.add("active");
        }

        const inPlaylist = myPlaylist.includes(index);
        const isFavorite = favorites.includes(index);

        item.innerHTML = `
            <span class="song-number">${String(index + 1).padStart(2, "0")}</span>

            <div class="song-icon" style="background: ${song.color}">
                <i class="fa-solid fa-music"></i>
            </div>

            <div class="song-details">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>

            <span class="song-tag">${song.category}</span>

            <button class="mini-btn fav ${isFavorite ? "on" : ""}" title="Favorite">
                <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
            </button>

            <button class="mini-btn add ${inPlaylist ? "on" : ""}"
                title="${inPlaylist ? "Remove from My Playlist" : "Add to My Playlist"}">
                <i class="fa-solid ${inPlaylist ? "fa-check" : "fa-plus"}"></i>
            </button>
        `;

        // Song par click: play karo
        item.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        // Chote buttons: song play na ho, sirf wohi kaam ho
        item.querySelector(".fav").addEventListener("click", (event) => {
            event.stopPropagation();
            toggleFavorite(index);
        });

        item.querySelector(".add").addEventListener("click", (event) => {
            event.stopPropagation();
            togglePlaylist(index);
        });

        songList.appendChild(item);
    });
}

searchInput.addEventListener("input", renderList);


themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const light = document.body.classList.contains("light");

    themeBtn.innerHTML = light
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';

    localStorage.setItem("theme", light ? "light" : "dark");
});



document.addEventListener("keydown", (event) => {
    const tag = event.target.tagName;

    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
        return;
    }

    if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
    }

    if (event.code === "ArrowRight") {
        nextSong();
    }

    if (event.code === "ArrowLeft") {
        previousSong();
    }

    if (event.key.toLowerCase() === "m") {
        muteBtn.click();
    }
});


function formatTime(time) {
    if (isNaN(time) || !isFinite(time)) {
        return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}



if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

audio.volume = 0.7;
volume.value = 0.7;
volumeValue.textContent = "70%";

buildCategories();
loadSong(0);