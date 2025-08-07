import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './LizardButton.css';

const soundPaths = ['/sounds/lizard1.mp3'];

function LizardButton() {
  const [localClicks, setLocalClicks] = useState(0);
  const [globalClicks, setGlobalClicks] = useState(0);

  // Fetch global clicks on load
  useEffect(() => {
    fetchGlobalClicks();
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

  const handleClick = async () => {
    setLocalClicks(prev => prev + 1);

    // Play the lizard sound
    const sound = new Audio(soundPaths[0]);
    sound.play().catch(err => console.error('Audio playback failed:', err));

    // Call the RPC to increment the DB counter
    const { data, error } = await supabase.rpc('increment_clicks');

    if (error) {
      console.error('Error incrementing global clicks:', error);
    } else {
      setGlobalClicks(data); // The function returns the new value
    }
  };

  return (
    <div className="lizard-container">
      <button className="lizard-button" onClick={handleClick}>
        Summon the Lizard 🦎
      </button>
      <p className="click-count">Your clicks: {localClicks}</p>
      <p className="click-count">Global Lizard Summons: {globalClicks}</p>
    </div>
  );
}

export default LizardButton;


