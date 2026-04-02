document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial Hero Animations
    const heroElements = document.querySelectorAll('.fade-in-up');
    setTimeout(() => {
        heroElements.forEach(el => el.classList.add('visible'));
    }, 100);

    // 2. Smooth Scroll for Start Button
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    });

    const toBouquetBtn = document.getElementById('toBouquetBtn');
    if (toBouquetBtn) {
        toBouquetBtn.addEventListener('click', () => {
            document.getElementById('bouquet').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const toMessageBtn = document.getElementById('toMessageBtn');
    if (toMessageBtn) {
        toMessageBtn.addEventListener('click', () => {
            document.getElementById('message').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 3. Audio Toggle Logic
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let isPlaying = false;

    // Optional: Try autoplaying on first interaction anywhere
    document.body.addEventListener('click', () => {
        if(!isPlaying) {
            bgMusic.play().then(() => {
                isPlaying = true;
                updateMusicIcon();
            }).catch(e => {
                console.log("Audio play prevented:", e);
            });
        }
    }, { once: true }); 

    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent body click trigger
        if (isPlaying) {
            bgMusic.pause();
        } else {
            bgMusic.play();
        }
        isPlaying = !isPlaying;
        updateMusicIcon();
    });

    function updateMusicIcon() {
        if (isPlaying) {
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
            musicToggle.style.boxShadow = '0 0 15px rgba(255, 94, 148, 0.5)';
        } else {
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
            musicToggle.style.boxShadow = 'none';
        }
    }

    // 4. Scroll Reveal Intersection Observer
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // 5. Continuous Light Confetti
    setupConfetti();
});

// Confetti System
function setupConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to full window
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    // Confetti particles
    const confettiCount = 50; // light/subtle amount
    const confettiColors = ['#ffccd5', '#fad0c4', '#fbc2eb', '#ffffff', '#ffd1ff'];
    const particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height - height; // Start above screen
            this.size = Math.random() * 5 + 3;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.speedY = Math.random() * 1.5 + 0.5; // Slow fall
            this.speedX = Math.random() * 1 - 0.5; // Slight horizontal drift
            // Create some shapes as circles, some as tiny hearts/rectangles
            this.shape = Math.random() > 0.5 ? 'circle' : 'square';
            this.angle = Math.random() * 360;
            this.spinText = Math.random() < 0.2; // 20% spin factor
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if(this.spinText) this.angle += 2;

            // Reset particle when it drops below screen
            if (this.y > height) {
                this.y = -10;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.7; // soft transparency

            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            }
            ctx.restore();
        }
    }

    // Initialize particles
    for (let i = 0; i < confettiCount; i++) {
        particles.push(new Particle());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}
