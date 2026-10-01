import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RouletteItem } from '../types';
import { playTickSound, playWinFanfare, playSpinStartSound } from '../utils/audio';

interface RouletteWheelProps {
  items: RouletteItem[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winningItem: RouletteItem) => void;
  durationSeconds?: number;
  soundEnabled?: boolean;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  items,
  isSpinning,
  onSpinStart,
  onSpinEnd,
  durationSeconds = 4,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastPegIndexRef = useRef<number>(-1);
  const pointerRecoilRef = useRef<number>(0); // Flapper angle deflection in radians
  const [hoverCenter, setHoverCenter] = useState(false);

  // Active items (only enabled items take part in the wheel)
  const activeItems = items.filter(it => it.enabled);
  const totalWeight = activeItems.reduce((acc, item) => acc + (item.weight || 1), 0);

  // Calculate slice angles: { startAngle, endAngle, item }
  const getSlices = useCallback(() => {
    if (activeItems.length === 0 || totalWeight <= 0) return [];
    let current = 0;
    return activeItems.map(item => {
      const fraction = (item.weight || 1) / totalWeight;
      const arc = fraction * 2 * Math.PI;
      const slice = {
        item,
        startAngle: current,
        endAngle: current + arc,
        centerAngle: current + arc / 2,
        arc,
      };
      current += arc;
      return slice;
    });
  }, [activeItems, totalWeight]);

  // Determine which slice is at 12 o'clock (angle -PI/2) for a given wheel rotation
  const getWinnerAtAngle = useCallback((wheelRotation: number) => {
    const slices = getSlices();
    if (slices.length === 0) return null;

    // Pointer is at -Math.PI / 2 (top)
    // Wheel rotated by wheelRotation.
    // Local angle alpha = (-PI/2 - wheelRotation) mod 2PI
    let localAngle = ((-Math.PI / 2 - wheelRotation) % (2 * Math.PI));
    if (localAngle < 0) localAngle += 2 * Math.PI;

    for (const slice of slices) {
      if (localAngle >= slice.startAngle && localAngle < slice.endAngle) {
        return slice.item;
      }
    }
    return slices[slices.length - 1].item;
  }, [getSlices]);

