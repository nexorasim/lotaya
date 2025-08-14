
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
        let tick = 0;
        
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        const options = {
            particleColor: "rgba(147, 197, 253, 0.7)",
            lineColor: "rgba(167, 139, 250, 0.15)",
            particleAmount: 150,
            defaultRadius: 1.5,
            variantRadius: 1,
            defaultSpeed: 0.2,
            variantSpeed: 0.2,
            linkRadius: 250,
            parallaxFactor: 25,
        };

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            x: number;
            y: number;
            z: number;
            displayX: number;
            displayY: number;
            radius: number;
            speed: number;
            directionAngle: number;
            vector: { x: number; y: number };
            pulseOffset: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() + 0.1; // z from 0.1 to 1.1
                this.displayX = this.x;
                this.displayY = this.y;
                this.radius = (options.defaultRadius + Math.random() * options.variantRadius) * this.z;
                this.speed = (options.defaultSpeed + Math.random() * options.variantSpeed) * this.z;
                this.directionAngle = Math.floor(Math.random() * 360);
                this.vector = {
                    x: Math.cos(this.directionAngle) * this.speed,
                    y: Math.sin(this.directionAngle) * this.speed,
                };
                this.pulseOffset = Math.random() * 100;
            }

            draw(context: CanvasRenderingContext2D, currentTick: number) {
                context.beginPath();
                context.arc(this.displayX, this.displayY, this.radius, 0, Math.PI * 2);
                context.closePath();
                context.fillStyle = options.particleColor;
                const pulse = (Math.sin((currentTick + this.pulseOffset) * 0.02) + 1) / 2; // Varies between 0 and 1
                context.globalAlpha = this.z * (0.3 + pulse * 0.5); // Pulse between 0.3 and 0.8 opacity, scaled by depth
                context.fill();
            }

            update() {
                this.border();
                this.x += this.vector.x;
                this.y += this.vector.y;
            }

            border() {
                if (this.x >= canvas.width || this.x <= 0) this.vector.x *= -1;
                if (this.y >= canvas.height || this.y <= 0) this.vector.y *= -1;
                if (this.x > canvas.width) this.x = canvas.width;
                if (this.y > canvas.height) this.y = canvas.height;
                if (this.x < 0) this.x = 0;
                if (this.y < 0) this.y = 0;
            }
        }

        function setupParticles() {
            particles = [];
            for (let i = 0; i < options.particleAmount; i++) {
                particles.push(new Particle());
            }
        }

        function linkParticles(context: CanvasRenderingContext2D) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const distance = Math.hypot(particles[i].displayX - particles[j].displayX, particles[i].displayY - particles[j].displayY);
                    if (distance < options.linkRadius) {
                        const opacity = 1 - (distance / options.linkRadius);
                        context.globalAlpha = opacity;
                        context.beginPath();
                        context.moveTo(particles[i].displayX, particles[i].displayY);
                        context.lineTo(particles[j].displayX, particles[j].displayY);
                        context.strokeStyle = options.lineColor;
                        context.lineWidth = 0.5;
                        context.stroke();
                    }
                }
            }
            context.globalAlpha = 1;
        }

        function animate() {
            tick++;
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
            const mouseOffsetX = (mouse.x - canvas.width / 2) / (canvas.width / 2);
            const mouseOffsetY = (mouse.y - canvas.height / 2) / (canvas.height / 2);

            particles.forEach(p => {
                p.update();
                p.displayX = p.x + mouseOffsetX * p.z * options.parallaxFactor;
                p.displayY = p.y + mouseOffsetY * p.z * options.parallaxFactor;
                p.draw(ctx!, tick);
            });

            linkParticles(ctx!);
            animationFrameId = requestAnimationFrame(animate);
        }
        
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        
        const handleMouseOut = () => {
            mouse.x = canvas.width / 2;
            mouse.y = canvas.height / 2;
        }

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setupParticles();
        };
        
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseout', handleMouseOut);
        
        setupParticles();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };

    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default ParticleBackground;