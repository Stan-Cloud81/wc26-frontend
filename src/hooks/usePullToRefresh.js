import { useEffect, useState, useRef } from 'react';

function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isAtTop = useRef(false);
  const pullDistanceRef = useRef(0);
  const threshold = 80;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        isAtTop.current = true;
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (!isAtTop.current) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      if (distance > 0) {
        pullDistanceRef.current = distance;
        setPullDistance(distance);
        if (distance > threshold) {
          setIsPulling(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistanceRef.current > threshold) {
        await onRefresh();
      }
      setIsPulling(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
      isAtTop.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold]);

  return { isPulling, pullDistance };
}

export default usePullToRefresh;