  // Draw the wheel onto the canvas
  const drawWheel = useCallback((rotation: number, flapperAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.width / dpr;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.44;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const slices = getSlices();

    // 1. Draw outer shadow & casing ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 18, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.fill();
    ctx.restore();

    // Outer metallic bezel ring
    const bezelGrad = ctx.createRadialGradient(cx, cy, radius + 6, cx, cy, radius + 18);
    bezelGrad.addColorStop(0, '#f59e0b');
    bezelGrad.addColorStop(0.3, '#d97706');
    bezelGrad.addColorStop(0.7, '#78350f');
    bezelGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 16, 0, Math.PI * 2);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.fillStyle = bezelGrad;
    ctx.fill();

    // Decorative casino LED lights around bezel
    const numLeds = 24;
    for (let i = 0; i < numLeds; i++) {
      const ledAngle = (i / numLeds) * Math.PI * 2 + rotation * 0.1;
      const lx = cx + Math.cos(ledAngle) * (radius + 8);
      const ly = cy + Math.sin(ledAngle) * (radius + 8);
      const isAlt = (i + Math.floor(rotation * 3)) % 2 === 0;

      ctx.beginPath();
      ctx.arc(lx, ly, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = isAlt ? '#fef08a' : '#fed7aa';
      ctx.shadowColor = isAlt ? '#fef08a' : '#f97316';
      ctx.shadowBlur = isAlt ? 8 : 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 2. Draw Wheel slices
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    if (slices.length === 0) {
      // Empty state circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('항목을 1개 이상 추가해주세요', 0, 0);
    } else {
      slices.forEach((slice, idx) => {
        const { startAngle, endAngle, centerAngle, item } = slice;

        // Slice wedge
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Slice color with subtle radial gradient for depth
        const sliceGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
        sliceGrad.addColorStop(0, slice.item.color);
        sliceGrad.addColorStop(1, adjustColorLuminance(slice.item.color, -0.15));

        ctx.fillStyle = sliceGrad;
        ctx.fill();

        // Wedge border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Slice text & emoji label
        ctx.save();
        ctx.rotate(centerAngle);

        // Position text along the slice radius
        const textDistance = radius * 0.65;
        ctx.translate(textDistance, 0);

        // Adjust text orientation so it reads cleanly from outer to inner
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Check background brightness for optimal contrast
        const isBright = isColorBright(item.color);
        const textColor = isBright ? '#0f172a' : '#ffffff';
        const shadowColor = isBright ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)';

        // Responsive font size based on slice count and slice angle
        const sliceDegree = (slice.arc * 180) / Math.PI;
        let fontSize = Math.min(16, Math.max(11, Math.floor(sliceDegree * 0.5)));
        if (slices.length <= 4) fontSize = 18;
        if (slices.length > 10) fontSize = 12;

        ctx.font = `bold ${fontSize}px Pretendard, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = textColor;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 4;

        // Truncate long text
        const maxLen = slices.length > 8 ? 6 : 9;
        const displayLabel = item.label.length > maxLen ? item.label.slice(0, maxLen) + '..' : item.label;

        // Render emoji above or beside text
        if (item.emoji) {
          ctx.font = `${fontSize * 1.15}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
          ctx.fillText(item.emoji, 0, -fontSize * 0.7);
          ctx.font = `bold ${fontSize}px Pretendard, sans-serif`;
          ctx.fillText(displayLabel, 0, fontSize * 0.65);
        } else {
          ctx.fillText(displayLabel, 0, 0);
        }

        ctx.restore();

        // Outer slice divider peg (metallic silver/gold pin)
        const pegX = Math.cos(endAngle) * (radius - 2);
        const pegY = Math.sin(endAngle) * (radius - 2);

        ctx.beginPath();
        ctx.arc(pegX, pegY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore(); // restore wheel rotation

    // 3. Center Hub / Spin Button
    const hubRadius = radius * 0.28;

    // Hub outer shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

    // Hub gradient ring
    const hubRingGrad = ctx.createLinearGradient(cx - hubRadius, cy - hubRadius, cx + hubRadius, cy + hubRadius);
    hubRingGrad.addColorStop(0, '#fef08a');
    hubRingGrad.addColorStop(0.5, '#d97706');
    hubRingGrad.addColorStop(1, '#78350f');

    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubRingGrad;
    ctx.fill();

    // Inner button surface
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius - 4, 0, Math.PI * 2);
    const innerHubGrad = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy, hubRadius - 4);
    if (isSpinning) {
      innerHubGrad.addColorStop(0, '#475569');
      innerHubGrad.addColorStop(1, '#0f172a');
    } else if (hoverCenter) {
      innerHubGrad.addColorStop(0, '#f59e0b');
      innerHubGrad.addColorStop(1, '#b45309');
    } else {
      innerHubGrad.addColorStop(0, '#1e293b');
      innerHubGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = innerHubGrad;
    ctx.fill();

    // Center button text / icon
    ctx.fillStyle = isSpinning ? '#94a3b8' : (hoverCenter ? '#ffffff' : '#fcd34d');
    ctx.font = 'bold 15px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(isSpinning ? '돌아가는 중' : 'START', cx, cy - 1);
    ctx.font = '10px Pretendard, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(isSpinning ? '두근두근...' : '클릭!', cx, cy + 14);
    ctx.shadowBlur = 0;

    // 4. Pointer / Flapper Indicator at 12 o'clock (pointed downwards)
    ctx.save();
    ctx.translate(cx, cy - radius - 6);
    ctx.rotate(flapperAngle); // Dynamic recoil animation

    // Pointer shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Pointer body (golden arrow needle with red tip)
    ctx.beginPath();
    ctx.moveTo(0, 32); // bottom tip touching the wheel
    ctx.lineTo(-12, -8);
    ctx.lineTo(12, -8);
    ctx.closePath();

    const ptrGrad = ctx.createLinearGradient(-12, -8, 12, 32);
    ptrGrad.addColorStop(0, '#ef4444');
    ptrGrad.addColorStop(0.6, '#dc2626');
    ptrGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = ptrGrad;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer pivot pin
    ctx.beginPath();
    ctx.arc(0, -6, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }, [getSlices, activeItems.length, hoverCenter, isSpinning]);

  // Initial draw and resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 440;
      const size = Math.min(480, Math.max(300, containerWidth - 24));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      drawWheel(currentAngleRef.current, pointerRecoilRef.current);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [drawWheel]);

  // Redraw when items or state changes
  useEffect(() => {
    if (!isSpinning) {
      drawWheel(currentAngleRef.current, pointerRecoilRef.current);
    }
  }, [items, isSpinning, drawWheel]);

  // Spin physics engine
  useEffect(() => {
    if (!isSpinning || activeItems.length === 0) return;

    playSpinStartSound(soundEnabled);

    const slices = getSlices();
    const duration = durationSeconds * 1000;
    const startTime = performance.now();
    const startAngle = currentAngleRef.current;

    // Minimum 5 to 8 full rotations plus random landing offset
    const randomExtraTurns = 6 + Math.random() * 4;
    const randomTargetOffset = Math.random() * Math.PI * 2;
    const totalRotation = randomExtraTurns * 2 * Math.PI + randomTargetOffset;
    const endAngle = startAngle + totalRotation;

    let previousAngle = startAngle;
    lastPegIndexRef.current = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic / Quintic ease-out curve for dramatic slow-down
      // 1 - pow(1 - progress, 4)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startAngle + totalRotation * easeOut;
      currentAngleRef.current = currentAngle;

      // Peg detection for tick sound & flapper deflection
      // Slices partition [0, 2PI)
      const totalSlices = slices.length;
      if (totalSlices > 0) {
        // Compute which slice boundary passed the top (-PI/2)
        const normalizedPos = (-Math.PI / 2 - currentAngle) / (2 * Math.PI);
        const currentPegTotal = Math.floor(normalizedPos * totalSlices);

        if (currentPegTotal !== lastPegIndexRef.current) {
          lastPegIndexRef.current = currentPegTotal;
          // Calculate spin velocity for sound pitch & flapper recoil
          const speed = (currentAngle - previousAngle);
          const pitch = Math.max(0.7, Math.min(1.4, speed * 20));
          playTickSound(soundEnabled, pitch);
          // Recoil flapper towards positive angle
          pointerRecoilRef.current = 0.32;
        }
      }

      // Smooth flapper recoil decay back to 0
      pointerRecoilRef.current *= 0.82;
      if (Math.abs(pointerRecoilRef.current) < 0.005) {
        pointerRecoilRef.current = 0;
      }

      previousAngle = currentAngle;
      drawWheel(currentAngle, pointerRecoilRef.current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        pointerRecoilRef.current = 0;
        drawWheel(endAngle, 0);

        const winner = getWinnerAtAngle(endAngle);
        playWinFanfare(soundEnabled);
        if (winner) {
          onSpinEnd(winner);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpinning, durationSeconds, activeItems.length, getSlices, getWinnerAtAngle, onSpinEnd, drawWheel, soundEnabled]);

  // Click on canvas center hub triggers spin
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning || activeItems.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const dist = Math.hypot(x - cx, y - cy);
    const radius = (rect.width * 0.44) * 0.35;

    // If clicked inside center hub or anywhere on the wheel
    if (dist <= radius || dist <= rect.width * 0.44) {
      onSpinStart();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning) {
      setHoverCenter(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dist = Math.hypot(x - cx, y - cy);
    const radius = (rect.width * 0.44) * 0.35;
    setHoverCenter(dist <= radius);
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="relative group cursor-pointer" onMouseLeave={() => setHoverCenter(false)}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          className="transition-transform duration-200 active:scale-[0.99] touch-none"
          title="룰렛을 클릭하여 회전시키세요"
        />
      </div>
    </div>
  );
};

// Helper: Adjust color brightness
function adjustColorLuminance(hex: string, lum: number): string {
  let cleanHex = hex.replace(/[^0-9a-f]/gi, '');
  if (cleanHex.length < 6) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  let rgb = '#';
  for (let i = 0; i < 3; i++) {
    const c = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    const adjusted = Math.round(Math.min(Math.max(0, c + c * lum), 255));
    const str = adjusted.toString(16);
    rgb += ('00' + str).substring(str.length);
  }
  return rgb;
}

// Helper: Check luminance to decide black or white text
function isColorBright(hex: string): boolean {
  let cleanHex = hex.replace(/[^0-9a-f]/gi, '');
  if (cleanHex.length < 6) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // ITU-R BT.709 perceived luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 165;
}
