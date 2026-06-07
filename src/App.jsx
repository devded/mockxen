import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  Laptop, 
  Globe, 
  Smartphone, 
  Upload, 
  Download, 
  Sparkles, 
  Maximize2, 
  Sun, 
  Moon, 
  Dices,
  Info
} from 'lucide-react';
import { useParallaxTilt } from './hooks/useParallaxTilt';
import { BACKGROUND_PRESETS, getAverageColor } from './utils';
import './App.css';

function App() {
  // Mockup configurations state
  const [image, setImage] = useState('/default_dashboard.png');
  const [deviceType, setDeviceType] = useState('macbook'); // 'macbook' | 'browser' | 'phone'
  const [deviceTheme, setDeviceTheme] = useState('dark'); // 'dark' | 'light' (for browser/phone)
  const [macbookColor, setMacbookColor] = useState('spacegray'); // 'spacegray' | 'silver'
  const [imageFit, setImageFit] = useState('cover'); // 'cover' | 'contain' | 'fill'
  
  // Canvas configuration state
  const [backgroundType, setBackgroundType] = useState('preset'); // 'preset' | 'custom'
  const [selectedPreset, setSelectedPreset] = useState('sunset');
  const [customBgColor, setCustomBgColor] = useState('#6366f1');
  const [customBgGradient, setCustomBgGradient] = useState('linear-gradient(135deg, #6366f1 0%, #a855f7 100%)');
  
  // Customization sliders state
  const [canvasPadding, setCanvasPadding] = useState(60);
  const [canvasWidth, setCanvasWidth] = useState(850);
  const [shadowIntensity, setShadowIntensity] = useState(0.45);
  
  // Advanced features state
  const [enableReflection, setEnableReflection] = useState(true);
  const [enableTilt, setEnableTilt] = useState(true);
  const [enableAmbientGlow, setEnableAmbientGlow] = useState(true);
  const [ambientColor, setAmbientColor] = useState('rgba(99, 102, 241, 0.35)');
  
  // Browser bar state
  const [browserUrl, setBrowserUrl] = useState('aetherflow-analytics.io');
  
  // System states
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  const fileInputRef = useRef(null);
  const exportRef = useRef(null);

  // Parallax mouse tilt effect
  const { containerRef, tiltStyle, tiltHandlers } = useParallaxTilt(10);

  // Extract average color from uploaded screenshot for ambient glow shadow
  useEffect(() => {
    if (image && enableAmbientGlow) {
      getAverageColor(image).then((color) => {
        setAmbientColor(color);
      });
    }
  }, [image, enableAmbientGlow]);

  const showCopiedNotification = () => {
    setCopiedShortcut(true);
    setTimeout(() => setCopiedShortcut(false), 2000);
  };

  // Listen for Clipboard Paste Event (Ctrl+V) anywhere on the page
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
            showCopiedNotification();
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Drag and Drop input listeners
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setImage(url);
      }
    }
  };

  // Handle uploading files via standard browser picker
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  // Export full preview canvas to PNG
  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    
    try {
      // Small delay to allow react state changes to finish rendering (e.g. any overlay)
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2, // Double ratio for retina display quality export
        style: {
          transform: 'none', // Remove tilt perspective rotation during snapshot capturing
        },
      });

      const link = document.createElement('a');
      link.download = `mockxen-${deviceType}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export mockup image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Preset randomizer for background selection
  const handleRandomizeBackground = () => {
    const presetsExcludingSelected = BACKGROUND_PRESETS.filter(p => p.id !== selectedPreset);
    const randomPreset = presetsExcludingSelected[Math.floor(Math.random() * presetsExcludingSelected.length)];
    setBackgroundType('preset');
    setSelectedPreset(randomPreset.id);
  };

  // Compile active canvas background style
  const getCanvasBackgroundStyle = () => {
    if (backgroundType === 'preset') {
      const preset = BACKGROUND_PRESETS.find(p => p.id === selectedPreset);
      return preset ? preset.style : { background: '#1e293b' };
    }
    return { background: customBgGradient };
  };

  return (
    <div className="app-container" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      
      {/* HEADER NAVBAR */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Sparkles size={18} />
          </div>
          <span className="logo-text">MockXen</span>
        </div>

        <div className="header-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload custom image"
          >
            <Upload size={16} />
            <span>Upload Screenshot</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          <button 
            type="button" 
            className={`btn btn-primary ${isExporting ? 'exporting' : ''}`} 
            onClick={handleExport}
            disabled={isExporting}
            aria-label="Export mockup to PNG"
          >
            <Download size={16} />
            <span>{isExporting ? 'Exporting…' : 'Export PNG'}</span>
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <div className="app-workspace">
        
        {/* LEFT CONTROL PANEL (SIDEBAR) */}
        <aside className="app-sidebar">
          
          {/* Section 1: Device Selection */}
          <div className="control-group">
            <label className="control-label">
              <span>Device Frame</span>
            </label>
            <div className="toggle-tabs">
              <button 
                className={`tab-btn ${deviceType === 'macbook' ? 'active' : ''}`}
                onClick={() => setDeviceType('macbook')}
              >
                <Laptop size={18} />
                <span>MacBook</span>
              </button>
              <button 
                className={`tab-btn ${deviceType === 'browser' ? 'active' : ''}`}
                onClick={() => setDeviceType('browser')}
              >
                <Globe size={18} />
                <span>Browser</span>
              </button>
              <button 
                className={`tab-btn ${deviceType === 'phone' ? 'active' : ''}`}
                onClick={() => setDeviceType('phone')}
              >
                <Smartphone size={18} />
                <span>iPhone</span>
              </button>
            </div>
          </div>

          {/* Section 2: Device Specific Options */}
          {deviceType === 'macbook' && (
            <div className="control-group">
              <label className="control-label">MacBook Color</label>
              <div className="toggle-tabs">
                <button 
                  className={`tab-btn ${macbookColor === 'spacegray' ? 'active' : ''}`}
                  onClick={() => setMacbookColor('spacegray')}
                >
                  Space Gray
                </button>
                <button 
                  className={`tab-btn ${macbookColor === 'silver' ? 'active' : ''}`}
                  onClick={() => setMacbookColor('silver')}
                >
                  Silver
                </button>
              </div>
            </div>
          )}

          {deviceType === 'browser' && (
            <>
              <div className="control-group">
                <label className="control-label">Browser Theme</label>
                <div className="toggle-tabs">
                  <button 
                    className={`tab-btn ${deviceTheme === 'dark' ? 'active' : ''}`}
                    onClick={() => setDeviceTheme('dark')}
                  >
                    <Moon size={14} />
                    <span>Dark</span>
                  </button>
                  <button 
                    className={`tab-btn ${deviceTheme === 'light' ? 'active' : ''}`}
                    onClick={() => setDeviceTheme('light')}
                  >
                    <Sun size={14} />
                    <span>Light</span>
                  </button>
                </div>
              </div>
              <div className="control-group">
                <label className="control-label">Browser URL</label>
                <input 
                  type="text" 
                  className="color-text-input" 
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  placeholder="App URL..." 
                  spellCheck={false}
                />
              </div>
            </>
          )}

          {deviceType === 'phone' && (
            <div className="control-group">
              <label className="control-label">Phone Model</label>
              <div className="toggle-tabs" style={{ gridTemplateColumns: '1fr' }}>
                <button className="tab-btn active">iPhone 16 Pro</button>
              </div>
            </div>
          )}

          {/* Section 3: Canvas Customization */}
          <div className="control-group">
            <label className="control-label">
              <span>Background</span>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleRandomizeBackground}
                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                title="Randomize Background Preset"
              >
                <Dices size={12} />
              </button>
            </label>
            <div className="background-grid">
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`bg-preset-box ${backgroundType === 'preset' && selectedPreset === preset.id ? 'active' : ''}`}
                  style={preset.style}
                  onClick={() => {
                    setBackgroundType('preset');
                    setSelectedPreset(preset.id);
                  }}
                  title={preset.name}
                  aria-label={`Select ${preset.name} background`}
                />
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">
              <span>Custom Color</span>
            </label>
            <div className="color-inputs">
              <div className="color-input-wrapper">
                <input 
                  type="color" 
                  className="color-input-native"
                  value={customBgColor}
                  onChange={(e) => {
                    setBackgroundType('custom');
                    setCustomBgColor(e.target.value);
                    setCustomBgGradient(e.target.value);
                  }}
                />
              </div>
              <input 
                type="text" 
                className="color-text-input"
                value={customBgColor}
                onChange={(e) => {
                  setBackgroundType('custom');
                  setCustomBgColor(e.target.value);
                  setCustomBgGradient(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Sliders */}
          <div className="control-group">
            <div className="control-label">
              <span>Canvas Padding</span>
              <span className="control-value">{canvasPadding}px</span>
            </div>
            <input 
              type="range" 
              className="slider-control" 
              min="20" 
              max="120" 
              value={canvasPadding}
              onChange={(e) => setCanvasPadding(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <div className="control-label">
              <span>Canvas Width</span>
              <span className="control-value">{canvasWidth}px</span>
            </div>
            <input 
              type="range" 
              className="slider-control" 
              min="500" 
              max="1100" 
              value={canvasWidth}
              onChange={(e) => setCanvasWidth(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <div className="control-label">
              <span>Shadow Intensity</span>
              <span className="control-value">{Math.round(shadowIntensity * 100)}%</span>
            </div>
            <input 
              type="range" 
              className="slider-control" 
              min="0" 
              max="1" 
              step="0.05" 
              value={shadowIntensity}
              onChange={(e) => setShadowIntensity(Number(e.target.value))}
            />
          </div>

          {/* Fit Controls */}
          <div className="control-group">
            <label className="control-label">Screenshot Fit</label>
            <div className="toggle-tabs">
              <button 
                className={`tab-btn ${imageFit === 'cover' ? 'active' : ''}`}
                onClick={() => setImageFit('cover')}
              >
                Cover
              </button>
              <button 
                className={`tab-btn ${imageFit === 'contain' ? 'active' : ''}`}
                onClick={() => setImageFit('contain')}
              >
                Contain
              </button>
              <button 
                className={`tab-btn ${imageFit === 'fill' ? 'active' : ''}`}
                onClick={() => setImageFit('fill')}
              >
                Stretch
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="control-group" style={{ gap: '14px', marginTop: '6px' }}>
            <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Ambient Glow Shadow</span>
              <input 
                type="checkbox" 
                checked={enableAmbientGlow} 
                onChange={(e) => setEnableAmbientGlow(e.target.checked)} 
              />
            </label>
            
            <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Interactive 3D Tilt</span>
              <input 
                type="checkbox" 
                checked={enableTilt} 
                onChange={(e) => setEnableTilt(e.target.checked)} 
              />
            </label>

            <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Glass Reflection</span>
              <input 
                type="checkbox" 
                checked={enableReflection} 
                onChange={(e) => setEnableReflection(e.target.checked)} 
              />
            </label>
          </div>

          {/* Screenshot size recommendation box */}
          <div className="size-hint-box">
            <div className="size-hint-title">
              <Maximize2 size={12} />
              Ideal Screenshot Size
            </div>
            {deviceType === 'macbook' && (
              <>
                <div className="size-hint-row">
                  <span className="size-hint-label">Best size</span>
                  <span className="size-hint-badge">1280 × 800 px</span>
                </div>
                <div className="size-hint-row">
                  <span className="size-hint-label">Also good</span>
                  <span className="size-hint-badge">1440 × 900 px</span>
                </div>
                <p className="size-hint-note">Use 16:10 ratio. Avoid screenshots wider than 1920px or very tall ones — they'll be cropped at the bottom.</p>
              </>
            )}
            {deviceType === 'browser' && (
              <>
                <div className="size-hint-row">
                  <span className="size-hint-label">Best size</span>
                  <span className="size-hint-badge">1440 × 900 px</span>
                </div>
                <div className="size-hint-row">
                  <span className="size-hint-label">Also good</span>
                  <span className="size-hint-badge">1280 × 800 px</span>
                </div>
                <p className="size-hint-note">Use 16:10 or 16:9 ratio. Screenshots taller than the frame will be cropped — capture only the visible viewport.</p>
              </>
            )}
            {deviceType === 'phone' && (
              <>
                <div className="size-hint-row">
                  <span className="size-hint-label">Best size</span>
                  <span className="size-hint-badge">390 × 844 px</span>
                </div>
                <div className="size-hint-row">
                  <span className="size-hint-label">Also good</span>
                  <span className="size-hint-badge">430 × 932 px</span>
                </div>
                <p className="size-hint-note">Use portrait 9:19.5 ratio. If your screenshot has a status bar, enable "Contain" fit to keep it fully visible.</p>
              </>
            )}
          </div>

          {/* Quick tips */}
          <div className="shortcut-tips">
            <Info size={14} />
            <span>Tip: Paste screenshot with <b>Ctrl + V</b></span>
            {copiedShortcut && <span style={{ color: '#10b981', marginLeft: 'auto', fontWeight: 'bold' }}>Pasted!</span>}
          </div>

        </aside>

        {/* MAIN CANVAS PREVIEW SPACE */}
        <main className="app-preview-area">
          
          {/* Main card box that will be screenshotted by html-to-image */}
          <div 
            ref={exportRef}
            className="canvas-wrapper"
            style={{ 
              ...getCanvasBackgroundStyle(),
              padding: `${canvasPadding}px`,
              width: `${canvasWidth}px`,
            }}
          >
            {/* Parallax structure container */}
            <div 
              className="canvas-container"
              ref={enableTilt ? containerRef : null}
              style={enableTilt ? tiltStyle : {}}
              {...(enableTilt ? tiltHandlers : {})}
            >
              
              {/* Dynamic ambient color glow — blur only, no box-shadow so dark screenshots don't create a dark halo */}
              {enableAmbientGlow && (
                <div 
                  className="ambient-glow active" 
                  style={{ '--ambient-color': ambientColor }} 
                />
              )}

              {/* ACTIVE MOCKUP FRAME */}
              
              {/* 1. MacBook Pro Frame — Realistic Shape */}
              {deviceType === 'macbook' && (
                <div className={`device-macbook ${macbookColor}`}>
                  {/* Screen lid */}
                  <div className="macbook-lid">
                    <div className="macbook-camera-dot"></div>
                    <div className="macbook-display">
                      {enableReflection && <div className="reflection-effect"></div>}
                      {image ? (
                        <img
                          src={image}
                          className={`screenshot-display fit-${imageFit}`}
                          alt="MacBook Screenshot Preview"
                          width="680"
                          height="425"
                        />
                      ) : (
                        <div className="empty-placeholder">
                          <Upload className="empty-placeholder-icon" />
                          <p>Drag / Paste your app screenshot</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Hinge bar */}
                  <div className="macbook-hinge"></div>
                  {/* Keyboard base */}
                  <div
                    className="macbook-base"
                    style={{ boxShadow: `0 ${10 * shadowIntensity}px ${28 * shadowIntensity}px rgba(0,0,0,${0.55 * shadowIntensity})` }}
                  ></div>
                </div>
              )}

              {/* 2. macOS Browser Window Frame */}
              {deviceType === 'browser' && (
                <div 
                  className={`device-browser ${deviceTheme === 'light' ? 'light-theme' : ''}`}
                  style={{ 
                    boxShadow: `0 ${25 * shadowIntensity}px ${60 * shadowIntensity}px rgba(0,0,0,${0.6 * shadowIntensity})` 
                  }}
                >
                  <div className="browser-header">
                    <div className="browser-dots">
                      <div className="dot dot-red" />
                      <div className="dot dot-yellow" />
                      <div className="dot dot-green" />
                    </div>
                    
                    <div className="browser-address-bar">
                      <input 
                        type="text" 
                        className="browser-address-input" 
                        value={browserUrl} 
                        onChange={(e) => setBrowserUrl(e.target.value)}
                        spellCheck={false}
                        aria-label="Browser Address Bar URL"
                      />
                    </div>
                  </div>
                  <div className="browser-content">
                    {enableReflection && <div className="reflection-effect"></div>}
                    {image ? (
                      <img 
                        src={image} 
                        className={`screenshot-display fit-${imageFit}`} 
                        alt="Browser App Screenshot Preview" 
                      />
                    ) : (
                      <div className="empty-placeholder">
                        <Upload className="empty-placeholder-icon" />
                        <p>Drag / Paste your app screenshot</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. iPhone Silhouette Frame */}
              {deviceType === 'phone' && (
                <div 
                  className="device-phone"
                  style={{ 
                    boxShadow: `0 ${20 * shadowIntensity}px ${50 * shadowIntensity}px rgba(0,0,0,${0.7 * shadowIntensity})` 
                  }}
                >
                  <div className="phone-island"></div>
                  <div className="phone-content">
                    {enableReflection && <div className="reflection-effect"></div>}
                    {image ? (
                      <img 
                        src={image} 
                        className={`screenshot-display fit-${imageFit}`} 
                        alt="iPhone Application Screenshot Preview" 
                      />
                    ) : (
                      <div className="empty-placeholder">
                        <Upload className="empty-placeholder-icon" />
                        <p>Drag / Paste your app screenshot</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Display width and height label helper */}
            {!isExporting && (
              <div className="canvas-resize-badge">
                {canvasWidth} × {Math.round(canvasWidth * 0.7)} px
              </div>
            )}

          </div>

        </main>
      </div>

      {/* Screen drag drop overlay feedback indicator */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          backdropFilter: 'blur(4px)',
          border: '4px dashed #6366f1',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: '#0a0b10',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px 48px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Upload size={36} color="#6366f1" />
            <h2 style={{ fontSize: '18px' }}>Drop image to upload screenshot</h2>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
