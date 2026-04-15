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
        e.stopPropagation();
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
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // 5. Continuous Light Confetti
    setupConfetti();

    // 6. Scratch to Reveal Gallery Cards (FIXED)
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach(card => {
        const canvas = document.createElement('canvas');
        canvas.classList.add('scratch-canvas');
        card.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let isRevealed = false;
        let hasStartedScratching = false;
        
        // ---------- FIX: Robust initialization ----------
        function initCanvas() {
            if (isRevealed) return;
            
            const rect = card.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // Set actual canvas size (high DPI)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            // Reset transform and scale for crisp drawing
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            
            ctx.globalCompositeOperation = 'source-over';
            
            // Frosted silver gradient
            const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
            gradient.addColorStop(0, '#e5e5e5');
            gradient.addColorStop(0.5, '#f5f5f5');
            gradient.addColorStop(1, '#cccccc');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            // Instructions text
            ctx.font = '600 1.2rem Poppins, sans-serif';
            ctx.fillStyle = '#888';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Scratch Me ✨', rect.width / 2, rect.height / 2);
            
            hasStartedScratching = false;
        }
        
        // Wait for card to have dimensions, then draw
        function safeInit() {
            if (card.offsetWidth > 0 && card.offsetHeight > 0) {
                initCanvas();
            } else {
                requestAnimationFrame(safeInit);
            }
        }
        
        // Use ResizeObserver if available, otherwise fallback to window resize
        if (window.ResizeObserver) {
            const observer = new ResizeObserver(() => {
                if (!hasStartedScratching && !isRevealed) {
                    initCanvas();
                }
            });
            observer.observe(card);
        } else {
            window.addEventListener('resize', () => {
                if (!hasStartedScratching && !isRevealed) initCanvas();
            });
        }
        
        safeInit();
        
        // ---------- FIX: Correct coordinate mapping for DPR ----------
        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;   // = devicePixelRatio
            const scaleY = canvas.height / rect.height;
            
            let clientX = e.clientX;
            let clientY = e.clientY;
            
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }
        
        function scratch(e) {
            if (!isDrawing || isRevealed) return;
            if (e.cancelable) e.preventDefault();
            hasStartedScratching = true;
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,1)';  // Alpha channel is all that matters
            
            const pos = getPos(e);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 45, 0, Math.PI * 2); 
            ctx.fill();
        }
        
        function checkReveal() {
            if (isRevealed || !hasStartedScratching) return;
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let transparent = 0;
            
            // Check every 16th pixel (4 channels * 16 = 64)
            for (let i = 3; i < imageData.data.length; i += 64) {
                if (imageData.data[i] < 128) transparent++;
            }
            
            const totalPixelsScanned = Math.floor(imageData.data.length / 64);
            if (totalPixelsScanned > 0 && (transparent / totalPixelsScanned) > 0.4) {
                canvas.classList.add('revealed');
                isRevealed = true;
            }
        }
        
        // Event listeners (unchanged)
        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        window.addEventListener('mouseup', () => { isDrawing = false; checkReveal(); });
        
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        window.addEventListener('touchend', () => { isDrawing = false; checkReveal(); });
    });
});

// Confetti System (unchanged, kept for completeness)
function setupConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    
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

    const confettiCount = 50;
    const confettiColors = ['#ffccd5', '#fad0c4', '#fbc2eb', '#ffffff', '#ffd1ff'];
    const particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height - height;
            this.size = Math.random() * 5 + 3;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.speedY = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.shape = Math.random() > 0.5 ? 'circle' : 'square';
            this.angle = Math.random() * 360;
            this.spinText = Math.random() < 0.2;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if(this.spinText) this.angle += 2;

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
            ctx.globalAlpha = 0.7;

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

    for (let i = 0; i < confettiCount; i++) {
        particles.push(new Particle());
    }

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