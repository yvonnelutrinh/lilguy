import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import './Footer.css';

interface FooterProps {
  className?: string;
}
 
/* eslint-disable @typescript-eslint/no-unused-vars */
const contributorsList = [
  { name: 'Ademide Akinsefunmi', url: 'https://github.com/AAdemide' },
  { name: 'Filip Fabiszak', url: 'https://github.com/filipfabiszak' },
  { name: 'Lisa Olsen', url: 'https://github.com/lmolsen' },
  { name: 'Yvonne Lu Trinh', url: 'https://github.com/yvonnelutrinh' }
];

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);
  const [shuffledContributors, setShuffledContributors] = useState(contributorsList);
  const footerRef = useRef<HTMLDivElement>(null);
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setShuffledContributors(() => {
      const arr = [...contributorsList];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }, []); // Only shuffle once on mount

  // Show when user scrolls to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!footerRef.current) return;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // If user is at the bottom (within 10px)
      if (windowHeight + scrollY >= docHeight - 10) {
        setVisible(true);
        setFade(false);
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        fadeTimeout.current = setTimeout(() => {
          setFade(true);
        }, 5000);
      } else {
        setVisible(false);
        setFade(false);
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fade after 5s if not hovered
  useEffect(() => {
    if (visible) {
      setFade(false);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
      fadeTimeout.current = setTimeout(() => {
        setFade(true);
      }, 5000);
    } else {
      setFade(false);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    }
    return () => {
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, [visible]);

  // Show on hover and cancel fade
  const handleMouseEnter = () => {
    setVisible(true); // Always show on hover, regardless of scroll position
    setFade(false);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    // Restart fade timer when hovered again after fade
    fadeTimeout.current = setTimeout(() => {
      setFade(true);
    }, 5000);
  };
  const handleMouseLeave = () => {
    // Only hide if not at bottom
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    if (!(windowHeight + scrollY >= docHeight - 10)) {
      setVisible(false);
    } else {
      // Restart fade timer
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
      fadeTimeout.current = setTimeout(() => {
        setFade(true);
      }, 5000);
    }
  };

  // Ensure mouseenter always brings it back, even if already faded
  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;
    const handleAreaMouseMove = (e: MouseEvent) => {
      // Only if faded
      if (fade) {
        setVisible(true);
        setFade(false);
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        fadeTimeout.current = setTimeout(() => {
          setFade(true);
        }, 5000);
      }
    };
    node.addEventListener('mousemove', handleAreaMouseMove);
    return () => node.removeEventListener('mousemove', handleAreaMouseMove);
  }, [fade]);

  return (
    <div
      className={`pixel-footer ${className}`}
      ref={footerRef}
      style={{
        opacity: visible && !fade ? 1 : 0,
        pointerEvents: visible && !fade ? 'auto' : 'none',
        transition: 'opacity 0.5s',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pixel-footer-content">
        {shuffledContributors.map((contributor, index) => (
          <Link
            key={index}
            href={contributor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-footer-link"
          >
            <div className="pixel-github-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
              </svg>
            </div>
            <span>{contributor.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Footer;
