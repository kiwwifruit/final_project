// 1️⃣ Create Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(200, 200);
document.getElementById("3d-human").appendChild(renderer.domElement);

// 2️⃣ Add Camera Controls (Zoom & Rotate)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(3, 3, 6);
controls.update();

// 3️⃣ Add Axes (X=Red, Y=Green, Z=Blue)
const axesHelper = new THREE.AxesHelper(6);
scene.add(axesHelper);

// 4️⃣ Load an SVG as a Texture for the Icon
const textureLoader = new THREE.TextureLoader();
const svgTexture = textureLoader.load("assets/acc.svg");

const iconMaterial = new THREE.MeshBasicMaterial({ map: svgTexture, transparent: true });
const iconGeometry = new THREE.PlaneGeometry(3, 3);
const icon = new THREE.Mesh(iconGeometry, iconMaterial);
scene.add(icon);

// Create a Line to Connect Icon to Origin
const lineMaterial = new THREE.LineBasicMaterial({ color: 'skyblue', linewidth: 20 }); // Red line
const lineGeometry = new THREE.BufferGeometry();
const points = [new THREE.Vector3(0, 0, 0), icon.position.clone()];
lineGeometry.setFromPoints(points);
const connectingLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(connectingLine);

// 5️⃣ Function to Update Position Based on Sliders
function updatePosition() {
    const y = parseFloat(document.getElementById("y-slider").value);
    const z = parseFloat(document.getElementById("z-slider").value);
    const x = parseFloat(document.getElementById("x-slider").value);

    icon.position.set(y, z, x);
    const positions = connectingLine.geometry.attributes.position.array;
    positions[5] = x; // Update X
    positions[4] = z; // Update Y (since Z is vertical)
    positions[3] = y; // Update Z (since Y is swapped with Z)
    connectingLine.geometry.setFromPoints([new THREE.Vector3(0, 0, 0), icon.position.clone()]);
    updateDistance(y, z, x);
}

// 6️⃣ Function to Calculate Euclidean Distance
function updateDistance(x, y, z) {
    const distance = Math.sqrt(x * x + y * y + z * z).toFixed(2);
    document.getElementById("distance-value").textContent = distance;
}

// 7️⃣ Attach Event Listeners to Sliders
document.getElementById("x-slider").addEventListener("input", updatePosition);
document.getElementById("y-slider").addEventListener("input", updatePosition);
document.getElementById("z-slider").addEventListener("input", updatePosition);

// 🔟 Render Scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

document.addEventListener("DOMContentLoaded", function () {
    const animationContainer = document.getElementById("3d-human");
    const sliderContainer = document.querySelector(".slider-container");

    if (animationContainer && sliderContainer) {
        animationContainer.insertAdjacentElement("afterend", sliderContainer);
    }
});