const LocalStorageKey = "__EMOJI_BEAT_STORAGE__";
try {
	let data = JSON.parse(localStorage.getItem(LocalStorageKey));
	let currentBeat = data["currentBeat"];
} catch (error) {
	localStorage.setItem(
		LocalStorageKey,
		JSON.stringify({ currentBeat: "default", saves: [] })
	);
}


async function sleep(seconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, seconds * 1000);
	});
}

const trackContainer = document.getElementById("track-container");

const soundingElements = [
	document.getElementById("titlePlaceStrong"),
	document.getElementById("titlePlaceLi"),
	document.getElementById("titlePlace"),
];
let currentSoundingEl = 0;

let inc = 1;
function sounding() {
	if (!onplay) {
		soundingElements.forEach((el) => {
			el.classList.remove("sounding");
		});
		return;
	}
	if (currentSoundingEl === 2) inc = -1;
	if (currentSoundingEl === 0) inc = 1;
	soundingElements[currentSoundingEl].classList.toggle("sounding");
	currentSoundingEl += inc;
}

let speed = 5; //trackBeats played per secons

function getBeat() {
	return JSON.parse(localStorage.getItem(LocalStorageKey))["currentBeat"];
}

let trackList = [];
let trackSoundsList = [];

function addBeat(beatEl) {
	console.log(beatEl.textContent);
	trackList.push(beatEl.textContent);
	updateTrackDisplay();
}

let redisplayTimeOut;
function removeTrackBeat(trackBeatEl) {
	trackList.splice(parseInt(trackBeatEl.dataset.index), 1);
	trackBeatEl.classList.toggle("remove");

	if (redisplayTimeOut) {
		clearTimeout(redisplayTimeOut);
	}

	setTimeout(() => {
		trackBeatEl.classList.toggle("remove");
	}, 1000);

	redisplayTimeOut = setTimeout(() => {
		updateTrackDisplay();
	}, 300);
}

function updateTrackDisplay() {
	trackContainer.innerHTML = "";
	trackSoundsList = [];
	for (let i = 0; i < trackList.length; i++) {
		trackContainer.innerHTML += `<p class="track-beat" id="track-beat-no${i}" onclick="removeTrackBeat(this)" data-index="${i}">${trackList[i]}</p>`;
		trackSoundsList.push(getSoundPath(trackList[i]));
	}
}

const beatButtonsContainer = document.getElementById("beat-buttons-container");
let playBeat;
let icons;
let beatPackName;
function addBeatButtons() {
	beatButtonsContainer.innerHTML = "";
	beatPackName = getBeat();
	let beatPack = beats[beatPackName];
	icons = beatPack.icons;
	for (let i = 0; i < icons.length; i++) {
		if (!beatButtonsContainer.innerHTML.includes(icons[i])) {
			beatButtonsContainer.innerHTML += `<span onclick="addBeat(this)" class="beat-span">${icons[i]}</span>`;
			new Audio(`data/${beatPackName}/${beatPack.data[i]}`)
		}
	}
	playBeat = beatPack.data;
}

function findInList(searchList, searchValue) {
	for (let i = 0; i < searchList.length; i++) {
		if (searchValue == searchList[i]) {
			return i;
		}
	}
	return false;
}

let lastSound;
const soundPlayer = document.getElementById("soundPlayer");

function getSoundPath(beatIcon) {
	let index = findInList(icons, beatIcon);
	let path = `data/${beatPackName}/${playBeat[index]}`;
	return path;
}

let sound = false;
let sounds = []
function playSound(soundPath, number) {
	new Audio(soundPath).play()
	// sounds[number] = sound
	// setTimeout(() => {
	// 	sounds[number].pause()
	// }, 1000);
	// console.log(beatIcon, index, icons);
	// try {
	// 	lastSound.stop();
	// 	lastSound.remove();
	// } catch (error) {
	// 	if (!index) return;
	// 	lastSound = new Sound(`data/${beatPackName}/${playBeat[index]}`, 100, false);
	// 	lastSound.start();
	// }
}

async function animateTrackBeatPlay(trackBeatEl, i) {
	trackBeatEl.classList.toggle("beating");
	let p10TrackBeat = document.getElementById(
		`track-beat-no${i - parseInt(trackList.length * 0.1)}`
	);
	if (p10TrackBeat) {
		p10TrackBeat.classList.toggle("beating");
	} else {
		for (
			let j = i - parseInt(trackList.length * 0.1);
			j < trackList.length;
			j++
		) {
			try {
				document
					.getElementById(`track-beat-no${j}`)
					.classList.toggle("beating");
			} catch (error) {
				return;
			}
		}
	}
}

let onplay = false;
async function playTrack() {
	onplay = true;
	for (let i = 0; i < trackList.length; i++) {
		let trackBeatEl = document.getElementById(`track-beat-no${i}`);
		// console.log(trackBeatEl)
		if (trackBeatEl === null) {
			trackControl();
			break;
		}
		if (!onplay) return;
		playSound(trackSoundsList[i], i);
		animateTrackBeatPlay(trackBeatEl, i);
		await sleep(1 / speed);
		sounding();
	}
	trackControl();
	updateTrackDisplay();
	sounding();
}

const trackControlButton = document.getElementById("trackcontroller");

function trackControl() {
	updateTrackDisplay();
	trackControlButton.classList.toggle("stopped");
	if (onplay) {
		onplay = false;
	} else {
		playTrack();
	}
}

addBeatButtons();

const optionsPanel = document.getElementById("optionsPanel");
function optionsPanelControl() {
	optionsPanel.classList.toggle("close");
}

function pickPack(el) {
	localStorage.setItem(
		LocalStorageKey,
		JSON.stringify({ currentBeat: el.textContent })
	);
	optionsPanelControl();
	addBeatButtons();
	trackList = [];
	updateTrackDisplay();
}

function saveTrack() {
	if (trackList.length < 10) {
		alert("can't save a track les than 10 beats");
		return;
	}
	let temp = JSON.parse(localStorage.getItem(LocalStorageKey));
	temp.saves.push(trackList);
	temp.currentBeat = getBeat();
	localStorage.setItem(LocalStorageKey, JSON.stringify(temp));
}

function loadTrack() {
	let temp = JSON.parse(localStorage.getItem(LocalStorageKey));
	let info = prompt(`enter number the of the save 1-${temp.saves.length}`);
	try {
		let index = parseInt(info) - 1;
		trackList = temp.saves[index];
		updateTrackDisplay();
	} catch (error) {
		alert("wrong input");
	}
}
