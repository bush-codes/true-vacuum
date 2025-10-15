import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, MapPin } from 'lucide-react';

const FalseVacuumGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('paused'); // paused, playing, won, lost
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedBody, setSelectedBody] = useState(null);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const animationRef = useRef(null);
  
  // Physics constants
  const G = 100; // Gravitational constant (scaled for gameplay)
  const SHIP_RADIUS = 24;
  const WORMHOLE_RADIUS = 20;
  const VACUUM_SPEED = 0.5; // Speed of false vacuum collapse
  
  // Ship state
  const [ship, setShip] = useState({
    x: 100,
    y: 300,
    vx: 2,
    vy: 0,
    trail: []
  });
  
  // Vacuum collapse state
  const [vacuumEdge, setVacuumEdge] = useState(-100);
  
  // Level definitions
  const levels = [
    {
      name: "Proxima Centauri",
      ship: { x: 100, y: 300, vx: 2, vy: 0 },
      wormhole: { x: 700, y: 300 },
      bodies: [
        { id: 1, x: 400, y: 300, mass: 1000, dampening: 1, type: 'planet', color: '#4A90E2' }
      ]
    },
    {
      name: "Sirius System",
      ship: { x: 100, y: 200, vx: 2.5, vy: 1 },
      wormhole: { x: 700, y: 400 },
      bodies: [
        { id: 1, x: 300, y: 250, mass: 800, dampening: 1, type: 'planet', color: '#E24A4A' },
        { id: 2, x: 500, y: 350, mass: 600, dampening: 1, type: 'moon', color: '#888888' }
      ]
    },
    {
      name: "Vega Outpost",
      ship: { x: 100, y: 300, vx: 3, vy: -0.5 },
      wormhole: { x: 700, y: 200 },
      bodies: [
        { id: 1, x: 250, y: 400, mass: 1200, dampening: 1, type: 'star', color: '#FDB813' },
        { id: 2, x: 450, y: 250, mass: 500, dampening: 1, type: 'planet', color: '#50C878' },
        { id: 3, x: 550, y: 350, mass: 300, dampening: 1, type: 'asteroid', color: '#A0A0A0' }
      ]
    },
    {
      name: "Alpha Centauri",
      ship: { x: 100, y: 250, vx: 2, vy: 1.5 },
      wormhole: { x: 700, y: 450 },
      bodies: [
        { id: 1, x: 300, y: 200, mass: 1000, dampening: 1, type: 'star', color: '#FF6B35' },
        { id: 2, x: 400, y: 400, mass: 800, dampening: 1, type: 'planet', color: '#4ECDC4' },
        { id: 3, x: 550, y: 300, mass: 400, dampening: 1, type: 'moon', color: '#95A3A4' },
        { id: 4, x: 200, y: 450, mass: 200, dampening: 1, type: 'asteroid', color: '#B0B0B0' }
      ]
    },
    {
      name: "Betelgeuse Nebula",
      ship: { x: 100, y: 300, vx: 2.5, vy: 0 },
      wormhole: { x: 700, y: 350 },
      bodies: [
        { id: 1, x: 350, y: 300, mass: 1500, dampening: 1, type: 'star', color: '#DC143C' },
        { id: 2, x: 250, y: 150, mass: 600, dampening: 1, type: 'planet', color: '#9B59B6' },
        { id: 3, x: 450, y: 450, mass: 600, dampening: 1, type: 'planet', color: '#3498DB' },
        { id: 4, x: 550, y: 250, mass: 300, dampening: 1, type: 'moon', color: '#7F8C8D' }
      ]
    },
    {
      name: "Andromeda Border",
      ship: { x: 100, y: 400, vx: 3, vy: -1 },
      wormhole: { x: 700, y: 200 },
      bodies: [
        { id: 1, x: 300, y: 300, mass: 1200, dampening: 1, type: 'star', color: '#F39C12' },
        { id: 2, x: 500, y: 400, mass: 800, dampening: 1, type: 'planet', color: '#16A085' },
        { id: 3, x: 400, y: 150, mass: 500, dampening: 1, type: 'planet', color: '#8E44AD' },
        { id: 4, x: 600, y: 300, mass: 350, dampening: 1, type: 'moon', color: '#95A5A6' },
        { id: 5, x: 200, y: 500, mass: 200, dampening: 1, type: 'asteroid', color: '#B0B0B0' }
      ]
    },
    {
      name: "Orion's Gate",
      ship: { x: 100, y: 300, vx: 2, vy: 1 },
      wormhole: { x: 700, y: 400 },
      bodies: [
        { id: 1, x: 350, y: 250, mass: 1400, dampening: 1, type: 'star', color: '#E67E22' },
        { id: 2, x: 250, y: 450, mass: 700, dampening: 1, type: 'planet', color: '#2ECC71' },
        { id: 3, x: 500, y: 350, mass: 700, dampening: 1, type: 'planet', color: '#3498DB' },
        { id: 4, x: 450, y: 150, mass: 400, dampening: 1, type: 'moon', color: '#7F8C8D' },
        { id: 5, x: 600, y: 450, mass: 250, dampening: 1, type: 'asteroid', color: '#A5A5A5' }
      ]
    },
    {
      name: "Sagittarius Cluster",
      ship: { x: 100, y: 250, vx: 2.5, vy: 0.5 },
      wormhole: { x: 700, y: 450 },
      bodies: [
        { id: 1, x: 300, y: 300, mass: 1600, dampening: 1, type: 'star', color: '#C0392B' },
        { id: 2, x: 450, y: 200, mass: 900, dampening: 1, type: 'planet', color: '#1ABC9C' },
        { id: 3, x: 350, y: 450, mass: 700, dampening: 1, type: 'planet', color: '#9B59B6' },
        { id: 4, x: 550, y: 350, mass: 500, dampening: 1, type: 'moon', color: '#95A3A4' },
        { id: 5, x: 200, y: 150, mass: 300, dampening: 1, type: 'moon', color: '#888888' },
        { id: 6, x: 600, y: 500, mass: 200, dampening: 1, type: 'asteroid', color: '#B0B0B0' }
      ]
    },
    {
      name: "Milky Way Core",
      ship: { x: 100, y: 300, vx: 2, vy: -0.5 },
      wormhole: { x: 700, y: 250 },
      bodies: [
        { id: 1, x: 400, y: 300, mass: 2000, dampening: 1, type: 'star', color: '#E74C3C' },
        { id: 2, x: 300, y: 150, mass: 800, dampening: 1, type: 'planet', color: '#3498DB' },
        { id: 3, x: 500, y: 450, mass: 800, dampening: 1, type: 'planet', color: '#2ECC71' },
        { id: 4, x: 250, y: 400, mass: 500, dampening: 1, type: 'moon', color: '#95A5A6' },
        { id: 5, x: 550, y: 200, mass: 500, dampening: 1, type: 'moon', color: '#7F8C8D' },
        { id: 6, x: 600, y: 400, mass: 300, dampening: 1, type: 'asteroid', color: '#A0A0A0' }
      ]
    },
    {
      name: "Earth - Final Approach",
      ship: { x: 100, y: 300, vx: 2.5, vy: 0 },
      wormhole: { x: 700, y: 300 },
      bodies: [
        { id: 1, x: 550, y: 300, mass: 1800, dampening: 1, type: 'star', color: '#F1C40F', label: 'Sun' },
        { id: 2, x: 650, y: 320, mass: 600, dampening: 1, type: 'planet', color: '#2980B9', label: 'Earth' },
        { id: 3, x: 300, y: 200, mass: 900, dampening: 1, type: 'planet', color: '#E67E22' },
        { id: 4, x: 350, y: 400, mass: 700, dampening: 1, type: 'planet', color: '#9B59B6' },
        { id: 5, x: 450, y: 300, mass: 400, dampening: 1, type: 'moon', color: '#95A3A4' },
        { id: 6, x: 200, y: 350, mass: 300, dampening: 1, type: 'moon', color: '#7F8C8D' },
        { id: 7, x: 500, y: 150, mass: 250, dampening: 1, type: 'asteroid', color: '#B0B0B0' }
      ]
    }
  ];
  
  const [bodies, setBodies] = useState(levels[0].bodies);
  const [wormhole, setWormhole] = useState(levels[0].wormhole);
  
  // Initialize level
  useEffect(() => {
    const level = levels[currentLevel - 1];
    setShip({ ...level.ship, trail: [] });
    setBodies(level.bodies);
    setWormhole(level.wormhole);
    setVacuumEdge(-100);
    setGameState('paused');
    setSelectedBody(null);
  }, [currentLevel]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const gameLoop = () => {
      // Update ship position
      setShip(prevShip => {
        let { x, y, vx, vy, trail } = prevShip;
        
        // Calculate gravitational forces
        bodies.forEach(body => {
          const dx = body.x - x;
          const dy = body.y - y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          
          if (dist > 1) {
            const force = (G * body.mass * body.dampening) / distSq;
            const ax = (force * dx) / dist;
            const ay = (force * dy) / dist;
            
            vx += ax * 0.016;
            vy += ay * 0.016;
          }
        });
        
        // Update position
        x += vx;
        y += vy;
        
        // Update trail
        const newTrail = [...trail, { x, y }];
        if (newTrail.length > 50) newTrail.shift();
        
        return { x, y, vx, vy, trail: newTrail };
      });
      
      // Update vacuum edge
      setVacuumEdge(prev => prev + VACUUM_SPEED);
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, bodies]);
  
  // Check win/lose conditions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check if reached wormhole or Earth
    if (currentLevel === 10) {
      // On Earth level, check if reached Earth (body id 2)
      const earth = bodies.find(b => b.id === 2);
      if (earth) {
        const dx = ship.x - earth.x;
        const dy = ship.y - earth.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const earthRadius = Math.sqrt(earth.mass) / 3;
        
        if (dist < earthRadius + SHIP_RADIUS) {
          setGameState('won');
        }
      }
    } else {
      // Check if reached wormhole
      const dx = ship.x - wormhole.x;
      const dy = ship.y - wormhole.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < WORMHOLE_RADIUS + SHIP_RADIUS) {
        setGameState('won');
      }
    }
    
    // Check if caught by vacuum
    if (ship.x < vacuumEdge) {
      setGameState('lost');
    }
    
    // Check if ship went off screen
    if (ship.x < 0 || ship.x > 800 || ship.y < 0 || ship.y > 600) {
      setGameState('lost');
    }
  }, [ship, gameState, wormhole, vacuumEdge, currentLevel, bodies]);
  
  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 77) % 800;
      const y = (i * 131) % 600;
      ctx.fillRect(x, y, 1, 1);
    }
    
    // Draw vacuum collapse
    ctx.fillStyle = '#ff0066';
    ctx.fillRect(0, 0, vacuumEdge, 600);
    
    // Draw vacuum edge glow
    const gradient = ctx.createLinearGradient(vacuumEdge - 30, 0, vacuumEdge + 30, 0);
    gradient.addColorStop(0, 'rgba(255, 0, 102, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 102, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 0, 102, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(vacuumEdge - 30, 0, 60, 600);
    
    // Draw wormhole (not on final level)
    if (currentLevel < 10) {
      const wormholeGradient = ctx.createRadialGradient(
        wormhole.x, wormhole.y, 0,
        wormhole.x, wormhole.y, WORMHOLE_RADIUS
      );
      wormholeGradient.addColorStop(0, '#00ffff');
      wormholeGradient.addColorStop(0.5, '#0088ff');
      wormholeGradient.addColorStop(1, 'rgba(0, 136, 255, 0.3)');
      ctx.fillStyle = wormholeGradient;
      ctx.beginPath();
      ctx.arc(wormhole.x, wormhole.y, WORMHOLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw celestial bodies
    bodies.forEach(body => {
      const radius = Math.sqrt(body.mass) / 3;
      
      // Outer glow effect
      const outerGlow = ctx.createRadialGradient(
        body.x, body.y, 0,
        body.x, body.y, radius * 3
      );
      outerGlow.addColorStop(0, body.color);
      outerGlow.addColorStop(0.3, body.color + '99');
      outerGlow.addColorStop(0.6, body.color + '33');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(body.x, body.y, radius * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner glow effect
      const innerGlow = ctx.createRadialGradient(
        body.x, body.y, 0,
        body.x, body.y, radius * 1.5
      );
      innerGlow.addColorStop(0, '#ffffff');
      innerGlow.addColorStop(0.3, body.color);
      innerGlow.addColorStop(1, body.color);
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(body.x, body.y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Body core
      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(body.x, body.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Selection highlight and UI
      if (selectedBody === body.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(body.x, body.y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw dampening UI above the body
        const uiY = body.y - radius - 60;
        const uiX = body.x;
        
        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(uiX - 100, uiY, 200, 50);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(uiX - 100, uiY, 200, 50);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Gravity: ${(body.dampening * 100).toFixed(0)}%`, uiX, uiY + 18);
        
        // Slider track
        ctx.fillStyle = '#444444';
        ctx.fillRect(uiX - 80, uiY + 28, 160, 8);
        
        // Slider fill
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(uiX - 80, uiY + 28, 160 * body.dampening, 8);
        
        // Slider thumb
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(uiX - 80 + 160 * body.dampening, uiY + 32, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Label for special bodies
      if (body.label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(body.label, body.x, body.y + radius + 15);
      }
    });
    
    // Draw ship trail
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ship.trail.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    
    // Draw ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    const angle = Math.atan2(ship.vy, ship.vx);
    ctx.rotate(angle);
    
    // Ship body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(SHIP_RADIUS, 0);
    ctx.lineTo(-SHIP_RADIUS, SHIP_RADIUS / 2);
    ctx.lineTo(-SHIP_RADIUS, -SHIP_RADIUS / 2);
    ctx.closePath();
    ctx.fill();
    
    // Engine glow
    if (gameState === 'playing') {
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.moveTo(-SHIP_RADIUS, SHIP_RADIUS / 3);
      ctx.lineTo(-SHIP_RADIUS - 5, 0);
      ctx.lineTo(-SHIP_RADIUS, -SHIP_RADIUS / 3);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw UI overlay for paused state
    if (gameState === 'paused') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Configure gravity dampeners and press PLAY', 400, 40);
    }
    
    // Draw win/lose overlay
    if (gameState === 'won') {
      ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '36px monospace';
      ctx.textAlign = 'center';
      if (currentLevel === 10) {
        ctx.fillText('EARTH SAVED!', 400, 280);
        ctx.font = '18px monospace';
        ctx.fillText('NASA activated the stabilizer!', 400, 320);
      } else {
        const nextLevelName = levels[currentLevel].name;
        ctx.fillText(`Entering ${nextLevelName}`, 400, 300);
      }
    }
    
    if (gameState === 'lost') {
      ctx.fillStyle = 'rgba(100, 0, 0, 0.8)';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = '36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Universe Ended', 400, 280);
      ctx.font = '18px monospace';
      ctx.fillText('The true vacuum caught up', 400, 320);
      ctx.fillText('Click anywhere to try again', 400, 360);
    }
  }, [ship, bodies, wormhole, selectedBody, gameState, vacuumEdge, currentLevel]);
  
  const handleBodyClick = (bodyId) => {
    if (gameState === 'paused') {
      setSelectedBody(bodyId);
    }
  };
  
  const handleDampeningChange = (value) => {
    setBodies(prev => prev.map(body => 
      body.id === selectedBody ? { ...body, dampening: value } : body
    ));
  };
  
  const handlePlay = () => {
    setGameState('playing');
    setSelectedBody(null);
  };
  
  const handlePause = () => {
    setGameState('paused');
  };
  
  const handleReset = () => {
    const level = levels[currentLevel - 1];
    setShip({ ...level.ship, trail: [] });
    // Keep the current dampening values instead of resetting them
    setVacuumEdge(-100);
    setGameState('paused');
    setSelectedBody(null);
  };
  
  const handleNextLevel = () => {
    if (currentLevel < 10) {
      setCurrentLevel(prev => prev + 1);
    } else {
      setCurrentLevel(1);
    }
  };
  
  const handleJumpToLevel = (levelNum) => {
    setCurrentLevel(levelNum);
    setShowLevelSelect(false);
  };
  
  const selectedBodyData = bodies.find(b => b.id === selectedBody);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">False Vacuum Escape</h1>
        <p className="text-gray-300 mb-1">Level {currentLevel}: {levels[currentLevel - 1].name}</p>
        <p className="text-sm text-gray-400 max-w-2xl">
          The universe is ending behind you. Use gravity dampeners to navigate to the wormhole.
        </p>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-blue-500 rounded cursor-pointer"
          onClick={(e) => {
            if (gameState === 'lost') {
              handleReset();
              return;
            }
            
            if (gameState !== 'paused') return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicking on a body
            let clickedBody = null;
            bodies.forEach(body => {
              const dx = x - body.x;
              const dy = y - body.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const radius = Math.sqrt(body.mass) / 3;
              
              if (dist < radius * 2.5) {
                clickedBody = body;
              }
            });
            
            // If clicked on a body, select it
            if (clickedBody) {
              handleBodyClick(clickedBody.id);
            }
            // Check if clicking on slider for selected body
            else if (selectedBody) {
              const body = bodies.find(b => b.id === selectedBody);
              if (body) {
                const radius = Math.sqrt(body.mass) / 3;
                const uiY = body.y - radius - 60;
                const uiX = body.x;
                
                // Check if click is within slider UI area
                if (x >= uiX - 100 && x <= uiX + 100 && y >= uiY && y <= uiY + 50) {
                  // Click is within slider panel
                  if (x >= uiX - 80 && x <= uiX + 80 && y >= uiY + 24 && y <= uiY + 40) {
                    const sliderValue = (x - (uiX - 80)) / 160;
                    handleDampeningChange(Math.max(0, Math.min(1, sliderValue)));
                  }
                } else {
                  // Click is outside slider UI, deselect
                  setSelectedBody(null);
                }
              }
            } else {
              // No body selected and clicked in empty space, do nothing
            }
          }}
          onMouseMove={(e) => {
            if (gameState !== 'paused' || !e.buttons) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (selectedBody) {
              const body = bodies.find(b => b.id === selectedBody);
              if (body) {
                const radius = Math.sqrt(body.mass) / 3;
                const uiY = body.y - radius - 60;
                const uiX = body.x;
                
                // Check if dragging on slider
                if (x >= uiX - 80 && x <= uiX + 80 && y >= uiY + 24 && y <= uiY + 40) {
                  const sliderValue = (x - (uiX - 80)) / 160;
                  handleDampeningChange(Math.max(0, Math.min(1, sliderValue)));
                }
              }
            }
          }}
        />
      </div>
      
      <div className="mt-4 flex gap-4 items-center">
        {gameState === 'paused' && (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
          >
            <Play size={20} /> PLAY
          </button>
        )}
        
        {gameState === 'playing' && (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-bold"
          >
            <Pause size={20} /> PAUSE
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          <RotateCcw size={20} /> Reset
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowLevelSelect(!showLevelSelect)}
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            <MapPin size={20} /> Jump
          </button>
          
          {showLevelSelect && (
            <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border-2 border-purple-500 rounded p-2 grid grid-cols-2 gap-2 w-64">
              {levels.map((level, index) => (
                <button
                  key={index}
                  onClick={() => handleJumpToLevel(index + 1)}
                  className={`px-3 py-2 rounded text-sm ${
                    currentLevel === index + 1
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {index + 1}. {level.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {gameState === 'won' && (
          <button
            onClick={handleNextLevel}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
          >
            {currentLevel === 10 ? 'Play Again' : 'Next Level'} <ChevronRight size={20} />
          </button>
        )}
        
        {gameState === 'lost' && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
          >
            Try Again
          </button>
        )}
      </div>
      
      {gameState === 'paused' && !selectedBodyData && (
        <div className="mt-4 p-4 bg-gray-800 rounded w-80 text-center">
          <p className="text-gray-300 text-sm">
            Click on a celestial body to adjust its gravity dampener
          </p>
        </div>
      )}
    </div>
  );
};

export default FalseVacuumGame;