console.log("Script loaded correctly.");

// Voice Recognition Setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = false;

// DOM Elements
const cameraIcon = document.getElementById('camera-icon');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const gallery = document.getElementById('gallery');
const captureButton = document.getElementById('capture-button');
const imagePopup = document.getElementById('image-popup');
const popupImage = document.getElementById('popup-image');
const closeButton = document.querySelector('.close-button');
const toggleSwitch = document.getElementById('dark-mode-toggle');
let localStream = null;

// Capture button hover animation
gsap.fromTo("#capture-button", { scale: 1 }, { scale: 1.2, duration: 0.2, repeat: -1, yoyo: true });

// Camera icon bounce animation when toggled
function cameraIconBounce() {
    gsap.fromTo(cameraIcon, { scale: 1 }, { scale: 1.1, duration: 0.3, yoyo: true });
}

// Help popup animation
function toggleHelpPopup() {
    const helpPopup = document.getElementById('help-popup');
    if (!helpPopup.classList.contains('show')) {
        gsap.fromTo(helpPopup, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 });
    } else {
        gsap.to(helpPopup, { opacity: 0, x: 20, duration: 0.5 });
    }
    helpPopup.classList.toggle('show');
}

// Open the camera
function openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            localStream = stream;
            video.srcObject = stream;
            video.style.display = 'block';
            captureButton.style.display = 'block';
            cameraIconBounce(); // Trigger bounce animation on camera icon
        })
        .catch((err) => {
            console.error('Error accessing the camera: ', err);
        });
}

// Close the camera
function closeCamera() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        video.style.display = 'none';
        captureButton.style.display = 'none';
        cameraIconBounce(); // Trigger bounce animation on camera icon
    }
}

// Toggle camera on and off when clicking the camera icon
function toggleCamera() {
    if (video.style.display === 'none') {
        openCamera();
    } else {
        closeCamera();
    }
}


// Countdown and Capture Photo
function startCountdownAndCapture() {
    let countdown = 1;
    const interval = setInterval(() => {
        console.log(countdown);
        countdown--;
        if (countdown === 0) {
            clearInterval(interval);
            capturePhoto();
        }
    }, 1000);
}

// Capture Photo
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.style.display = 'block';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    saveToGallery(dataURL);
    canvas.style.display = 'none';
}

// Save Image to LocalStorage and Show in Gallery
function saveToGallery(dataURL) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images.push(dataURL);
    localStorage.setItem('images', JSON.stringify(images));
    updateGallery();
}

// Load Gallery from LocalStorage
function updateGallery() {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    gallery.innerHTML = '';

    images.forEach((imageData, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        const imgElement = document.createElement('img');
        imgElement.src = imageData;
        imgContainer.appendChild(imgElement);

        // Create a delete button with FontAwesome icon
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = function () {
            deleteImage(index);
        };
        imgContainer.appendChild(deleteButton);

        // Add click event to open image in popup
        imgElement.onclick = function () {
            openImageByIndex(index);
        };

        gallery.appendChild(imgContainer);
    });
}

// Delete image from gallery and localStorage
function deleteImage(index) {
    let images = JSON.parse(localStorage.getItem('images')) || [];
    images.splice(index, 1);
    localStorage.setItem('images', JSON.stringify(images));
    updateGallery();
}

// Load gallery on page load
window.onload = function () {
    updateGallery();
    startVoiceRecognition();
    loadThemePreference(); // Load the theme preference on page load
};

// Start voice recognition function
function startVoiceRecognition() {
    try {
        recognition.start();
        console.log('Voice recognition started');
    } catch (error) {
        console.error('Voice recognition start error:', error);
    }
}

// Open image popup by index
function openImageByIndex(index) {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    if (index >= 0 && index < images.length) {
        popupImage.src = images[index];
        imagePopup.style.display = 'flex';
        gsap.fromTo(imagePopup, { scale: 0.5 }, { scale: 1, duration: 0.5 });
    }
}

// Close the image popup
function closePopup() {
    gsap.to(imagePopup, { scale: 0.5, duration: 0.5, onComplete: () => imagePopup.style.display = 'none' });
}

// Toggle the visibility of the help popup
function toggleHelpPopup() {
    const helpPopup = document.getElementById('help-popup');
    helpPopup.classList.toggle('show');
}

// Handle voice commands
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log('User said:', transcript);

    if (transcript.includes('open camera')) {
        openCamera();
    } else if (transcript.includes('capture')) {
        startCountdownAndCapture();
    } else if (transcript.includes('close camera')) {
        closeCamera();
    } else if (transcript.includes('open image')) {
        const index = parseInt(transcript.split('open image ')[1]) - 1;
        if (!isNaN(index)) {
            openImageByIndex(index);
        }
    } else if (transcript.includes('close image')) {
        closePopup();
    }
};

// Restart voice recognition after each command
recognition.onend = () => {
    startVoiceRecognition();
};

recognition.onerror = (event) => {
    console.error('Speech recognition error detected: ' + event.error);
};

// Dark Mode Theme Toggle
function loadThemePreference() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleSwitch.checked = true;
    }
}

toggleSwitch.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});