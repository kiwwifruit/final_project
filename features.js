// Select elements
const heart = document.getElementById("heart");
const slider = document.getElementById("bpm-slider");
const bpmValue = document.getElementById("bpm-value");
const heartbeatSound = document.getElementById("heartbeat-sound");

let bpm = 75;
let beatDuration = 60 / bpm / 2;
let heartbeatAnimation;
let isSoundStoppedByScroll = false;

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

// Function to update slider gradient dynamically
function updateSliderColor() {
    let percent = ((bpm - 50) / (180 - 50)) * 100;
    slider.style.background = `linear-gradient(to right, #e66b6b ${percent}%, #ccc ${percent}%)`;
}

// Function to control heartbeat sound
function updateHeartbeatSound() {
    if (isSoundStoppedByScroll) return;
    heartbeatSound.playbackRate = bpm / 50;
    heartbeatSound.loop = true;
    if (heartbeatSound.paused) {
        heartbeatSound.play();
    }
}

// Function to stop heartbeat sound on scroll
function stopHeartbeatOnScroll() {
    if (!heartbeatSound.paused) {
        heartbeatSound.pause();
        isSoundStoppedByScroll = true;
    }
}

// Event Listener for slider (Resumes sound only when user changes BPM)
slider.addEventListener("input", function () {
    bpm = this.value;
    bpmValue.textContent = bpm;
    isSoundStoppedByScroll = false;
    updateHeartbeatSound();
    updateSliderColor(); // Update color dynamically
});

// Event Listener for scroll to stop heartbeat sound permanently
window.addEventListener("scroll", stopHeartbeatOnScroll);

// Initialize animation & slider color
updateSliderColor();