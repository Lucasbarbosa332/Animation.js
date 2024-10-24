const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let bokehs = [];
let numBokehs = 100;
let maxSize = 20;
let maxSpeed = 5;
let fov = 20;
let motionBlur = 0.9;

function createBokeh() {
    const size = Math.random() * maxSize + 10;
    return {
        x: Math.random() * width,
        y: Math.random() * height + 10,
        size: size,
        speed: (size / maxSize) * maxSpeed,
        color: `hsla(${Math.random() * 360}, 50%, 50%, 0.2)`,
        opacity: Math.random() * 0.5 + 0.5
    };
}

function initBokehs() {
    bokehs = [];
    for (let i = 0; i < numBokehs; i++) {
        bokehs.push(createBokeh());
    }
}

function drawHexagon(x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const xPos = x + size * Math.cos(angle);
        const yPos = y + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    ctx.closePath();
}

function update() {
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - motionBlur})`;
    ctx.fillRect(0, 0, width, height);

    bokehs.forEach(bokeh => {
        bokeh.x += bokeh.speed;
        if (bokeh.x > width + bokeh.size) {
            bokeh.x = -bokeh.size;
        }

        const scale = 1 + (bokeh.y - height / 2) * (fov / 1000);
        const size = bokeh.size * scale;
        const opacity = bokeh.opacity * (1 - (bokeh.y / height) * 0.5);

        ctx.fillStyle = bokeh.color;
        ctx.globalAlpha = opacity;
        
        drawHexagon(bokeh.x, bokeh.y, size);
        ctx.fill();
    });

    requestAnimationFrame(update);
}

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBokehs();
}

window.addEventListener('resize', resizeCanvas);

initBokehs();
update();

// Configuration panel
const configToggle = document.getElementById('config-toggle');
const configContent = document.getElementById('config-content');
const numBokehsInput = document.getElementById('num-bokehs');
const maxSizeInput = document.getElementById('max-size');
const maxSpeedInput = document.getElementById('max-speed');
const fovInput = document.getElementById('fov');
const motionBlurInput = document.getElementById('motion-blur');

configToggle.addEventListener('click', () => {
    if (configContent.style.display === 'none') {
        configContent.style.display = 'block';
        gsap.to(configToggle.querySelectorAll('.bar'), {
            duration: 0.3,
            rotate: (_, i) => [0, 45, -45][i],
            y: (_, i) => [0, 3, -3][i]
        });
    } else {
        configContent.style.display = 'none';
        gsap.to(configToggle.querySelectorAll('.bar'), {
            duration: 0.3,
            rotate: 0,
            y: 0
        });
    }
});

function updateConfig(input, value) {
    document.getElementById(`${input.id}-value`).textContent = value;
    switch (input.id) {
        case 'num-bokehs':
            numBokehs = parseInt(value);
            initBokehs();
            break;
        case 'max-size':
            maxSize = parseInt(value);
            initBokehs();
            break;
        case 'max-speed':
            maxSpeed = parseFloat(value);
            bokehs.forEach(bokeh => {
                bokeh.speed = (bokeh.size / maxSize) * maxSpeed;
            });
            break;
        case 'fov':
            fov = parseInt(value);
            break;
        case 'motion-blur':
            motionBlur = parseFloat(value);
            break;
    }
}

[numBokehsInput, maxSizeInput, maxSpeedInput, fovInput, motionBlurInput].forEach(input => {
    input.addEventListener('input', (e) => updateConfig(e.target, e.target.value));
});

// Initialize configuration values
updateConfig(numBokehsInput, numBokehsInput.value);
updateConfig(maxSizeInput, maxSizeInput.value);
updateConfig(maxSpeedInput, maxSpeedInput.value);
updateConfig(fovInput, fovInput.value);
updateConfig(motionBlurInput, motionBlurInput.value);

// Initially hide the config content
configContent.style.display = 'none';

// Fullscreen toggle
const fullscreenToggle = document.getElementById('fullscreen-toggle');

fullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenToggle.textContent = 'Exit Full Screen';
    } else {
        fullscreenToggle.textContent = 'Enter Full Screen';
    }
    resizeCanvas();
});