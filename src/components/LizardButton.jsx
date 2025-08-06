import React, { useState } from 'react';
import './LizardButton.css';

const soundList = [
  '/sounds/lizard1.mp3',
  '/sounds/lizard2.mp3',
  '/sounds/lizard3.mp3'
];

function LizardButton() {
  const [clicks, setClicks] = useState(0);
  const [audio] = useState(new Audio());

  const handleClick = () => {
    setClicks(prev => prev + 1);
    const randomSound = soundList[Math.floor(Math.random() * soundList.length)];
    audio.src = randomSound;
    audio.play();

    // Optional: vibrate on click for mobile
    if (navigator.vibrate) navigator.vibrate(100);
  };

  return (
    <div className="lizard-container">
      <button className="lizard-button" onClick={handleClick}>
        Summon the Lizard 🦎
      </button>
      <p className="click-count">You've clicked {clicks} times</p>
    </div>
  );
}

export default LizardButton;
