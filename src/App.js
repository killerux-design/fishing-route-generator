import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCcw, Play, Square, Settings } from 'lucide-react';

const CustomSlider = ({ min, max, value, onChange, label, step = 1 }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const handlePosition = Math.min(percentage, 88); // Cap handle at 88%
  
  return (
    <div>
      {/* Label with value on the right */}
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-medium text-gray-700 ml-4">
          {typeof value === 'number' ? (step < 1 ? value.toFixed(1) : value) : value}
        </span>
      </div>
      <div className="relative">
        {/* Background Track - full width */}
        <div className="w-full h-1 bg-gray-200 rounded-lg relative">
          {/* Fill Track - connects to handle */}
          <div 
            className="h-1 bg-[#07819e] rounded-lg absolute top-0 left-0"
            style={{ width: `${handlePosition + 12}%` }} // Extend slightly to connect to handle center
          />
        </div>
        
        {/* Thumb */}
        <div 
          className="w-8 h-8 bg-[#07819e] rounded-full absolute -translate-y-[18px] transform cursor-pointer shadow-md"
          style={{ 
            left: `${handlePosition}%`,
          }}
        />
        
        {/* Hidden input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

const DropdownButton = ({ disabled, onDownloadPNG, onDownloadSVG, onExportData }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
      >
        Download
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onDownloadPNG();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Download PNG
            </button>
            
            <button
              onClick={() => {
                onDownloadSVG();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download SVG
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                onExportData();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FishingRouteGenerator = () => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [settings, setSettings] = useState({
    canvasWidth: 800,
    canvasHeight: 600,
    routeLength: 200,
    speedVariation: 0.7,
    smoothness: 0.8,
    numberOfRoutes: 1,
    connected: false
  });

  // Speed to color mapping (blue = slow, red = fast)
  const getSpeedColor = (speed) => {
    // Normalize speed to 0-1 range
    const normalized = Math.max(0, Math.min(1, speed));
    
    if (normalized < 0.25) {
      // Blue to cyan
      const t = normalized * 4;
      return `rgb(${Math.round(0 * (1-t) + 0 * t)}, ${Math.round(100 * (1-t) + 255 * t)}, ${Math.round(255 * (1-t) + 255 * t)})`;
    } else if (normalized < 0.5) {
      // Cyan to green
      const t = (normalized - 0.25) * 4;
      return `rgb(${Math.round(0 * (1-t) + 0 * t)}, ${Math.round(255 * (1-t) + 255 * t)}, ${Math.round(255 * (1-t) + 0 * t)})`;
    } else if (normalized < 0.75) {
      // Green to yellow
      const t = (normalized - 0.5) * 4;
      return `rgb(${Math.round(0 * (1-t) + 255 * t)}, ${Math.round(255)}, ${Math.round(0)})`;
    } else {
      // Yellow to red
      const t = (normalized - 0.75) * 4;
      return `rgb(${Math.round(255)}, ${Math.round(255 * (1-t) + 0 * t)}, ${Math.round(0)})`;
    }
  };

  // Generate a realistic fishing route
  const generateRoute = (startX, startY, width, height) => {
    const points = [];
    const speeds = [];
    let currentX = startX;
    let currentY = startY;
    let currentSpeed = 0.3 + Math.random() * 0.4; // Start with moderate speed
    let direction = Math.random() * Math.PI * 2;
    
    // Store original start position for connected routes
    const originalStartX = startX;
    const originalStartY = startY;
    
    for (let i = 0; i < settings.routeLength; i++) {
      // Add some realistic fishing behavior
      const behavior = Math.random();
      
      if (behavior < 0.1) {
        // Sudden stop (fishing spot)
        currentSpeed = Math.max(0.1, currentSpeed * 0.2);
      } else if (behavior < 0.2) {
        // Speed up (traveling between spots)
        currentSpeed = Math.min(1.0, currentSpeed * 1.5);
      } else {
        // Gradual speed change
        currentSpeed += (Math.random() - 0.5) * settings.speedVariation * 0.1;
        currentSpeed = Math.max(0.1, Math.min(1.0, currentSpeed));
      }
      
      // For connected routes, start steering back to origin in the last 25% of the route
      if (settings.connected && i > settings.routeLength * 0.75) {
        const progress = (i - settings.routeLength * 0.75) / (settings.routeLength * 0.25);
        const distanceToStart = Math.sqrt(
          Math.pow(currentX - originalStartX, 2) + Math.pow(currentY - originalStartY, 2)
        );
        
        // If we're still far from start, steer towards it
        if (distanceToStart > 20) {
          const angleToStart = Math.atan2(originalStartY - currentY, originalStartX - currentX);
          // Gradually blend the direction towards the start point
          direction = direction * (1 - progress * 0.8) + angleToStart * (progress * 0.8);
        }
      }
      
      // Change direction gradually with occasional sharp turns (less sharp for connected routes)
      if (Math.random() < 0.05) {
        // Sharp turn (reduced for connected routes)
        const turnIntensity = settings.connected && i > settings.routeLength * 0.6 ? 0.5 : 1.0;
        direction += (Math.random() - 0.5) * Math.PI * turnIntensity;
      } else {
        // Gradual direction change
        direction += (Math.random() - 0.5) * 0.3;
      }
      
      // Move based on speed and direction
      const stepSize = currentSpeed * 8 + 2;
      currentX += Math.cos(direction) * stepSize;
      currentY += Math.sin(direction) * stepSize;
      
      // Keep within bounds with some buffer
      if (currentX < 50 || currentX > width - 50) {
        direction = Math.PI - direction;
        currentX = Math.max(50, Math.min(width - 50, currentX));
      }
      if (currentY < 50 || currentY > height - 50) {
        direction = -direction;
        currentY = Math.max(50, Math.min(height - 50, currentY));
      }
      
      points.push({ x: currentX, y: currentY });
      speeds.push(currentSpeed);
    }
    
    // For connected routes, add a final segment back to start if needed
    if (settings.connected) {
      const lastPoint = points[points.length - 1];
      const distanceToStart = Math.sqrt(
        Math.pow(lastPoint.x - originalStartX, 2) + Math.pow(lastPoint.y - originalStartY, 2)
      );
      
      // If we're not close enough to the start, add connecting segments
      if (distanceToStart > 15) {
        const steps = Math.ceil(distanceToStart / 10);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const connectX = lastPoint.x * (1 - t) + originalStartX * t;
          const connectY = lastPoint.y * (1 - t) + originalStartY * t;
          
          points.push({ x: connectX, y: connectY });
          speeds.push(0.4); // Moderate speed for return trip
        }
      }
    }
    
    return { points, speeds };
  };

  // Smooth the route for more natural curves
  const smoothRoute = (route) => {
    if (route.points.length < 3) return route;
    
    const smoothed = {
      points: [route.points[0]],
      speeds: [route.speeds[0]]
    };
    
    for (let i = 1; i < route.points.length - 1; i++) {
      const prev = route.points[i - 1];
      const curr = route.points[i];
      const next = route.points[i + 1];
      
      const smoothX = prev.x * (1 - settings.smoothness) + curr.x * settings.smoothness;
      const smoothY = prev.y * (1 - settings.smoothness) + curr.y * settings.smoothness;
      
      smoothed.points.push({ x: smoothX, y: smoothY });
      smoothed.speeds.push(route.speeds[i]);
    }
    
    smoothed.points.push(route.points[route.points.length - 1]);
    smoothed.speeds.push(route.speeds[route.speeds.length - 1]);
    
    return smoothed;
  };

  // Draw the route on canvas
  const drawRoute = (ctx, route) => {
    if (route.points.length < 2) return;
    
    // Calculate line width based on canvas size for high fidelity
    const baseWidth = Math.max(2, Math.round(settings.canvasWidth / 200));
    ctx.lineWidth = baseWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 0; i < route.points.length - 1; i++) {
      const point1 = route.points[i];
      const point2 = route.points[i + 1];
      const speed = route.speeds[i];
      
      ctx.strokeStyle = getSpeedColor(speed);
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      ctx.stroke();
    }
  };

  // Generate and draw routes
  const generateRoutes = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, settings.canvasWidth, settings.canvasHeight);
    
    const newRoutes = [];
    
    for (let i = 0; i < settings.numberOfRoutes; i++) {
      // Random starting position
      const startX = 100 + Math.random() * (settings.canvasWidth - 200);
      const startY = 100 + Math.random() * (settings.canvasHeight - 200);
      
      let route = generateRoute(startX, startY, settings.canvasWidth, settings.canvasHeight);
      route = smoothRoute(route);
      
      drawRoute(ctx, route);
      newRoutes.push(route);
      
      // Small delay to show generation progress
      if (settings.numberOfRoutes > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setRoutes(newRoutes);
    setIsGenerating(false);
  };

  // Download canvas as PNG
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'fishing-route.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  
  // Download as SVG
  const downloadSVG = () => {
    if (routes.length === 0) return;
    
    // Create SVG content
    let svgContent = `<svg width="${settings.canvasWidth}" height="${settings.canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="#f8f9fa"/>`;
    
    // Calculate line width for SVG (same as canvas)
    const baseWidth = Math.max(2, Math.round(settings.canvasWidth / 200));
    
    routes.forEach(route => {
      if (route.points.length < 2) return;
      
      for (let i = 0; i < route.points.length - 1; i++) {
        const point1 = route.points[i];
        const point2 = route.points[i + 1];
        const speed = route.speeds[i];
        const color = getSpeedColor(speed);
        
        svgContent += `<line x1="${point1.x.toFixed(2)}" y1="${point1.y.toFixed(2)}" x2="${point2.x.toFixed(2)}" y2="${point2.y.toFixed(2)}" stroke="${color}" stroke-width="${baseWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    });
    
    svgContent += '</svg>';
    
    // Create and download SVG file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'fishing-route.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Export route data as JSON
  const exportRouteData = () => {
    const data = {
      routes: routes,
      settings: settings,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'fishing-route-data.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = settings.canvasWidth;
    canvas.height = settings.canvasHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, settings.canvasWidth, settings.canvasHeight);
  }, [settings.canvasWidth, settings.canvasHeight]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fishing Route Generator</h1>
        <p className="text-gray-600">Generate realistic fishing routes with speed-based color coding for topographic maps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Canvas Size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={settings.canvasWidth}
                    onChange={(e) => setSettings(prev => ({ ...prev, canvasWidth: parseInt(e.target.value) }))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min="400"
                    max="1200"
                  />
                  <span className="text-xs self-center">×</span>
                  <input
                    type="number"
                    value={settings.canvasHeight}
                    onChange={(e) => setSettings(prev => ({ ...prev, canvasHeight: parseInt(e.target.value) }))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min="300"
                    max="800"
                  />
                </div>
              </div>

              <CustomSlider
                min={50}
                max={500}
                value={settings.routeLength}
                onChange={(e) => setSettings(prev => ({ ...prev, routeLength: parseInt(e.target.value) }))}
                label="Route length"
              />

              <CustomSlider
                min={0.1}
                max={1}
                step={0.1}
                value={settings.speedVariation}
                onChange={(e) => setSettings(prev => ({ ...prev, speedVariation: parseFloat(e.target.value) }))}
                label="Speed Variation"
              />

              <CustomSlider
                min={0.1}
                max={1}
                step={0.1}
                value={settings.smoothness}
                onChange={(e) => setSettings(prev => ({ ...prev, smoothness: parseFloat(e.target.value) }))}
                label="Smoothness"
              />

              <div>
                <label className="block text-sm font-medium mb-1">Number of Routes</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={settings.numberOfRoutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, numberOfRoutes: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={settings.connected}
                    onChange={(e) => setSettings(prev => ({ ...prev, connected: e.target.checked }))}
                    className="rounded"
                  />
                  Connected Route (Loop)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Route returns to starting point
                </p>
              </div>
            </div>
          </div>

         
          {/* Controls */}
          <div className="space-y-2">
          <button
            onClick={generateRoutes}
            disabled={isGenerating}
            className="w-full max-w-[289px] h-[56px] flex items-center justify-center gap-2"
              style={{
                backgroundColor: isGenerating ? 'rgb(156, 163, 175)' : 'rgb(7, 129, 158)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
  }}
  onMouseEnter={(e) => {
    if (!isGenerating) {
      e.target.style.backgroundColor = 'rgb(6, 116, 142)';
    }
  }}
  onMouseLeave={(e) => {
    if (!isGenerating) {
      e.target.style.backgroundColor = 'rgb(7, 129, 158)';
    }
  }}
>
  {isGenerating ? <Square className="text-white w-5 h-5" /> : <Play className="text-white w-5 h-5" />}
  <span style={{ color: 'white', fontSize: '18px', fontWeight: '500', letterSpacing: '-0.4px' }}>
    {isGenerating ? 'Generating...' : 'Generate Route'}
  </span>
</button>

            <button
              onClick={downloadImage}
              disabled={routes.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>

            <button
              onClick={downloadSVG}
              disabled={routes.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>

            <button
              onClick={exportRouteData}
              disabled={routes.length === 0}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto block"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>

           {/* Speed Legend */}
           <div className="p-4 rounded-lg">
              <div className="space-y-1">
              <div className="flex justify-center items-center gap-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#0066ff'}}></div>
                <span className="text-sm">Slowest (Fishing)</span>
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#00ff00'}}></div>
                <span className="text-sm">Moderate</span>
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#ffff00'}}></div>
                <span className="text-sm">Fast</span>
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#ff0000'}}></div>
                <span className="text-sm">Fastest (Travel)</span>
              </div>
              
            </div>
          
          </div>
          
                  </div>
      </div>
    </div>
 
  );
};


export default FishingRouteGenerator;