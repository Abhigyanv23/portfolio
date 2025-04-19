document.addEventListener('DOMContentLoaded', function() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'starry-background';
    
    // Add styling to ensure the canvas is in the background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1'; // Put it behind all content
    canvas.style.pointerEvents = 'none'; // Don't interfere with clicks
    
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Set up canvas and context
    const ctx = canvas.getContext('2d');
    
    // Fix: Set actual pixel dimensions for the canvas (not just CSS dimensions)
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // More subtle color palette (dark blue with hints of purple)
    const colors = {
      background: '#0a0a1a', // Very dark blue-black
      starColor1: '#ffffff', // White
      starColor2: '#8a9cc2', // Light blue-purple
      starColor3: '#5a6d99'  // Medium blue-purple
    };
    
    // Star properties
    const stars = [];
    const starCount = Math.floor(width * height / 1500); // More stars
    const maxStarSize = 2.5;
    
    // Create stars
    function createStars() {
      stars.length = 0; // Clear array
      for (let i = 0; i < starCount; i++) {
        // Create different types of stars for visual interest
        const starType = Math.random();
        const size = Math.random() * maxStarSize;
        
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: size,
          opacity: Math.random() * 0.7 + 0.3, // Brighter stars
          pulse: 0.003 + Math.random() * 0.01,
          pulseFactor: Math.random() * Math.PI,
          // Fix: Make sure we're creating valid rgba colors
          color: starType > 0.7 ? 'rgba(255, 255, 255,' : 
                 starType > 0.4 ? 'rgba(138, 156, 194,' : 'rgba(90, 109, 153,',
          twinkle: Math.random() > 0.7 // Some stars twinkle more than others
        });
      }
      
      // Add a few shooting stars
      for (let i = 0; i < 3; i++) {
        addShootingStar();
      }
    }
    
    // Add shooting star
    function addShootingStar() {
      const angle = Math.random() * Math.PI / 4 + Math.PI / 8; // Angle between PI/8 and 3PI/8
      const speed = 2 + Math.random() * 4;
      
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height/3, // Start in top third
        size: 1 + Math.random(),
        opacity: 0.7 + Math.random() * 0.3,
        shooting: true,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        tail: 50 + Math.random() * 70, // Length of tail
        life: 1.0 // Life of shooting star
      });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createStars();
    });
    
    // Initial star creation
    createStars();
    
    // Shooting star timer
    setInterval(function() {
      if (Math.random() > 0.7) {
        addShootingStar();
      }
    }, 4000);
    
    // Animation loop
    function animate() {
      // Clear canvas with background color
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        if (star.shooting) {
          // Update shooting star position
          star.x += star.speedX;
          star.y += star.speedY;
          
          // Decrease life
          star.life -= 0.01;
          
          // Remove if out of bounds or life ended
          if (star.x < 0 || star.x > width || star.y < 0 || star.y > height || star.life <= 0) {
            stars.splice(i, 1);
            i--;
            
            // Replace with new shooting star occasionally
            if (Math.random() > 0.7) {
              addShootingStar();
            }
            continue;
          }
          
          // Draw shooting star
          ctx.beginPath();
          
          // Create gradient for tail
          const gradient = ctx.createLinearGradient(
            star.x, star.y,
            star.x - star.speedX * star.tail, star.y - star.speedY * star.tail
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * star.life})`);
          gradient.addColorStop(0.1, `rgba(200, 200, 255, ${star.opacity * star.life * 0.8})`);
          gradient.addColorStop(0.5, `rgba(120, 120, 210, ${star.opacity * star.life * 0.4})`);
          gradient.addColorStop(1, 'rgba(70, 70, 120, 0)');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.size;
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - star.speedX * star.tail, star.y - star.speedY * star.tail);
          ctx.stroke();
          
          // Star head
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * star.life})`;
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Regular star
          star.pulseFactor += star.pulse;
          
          // Pulsing effect
          let pulsedOpacity = star.opacity;
          if (star.twinkle) {
            pulsedOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.pulseFactor));
          }
          
          // Draw the star
          ctx.beginPath();
          // Fix: Use the color directly with the opacity
          ctx.fillStyle = `${star.color}${pulsedOpacity})`;
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow for larger stars
          if (star.size > 1.2) {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
              star.x, star.y, 0,
              star.x, star.y, star.size * 4
            );
            // Fix: Use the color with appropriate opacity
            gradient.addColorStop(0, `${star.color}${pulsedOpacity * 0.5})`);
            gradient.addColorStop(1, `${star.color}0)`);
            ctx.fillStyle = gradient;
            ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Add subtle movement to stars
      if (Math.random() > 0.99) {
        for (let i = 0; i < 5; i++) {
          const randomIndex = Math.floor(Math.random() * stars.length);
          if (stars[randomIndex] && !stars[randomIndex].shooting) {
            stars[randomIndex].x += (Math.random() - 0.5) * 1;
            stars[randomIndex].y += (Math.random() - 0.5) * 1;
          }
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Add hover effects to navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(function(link) {
      link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.7)';
        this.style.transition = 'all 0.3s ease';
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.textShadow = 'none';
        this.style.transition = 'all 0.3s ease';
      });
    });
    
    // Add cool hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 15px 30px rgba(0, 0, 10, 0.3)';
        this.style.transition = 'all 0.3s ease';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
        this.style.transition = 'all 0.3s ease';
      });
    });
});