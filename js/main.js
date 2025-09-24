// Loading Screen Configuration
const loadingPairs = [
    { text: "Preparing something awesome...", image: "img/loading-screen/loading-scream.png" },
    { text: "Hang tight! It's almost ready...", image: "img/loading-screen/loading-scream.png" },
    { text: "Building the magic for you...", image: "img/loading-screen/galaxy.png" },
    { text: "Just a moment, getting things ready...", image: "img/loading-screen/animate.gif" },
    { text: "Almost there, hold on tight!", image: "img/loading-screen/loading-scream.png" },
    { text: "Planning, Designing, Coding, DEVELOPING!", image: "img/loading-screen/loading-scream.png" },
    { text: "reCycling the code, Hang on", image: "img/loading-screen/loading-scream.png" },
    { text: "Generating Design and Function to run...", image: "img/loading-screen/loading-scream.png" }
];

// Auto Image Slideshow Configuration - ADD NEW IMAGES HERE
const aboutMeImages = [
    'img/aboutme/aboutme1.jpg',
    'img/aboutme/aboutme2.jpg'
];

// Auto Image Slideshow functionality
function initializeAutoImageSlideshow() {
    const containers = document.querySelectorAll('.auto-slideshow');
    
    containers.forEach(container => {
        let currentImageIndex = 0;
        let slideInterval = null; // Store the interval ID
        const changeInterval = 5000; // 5 seconds

        // Create image elements
        function createImageElements() {
            container.innerHTML = '';
            
            aboutMeImages.forEach((imagePath, index) => {
                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = `About me ${index + 1}`;
                img.className = `aboutme absolute inset-0 w-full h-full object-cover`;
                img.style.opacity = index === 0 ? '1' : '0';
                img.style.transition = 'opacity 2s ease-in-out';
                
                container.appendChild(img);
            });
        }

        // Simple fade function
        function changeImage() {
            if (container.children.length === 0) return;
            
            const currentImg = container.children[currentImageIndex];
            const nextIndex = (currentImageIndex + 1) % aboutMeImages.length;
            const nextImg = container.children[nextIndex];

            // Simple opacity change
            currentImg.style.opacity = '0';
            nextImg.style.opacity = '1';
            
            currentImageIndex = nextIndex;
        }

        // Function to start the slideshow interval
        function startSlideshow() {
            if (aboutMeImages.length > 1 && !slideInterval) {
                slideInterval = setInterval(changeImage, changeInterval);
            }
        }

        // Add data attribute to mark this container for slideshow start
        container.setAttribute('data-slideshow-ready', 'true');
        
        // Store the start function on the container for the intersection observer
        container.startSlideshow = startSlideshow;

        // Initialize images but don't start interval yet
        if (aboutMeImages.length > 0) {
            createImageElements();
        }
    });
}

// Load loading component
function loadLoadingComponent() {
    fetch('components/loading.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
            initializeLoadingScreen();
        })
        .catch(error => {
            console.error('Error loading loading component:', error);
            // Fallback loading screen
            document.body.insertAdjacentHTML('afterbegin', 
                '<div id="loading-screen" class="fixed inset-0 z-50 flex items-center justify-center text-white bg-gray-800"><p>Loading...</p></div>'
            );
            initializeLoadingScreen();
        });
}

// Initialize loading screen functionality
function initializeLoadingScreen() {
    // Disable scrolling during loading
    document.body.style.overflow = 'hidden';
    
    // Select random loading pair
    const randomPair = loadingPairs[Math.floor(Math.random() * loadingPairs.length)];
    
    // Set random text and image
    const loadingText = document.getElementById('loading-text');
    const loadingImage = document.getElementById('loading-image');
    
    if (loadingText) loadingText.textContent = randomPair.text;
    if (loadingImage) {
        loadingImage.src = randomPair.image;
        loadingImage.alt = randomPair.text;
    }
    
    // Start loading screen timer
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // Re-enable scrolling after loading is complete
                document.body.style.overflow = 'auto';
                setupIntersectionObserver();
                // Initialize slideshow after loading is complete
                initializeAutoImageSlideshow();
            }, 1000);
        }, 100);
    }
}

// Load background component
function loadBackgroundComponent() {
    fetch('components/background.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('background-container').innerHTML = html;
            // Initialize Alpine.js for the new DOM elements
            if (window.Alpine) {
                Alpine.initTree(document.getElementById('background-container'));
            }
        })
        .catch(error => {
            console.error('Error loading background:', error);
            document.getElementById('background-container').innerHTML = 
                '<div class="fixed inset-0 bg-red-900 opacity-20 flex items-center justify-center"><p class="text-white">Background failed to load</p></div>';
        });
}

// Intersection Observer for scroll animations AND video autoplay
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        threshold: 0.1
    };

    const observerCallback = function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                entry.target.querySelectorAll('.animate-up, .animate-down, .animate-popin, .animate-left, .animate-left-b, .animate-right, .animate-right-b, .animate-right-c').forEach(text => {
                    text.classList.add('start-animation');
                });
                
                // Check if this section contains the waving video
                const wavingVideo = entry.target.querySelector('#waving-video');
                if (wavingVideo && !wavingVideo.hasAttribute('data-played')) {
                    // Mark as played so it only autoplays once
                    wavingVideo.setAttribute('data-played', 'true');
                    wavingVideo.currentTime = 0;
                    wavingVideo.play().catch(error => {
                        console.log('Video autoplay failed:', error);
                    });
                }
                
                // Check if this section contains slideshow containers and start them
                const slideshowContainers = entry.target.querySelectorAll('.auto-slideshow[data-slideshow-ready="true"]');
                slideshowContainers.forEach(container => {
                    if (container.startSlideshow) {
                        container.startSlideshow();
                        container.removeAttribute('data-slideshow-ready'); // Prevent multiple starts
                    }
                });
                
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    document.querySelectorAll('.main-content-section').forEach(section => {
        observer.observe(section);
    });
}

function setupVideoInteraction() {
    const clickableName = document.getElementById('clickable-name');
    const video = document.getElementById('waving-video');
    
    if (clickableName && video) {
        clickableName.addEventListener('click', function() {
            // Reset to beginning and play (manual trigger)
            video.currentTime = 0;
            video.play();
        });
        
        // When video ends, pause on first frame
        video.addEventListener('ended', function() {
            video.currentTime = 0;
            video.pause();
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top - multiple approaches to ensure it works
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    loadLoadingComponent();
    loadBackgroundComponent();
    setupVideoInteraction();
});

// Additional scroll to top on window load (after everything is loaded)
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

// Disable scroll restoration (browser remembering scroll position)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}