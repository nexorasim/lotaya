
import React, { useRef, useEffect } from 'react';

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[];

        // Configuration for a more dynamic and immersive "3D" starfield effect
        const options = {
            particleColor: "rgba(147, 197, 253, 0.7)",
            particleAmount: 600, // Increased for a denser feel
            defaultSpeed: 0.15,  // Faster for a more dynamic feel
            variantSpeed: 0.2,
            defaultRadius: 0.5,  // Smaller base size for finer stars
            variantRadius: 1.5,
            fov: 500,          // Wider Field of View for a greater sense of depth
            centerZ: 1500,       // Deeper field for more parallax
        };

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Particle class represents a star in 3D space.
        // We simulate 3D by projecting x,y,z coordinates to a 2D canvas.
        class Particle {
            x: number;
            y: number;
            z: number;
            radius: number;
            speed: number;

            constructor(x: number = 0, y: number = 0, z: number = 0) {
                this.x = x;
                this.y = y;
                this.z = z;
                this.radius = 0;
                this.speed = 0;
                this.reset();
            }

            reset() {
                // Position particles randomly in a 3D volume, slightly outside view for better entry
                this.x = (Math.random() - 0.5) * canvas.width * 2.5;
                this.y = (Math.random() - 0.5) * canvas.height * 2.5;
                this.z = Math.random() * options.centerZ;
                this.radius = options.defaultRadius + Math.random() * options.variantRadius;
                this.speed = options.defaultSpeed + Math.random() * options.variantSpeed;
            }
            
            // Project 3D particle to 2D screen coords and draw
            draw(context: CanvasRenderingContext2D, screenX: number, screenY: number, scale: number) {
                context.beginPath();
                context.arc(screenX, screenY, this.radius * scale, 0, Math.PI * 2);
                context.closePath();
                // Opacity fades based on distance (scale)
                const opacity = Math.max(0, Math.min(1, scale * 1.5));
                context.fillStyle = `rgba(147, 197, 253, ${opacity})`;
                context.fill();
            }

            update() {
                // Move particle towards the viewer
                this.z -= this.speed;
                // If particle is behind the viewer, reset it to the back
                if (this.z < 1) {
                    this.reset();
                    this.z = options.centerZ; // Place it at the far end for a continuous loop
                }
            }
        }

        function setupParticles() {
            particles = [];
            for (let i = 0; i < options.particleAmount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            // Center the coordinate system for the projection
            ctx!.save();
            ctx!.translate(canvas.width / 2, canvas.height / 2);
            ctx!.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                
                // Perspective projection formula: scale decreases with distance (z)
                const scale = options.fov / (options.fov + p.z);
                const screenX = p.x * scale;
                const screenY = p.y * scale;

                // Draw if particle is within the screen bounds
                if(Math.abs(screenX) < canvas.width / 2 && Math.abs(screenY) < canvas.height / 2) {
                   p.draw(ctx!, screenX, screenY, scale);
                }
            });

            ctx!.restore();
            animationFrameId = requestAnimationFrame(animate);
        }
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Re-initialize particles on resize to fit new screen dimensions
            setupParticles();
        };
        
        window.addEventListener('resize', handleResize);
        
        setupParticles();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };

    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 bg-gray-950"
            aria-hidden="true"
        />
    );
};

export default ParticleBackground;
