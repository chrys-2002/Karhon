import { useState, useCallback } from "react";

export const useTouchFeedback = () => {
  const [isTouched, setIsTouched] = useState(false);
  
  const handleTouchStart = useCallback(() => {
    setIsTouched(true);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    setIsTouched(false);
  }, []);
  
  return {
    isTouched,
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onMouseEnter: () => setIsTouched(true),
      onMouseLeave: () => setIsTouched(false),
    }
  };
};
