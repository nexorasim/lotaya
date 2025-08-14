import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Particle system component
function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Generate random positions for particles
  const particles = useMemo(() => {
    const temp = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const i3 = i * 3;
      temp[i3] = (Math.random() - 0.5) * viewport.width * 2;
      temp[i3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      temp[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    return temp;
  }, [viewport]);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.075;
    }
  });
  
  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Floating geometric shapes
function FloatingShapes() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <group ref={group}>
      {/* Floating cubes */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.5)}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Floating spheres */}
      {Array.from({ length: 15 }, (_, i) => (
        <Sphere
          key={`sphere-${i}`}
          args={[0.1, 16, 16]}
          position={[
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 15
          ]}
        >
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 0.8, 0.6)}
            transparent
            opacity={0.4}
          />
        </Sphere>
      ))}
    </group>
  );
}

// Animated waves/grid
function AnimatedGrid() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current && mesh.current.material instanceof THREE.ShaderMaterial) {
      mesh.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0.2, 0.4, 1.0) }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          float wave1 = sin(pos.x * 0.5 + time * 2.0) * 0.5;
          float wave2 = sin(pos.y * 0.3 + time * 1.5) * 0.3;
          pos.z += wave1 + wave2;
          
          vWave = wave1 + wave2;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          float alpha = (vWave + 1.0) * 0.2;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);
  
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 4, 0, 0]} position={[0, -5, -10]} material={shaderMaterial}>
      <planeGeometry args={[20, 20, 32, 32]} />
    </mesh>
  );
}

interface ThreeDBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'blue' | 'purple' | 'teal' | 'gradient';
}

const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({ 
  intensity = 'medium', 
  theme = 'blue' 
}) => {
  const particleCount = intensity === 'low' ? 500 : intensity === 'medium' ? 1000 : 2000;
  
  return (
    <div className="fixed inset-0 -z-10">
      {/* Gradient background */}
      <motion.div
        className={`absolute inset-0 ${
          theme === 'blue' 
            ? 'bg-gradient-to-br from-gray-950 via-blue-950/20 to-purple-950/20'
            : theme === 'purple'
            ? 'bg-gradient-to-br from-gray-950 via-purple-950/20 to-pink-950/20'
            : theme === 'teal'
            ? 'bg-gradient-to-br from-gray-950 via-teal-950/20 to-cyan-950/20'
            : 'bg-gradient-to-br from-gray-950 via-indigo-950/20 to-purple-950/20'
        }`}
        animate={{
          background: [
            `linear-gradient(45deg, #030712 0%, rgba(30, 58, 138, 0.1) 50%, rgba(67, 56, 202, 0.1) 100%)`,
            `linear-gradient(135deg, #030712 0%, rgba(67, 56, 202, 0.1) 50%, rgba(30, 58, 138, 0.1) 100%)`,
            `linear-gradient(225deg, #030712 0%, rgba(30, 58, 138, 0.1) 50%, rgba(67, 56, 202, 0.1) 100%)`,
            `linear-gradient(315deg, #030712 0%, rgba(67, 56, 202, 0.1) 50%, rgba(30, 58, 138, 0.1) 100%)`,
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          
          {intensity !== 'low' && <ParticleField />}
          {intensity === 'high' && <FloatingShapes />}
          <AnimatedGrid />
        </Suspense>
      </Canvas>
      
      {/* Additional overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-gray-950/30 pointer-events-none" />
      
      {/* Animated glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default ThreeDBackground;