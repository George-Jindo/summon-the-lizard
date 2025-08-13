import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './LizardButton.css';
import { motion, AnimatePresence } from 'framer-motion';

const LOCAL_STORAGE_KEY = 'lizard_local_clicks';
const soundPaths = ['/sounds/lizard1.mp3'];
const goldenSoundPath = '/sounds/golden_lizard.mp3'; // make sure this exists

// tiny inline SVG lizard, gold gradient + glow-ready
function GoldenLizardSVG({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="golden-lizard-svg"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE066"/>
          <stop offset="50%" stopColor="#FFC107"/>
          <stop offset="100%" stopColor="#FF8F00"/>
        </linearGradient>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M29 10c3-2 7-2 8 1 1 2 0 4-2 6l3 3c2-1 4 0 5 2 1 2 0 4-1 5l5 5c2-1 4-1 5 1 1 2 0 4-2 6l-4 3c-2 2-5 2-7 0l-2-2-2 2c-2 2-5 2-7 0l-4-4c-2-2-2-5 0-7l2-2-3-3c-2 2-4 3-6 2-2-1-3-4-1-6l4-4c2-2 5-2 7 0l2 2 2-2c-2-2-2-5 0-6Z"
        fill="url(#goldGrad)"
        filter="url(#goldGlow)"
      />
      <circle cx="36" cy="14" r="2" fill="#FFF8E1" />
    </svg>
  );
}

function LizardButton() {
  const [localClicks, setLocalClicks] = useState(0);
  const [globalClicks, setGlobalClicks] = useState(0);
  const [milestoneMessage, setMilestoneMessage] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // NEW: flash state for golden event
  const [goldenFlash, setGoldenFlash] = useState(false);

  // explosions now support two particle types:
  // { id, kind: 'emoji' | 'gold', emoji?: string, x, y }
  const [emojiExplosions, setEmojiExplosions] = useState([]);

  useEffect(() => {
    document.body.style.userSelect = 'none';
    fetchGlobalClicks();

    const storedClicks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedClicks) {
      const count = parseInt(storedClicks, 10);
      setLocalClicks(count);
      setMilestoneMessage(getMilestoneMessage(count));
    }
    return () => {
      document.body.style.userSelect = '';
    };
  }, []);

  const fetchGlobalClicks = async () => {
    const { data, error } = await supabase
      .from('global_clicks')
      .select('count')
      .single();

    if (error) {
      console.error('Error fetching global clicks:', error);
    } else {
      setGlobalClicks(data.count);
    }
  };

  const getMilestoneMessage = (clicks) => {
    if (clicks >= 1000) return 'You have become the Lizard.';
    if (clicks >= 500) return 'You are now Lizard Royalty. 👑';
    if (clicks >= 250) return 'Are your fingers okay?';
    if (clicks >= 100) return 'Seek help.';
    if (clicks >= 50) return "Okay chill. It's just a lizard.";
    if (clicks >= 10) return "You're getting warmed up...";
    return '';
  };

  const handleClick = async () => {
    // 1% golden event
    const isGoldenEvent = Math.random() < 0.01;

    // toggle the flash right away if rare
    if (isGoldenEvent) {
      setGoldenFlash(true);
      setTimeout(() => setGoldenFlash(false), 450);
    }

    setLocalClicks(prev => {
      const newCount = prev + 1;
      localStorage.setItem(LOCAL_STORAGE_KEY, newCount);

      const message = getMilestoneMessage(newCount);
      if (message !== milestoneMessage) {
        setMilestoneMessage(message);
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 2500);
      }

      setShakeIntensity(Math.min(newCount * 0.2, 20));
      if (isGoldenEvent) {
        triggerGoldenLizardExplosion();
      } else {
        triggerEmojiExplosion();
      }
      return newCount;
    });

    // play sound
    const sound = new Audio(isGoldenEvent ? goldenSoundPath : soundPaths[0]);
    sound.play().catch(err => console.error('Audio playback failed:', err));

    // increment global
    const { data, error } = await supabase.rpc('increment_clicks');
    if (error) {
      console.error('Error incrementing global clicks:', error);
    } else {
      setGlobalClicks(data);
    }
  };

  const triggerEmojiExplosion = () => {
    const count = 5;
    const explosion = Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 200 + Math.random() * 200; // 200–400px
      return {
        id: Date.now() + i,
        kind: 'emoji',
        emoji: '🦎',
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    });

    setEmojiExplosions(prev => [...prev, ...explosion]);
    setTimeout(() => {
      setEmojiExplosions(prev => prev.slice(count));
    }, 1000);
  };

  const triggerGoldenLizardExplosion = () => {
    const count = 9;
    const explosion = Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 250 + Math.random() * 250; // 250–500px
      return {
        id: Date.now() + i,
        kind: 'gold',
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    });

    setEmojiExplosions(prev => [...prev, ...explosion]);
    setTimeout(() => {
      setEmojiExplosions(prev => prev.slice(count));
    }, 1500);
  };

  return (
    <motion.div
      animate={{ x: [0, -1, 1, -1, 1, 0], y: [0, 1, -1, 1, -1, 0] }}
      transition={{ duration: 0.3, repeat: shakeIntensity, repeatType: 'loop' }}
      className="lizard-container"
    >
      <div className="button-explosion-wrapper">
        <div className="circle-button-container">
          <svg
            className="circle-text-rotating"
            viewBox="0 0 200 200"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <path
                id="circlePath"
                d="M100,100 m-90,0 a90,90 0 1,1 180,0 a90,90 0 1,1 -180,0"
              />
            </defs>
            <text fill="white" fontSize="14" fontWeight="bold" letterSpacing="2">
              <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                SUMMON THE LIZARD
              </textPath>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="8s"
                repeatCount="indefinite"
              />
            </text>
          </svg>

          <div
            className={`circle-button-wrapper ${goldenFlash ? 'golden-flash' : ''}`}
            onClick={handleClick}
          >
            <div className="lizard-emoji">🦎</div>
          </div>
        </div>

        <p className="click-count">Your clicks: {localClicks}</p>
        <p className="click-count">Global Lizard Summons: {globalClicks}</p>

        <div className="milestone-wrapper">
          <AnimatePresence>
            {showMilestone && (
              <motion.p
                className="milestone-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'fixed',
                  top: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000
                }}
              >
                {milestoneMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {emojiExplosions.map(({ id, kind, emoji, x, y }) => (
          <motion.span
            key={id}
            className={`explosion-particle ${kind === 'gold' ? 'gold' : ''}`}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x, y, opacity: 0, scale: kind === 'gold' ? 2.2 : 2, rotate: 360 }}
            transition={{ duration: kind === 'gold' ? 1.4 : 1 }}
            style={{ position: 'absolute', pointerEvents: 'none' }}
          >
            {kind === 'gold' ? <GoldenLizardSVG size={32} /> : <span style={{ fontSize: '2rem' }}>{emoji}</span>}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default LizardButton;
