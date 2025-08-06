import React, { useEffect, useState } from 'react';
import './LizardButton.css';
import { supabase } from '../supabaseClient';

const soundPaths = ['/sounds/lizard1.mp3'];

function LizardButton() {
  const [clicks, setClicks] = useState(0);
  const [globalClicks, setGlobalClicks] = useState(null);
  const [audioBuffers, setAudioBuffers] = useState([]);

  useEffect(() => {
    const loadSounds = () => {
      const buffers = soundPaths.map((path) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        return audio;
      });
      setAudioBuffers(buffers);
    };

    const fetchClicks = async () => {
      const { data, error } = await supabase
        .from('global_clicks')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching clicks:', error.message);
      } else {
        setGlobalClicks(data.count);
      }
    };

    loadSounds();
    fetchClicks();
  }, []);

  const handleClick = async () => {
    setClicks(prev => prev + 1);

    const sound = new Audio(soundPaths[0]);
    sound.play().catch(console.error);
    if (navigator.vibrate) navigator.vibrate(100);

    // update global counter
    const { data, error } = await supabase.rpc('increment_clicks');

    if (error) {
      console.error('Error updating global clicks:', error.message);
    } else {
      setGlobalClicks(data); // returns new count
    }
  };

  return (
    <div className="lizard-container">
      <button className="lizard-button" onClick={handleClick}>
        Summon the Lizard 🦎
      </button>
      <p className="click-count">You’ve clicked {clicks} times</p>
      <p className="click-count">Global Lizard Clicks: {globalClicks ?? 'Loading...'}</p>
    </div>
  );
}

export default LizardButton;

