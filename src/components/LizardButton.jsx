import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './LizardButton.css';
import { motion, AnimatePresence } from 'framer-motion';

const LOCAL_STORAGE_KEY = 'lizard_local_clicks';
const soundPaths = ['/sounds/lizard1.mp3'];

function LizardButton() {
  const [localClicks, setLocalClicks] = useState(0);
  const [globalClicks, setGlobalClicks] = useState(0);
  const [milestoneMessage, setMilestoneMessage] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [emojiExplosions, setEmojiExplosions] = useState([]);

  useEffect(() => {
    document.body.style.userSelect = 'none'; // Prevent text highlighting
    fetchGlobalClicks();

    const storedClicks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedClicks) {
      const count = parseInt(storedClicks, 10);
      setLocalClicks(count);
      setMilestoneMessage(getMilestoneMessage(count));
    }

    return () => {
      document.body.style.userSelect = ''; // Restore default on cleanup
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
      triggerEmojiExplosion();
      return newCount;
    });

    const sound = new Audio(soundPaths[0]);
    sound.play().catch(err => console.error('Audio playback failed:', err));

    const { data, error } = await supabase.rpc('increment_clicks');
    if (error) {
      console.error('Error incrementing global clicks:', error);
    } else {
      setGlobalClicks(data);
    }
  };

  const triggerEmojiExplosion = () => {
    const emojis = ['🦎', '🦎', '🦎', '🦎', '🦎'];
    const explosion = emojis.map((emoji, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 200 + Math.random() * 200;
      return {
        id: Date.now() + i,
        emoji,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    });

    setEmojiExplosions(prev => [...prev, ...explosion]);
    setTimeout(() => {
      setEmojiExplosions(prev => prev.slice(emojis.length));
    }, 1000);
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

          <div className="circle-button-wrapper" onClick={handleClick}>
            <div className="lizard-emoji">🦎</div>
          </div>
        </div>

        <p className="click-count">Your clicks: {localClicks}</p>
        <p className="click-count">Global Lizard Summons: {globalClicks}</p>

        {/* Milestone fixed position */}
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

        {emojiExplosions.map(({ id, emoji, x, y }) => (
          <motion.span
            key={id}
            className="emoji-explosion"
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x, y, opacity: 0, scale: 2, rotate: 360 }}
            transition={{ duration: 1 }}
            style={{ position: 'absolute', fontSize: '2rem', pointerEvents: 'none' }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default LizardButton;
