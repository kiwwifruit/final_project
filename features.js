// // Select elements
// const heart = document.getElementById("heart");
// const slider = document.getElementById("bpm-slider");
// const bpmValue = document.getElementById("bpm-value");
// const heartbeatSound = document.getElementById("heartbeat-sound");

// let bpm = 75;
// let beatDuration = 60 / bpm;
// let heartbeatAnimation;
// let isSoundStoppedByScroll = false;

// // Function to update heart animation
// function updateHeartAnimation() {
//     gsap.killTweensOf(heart);
//     beatDuration = 60 / bpm / 2;

//     heartbeatAnimation = gsap.to(heart, {
//         scale: 1.2,
//         repeat: -1,
//         yoyo: true,
//         duration: beatDuration,
//         ease: "power1.inOut"
//     });
// }

// // Function to update slider gradient dynamically
// function updateSliderColor() {
//     let percent = ((bpm - 50) / (180 - 50)) * 100;
//     slider.style.background = `linear-gradient(to right, #e66b6b ${percent}%, #ccc ${percent}%)`;
// }

// // Function to control heartbeat sound
// function updateHeartbeatSound() {
//     if (isSoundStoppedByScroll) return;
//     heartbeatSound.playbackRate = bpm / 50;
//     heartbeatSound.loop = true;
//     if (heartbeatSound.paused) {
//         heartbeatSound.play();
//     }
// }

// // Function to stop heartbeat sound on scroll
// function stopHeartbeatOnScroll() {
//     if (!heartbeatSound.paused) {
//         heartbeatSound.pause();
//         isSoundStoppedByScroll = true;
//     }
// }

// // Event Listener for slider (Resumes sound only when user changes BPM)
// slider.addEventListener("input", function () {
//     bpm = this.value;
//     bpmValue.textContent = bpm;
//     isSoundStoppedByScroll = false;
//     updateHeartbeatSound();
//     updateSliderColor(); // Update color dynamically
// });

// // Event Listener for scroll to stop heartbeat sound permanently
// window.addEventListener("scroll", stopHeartbeatOnScroll);

// // Initialize animation & slider color
// updateSliderColor();

// Select elements
const heart = document.getElementById("heart");
const slider = document.getElementById("bpm-slider");
const bpmValue = document.getElementById("bpm-value");
const heartbeatSound = document.getElementById("heartbeat-sound");

let bpm = 75;
let beatInterval;
let isSoundStoppedByScroll = true;

// Function to update heart animation at exact BPM
// function updateHeartAnimation() {
//     gsap.killTweensOf(heart);
//     let beatDuration = 60 / bpm; // One full beat cycle

//     gsap.to(heart, {
//         scale: 1.2,
//         duration: beatDuration / 2, // Half duration for beat-in
//         ease: "power1.inOut",
//         repeat: -1,
//         yoyo: true,
//     });
// }

// Function to play heartbeat sound exactly once per beat
function playHeartbeatSound() {
    if (isSoundStoppedByScroll) return;

    clearInterval(beatInterval); // Reset previous interval
    beatInterval = setInterval(() => {
        heartbeatSound.currentTime = 0; // Restart sound from beginning
        heartbeatSound.play();
    }, (60 / bpm) * 1000); // Convert seconds to milliseconds
}

// Function to stop heartbeat sound on scroll
function stopHeartbeatOnScroll() {
    clearInterval(beatInterval);
    isSoundStoppedByScroll = true;
}

// Function to update slider gradient dynamically
function updateSliderColor() {
    let percent = ((bpm - 50) / (180 - 50)) * 100;
    slider.style.background = `linear-gradient(to right, #e66b6b ${percent}%, #ccc ${percent}%)`;
}

// Event Listener for slider change (Updates BPM and resumes sound)
slider.addEventListener("input", function () {
    bpm = this.value;
    bpmValue.textContent = bpm;
    isSoundStoppedByScroll = false;

    // updateHeartAnimation(); // Sync heart with new BPM
    playHeartbeatSound(); // Sync sound with new BPM
    updateSliderColor(); // Update color dynamically
});

// Event Listener for scroll to stop heartbeat sound permanently
window.addEventListener("scroll", stopHeartbeatOnScroll);

// Initialize heart animation & slider color
// updateHeartAnimation();
updateSliderColor();
playHeartbeatSound();