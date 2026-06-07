import { useState, useRef } from 'react';

/**
 * Custom React hook for high-performance 3D perspective mouse tilt effect.
 * @param {number} maxTilt - The maximum angle of rotation in degrees.
 * @returns {object} { containerRef, tiltStyle, tiltHandlers }
 */
export function useParallaxTilt(maxTilt = 10) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
  });

  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to the element's bounding rect
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left - width / 2;
    const y = clientY - rect.top - height / 2;

    // Normalized coordinates (-0.5 to 0.5)
    const normX = x / width;
    const normY = y / height;

    // Calculate rotation angles (rotateX depends on vertical displacement, rotateY on horizontal)
    const rotateX = -(normY * maxTilt).toFixed(2);
    const rotateY = (normX * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return {
    containerRef,
    tiltStyle,
    isHovered,
    tiltHandlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
  };
}
