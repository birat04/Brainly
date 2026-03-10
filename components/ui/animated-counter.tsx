'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const startValue = 0;
    const difference = value - startValue;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const currentValue = Math.floor(startValue + difference * progress);
      setDisplayValue(currentValue);

      if (currentStep === steps) {
        clearInterval(interval);
        hasAnimated.current = true;
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
