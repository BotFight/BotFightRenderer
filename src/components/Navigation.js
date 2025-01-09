import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

function Navigation({ onBack, onForward, onInputChange, togglePlay, inputValue, isPlaying, playSpeed, onSpeedChange }) {
    return (
    <div className="navigation p-5 flex justify-between items-center bg-gray-800 ">
    <div className="pr-5">
        <button onClick={onBack} className="text-white pr-1">
            <FontAwesomeIcon icon={faArrowLeft} />
        </button>
            <input
            type="number"
            value={inputValue}
            onChange={onInputChange}
            className="nav-input"
            placeholder="frame number"
        />
        <button onClick={onForward} className="text-white pl-1">
            <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <div>
            <button onClick={togglePlay} className="text-white pr-2">
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            <input
            type="number"
            value={playSpeed}
            onChange={onSpeedChange}
            className="nav-input"
            placeholder="Speed (ms)"
      />
      </div>
    </div>
  )
}

export default Navigation