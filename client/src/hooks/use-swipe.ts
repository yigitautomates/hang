import { useState, useRef } from 'react';

interface UseSwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeProps) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    setStartX(clientX);
    setStartY(clientY);
    setCurrentX(0);
    setCurrentY(0);
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || startX === null || startY === null) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    setCurrentX(deltaX);
    setCurrentY(deltaY);

    if (elementRef.current) {
      const rotation = deltaX * 0.1;
      elementRef.current.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;
      elementRef.current.style.opacity = `${1 - Math.abs(deltaX) / 300}`;
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;

    if (Math.abs(currentX) > threshold) {
      if (currentX > 0) {
        // Swipe right
        if (elementRef.current) {
          elementRef.current.style.transform = `translateX(100vw) rotate(30deg)`;
          elementRef.current.style.opacity = '0';
        }
        setTimeout(() => onSwipeRight?.(), 300);
      } else {
        // Swipe left
        if (elementRef.current) {
          elementRef.current.style.transform = `translateX(-100vw) rotate(-30deg)`;
          elementRef.current.style.opacity = '0';
        }
        setTimeout(() => onSwipeLeft?.(), 300);
      }
    } else {
      // Snap back
      if (elementRef.current) {
        elementRef.current.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
        elementRef.current.style.opacity = '1';
      }
    }

    setIsDragging(false);
    setStartX(null);
    setStartY(null);
    setCurrentX(0);
    setCurrentY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return {
    elementRef,
    isDragging,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
