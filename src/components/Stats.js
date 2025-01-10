import React, { useEffect, useState } from 'react'

export default function Stats({ matchStates, currentMatchStateIndex, isSnakeA}) {
    const [stats, setStats] = useState({applesEaten: 0, snakeLength: 0});

    useEffect(() => {
        if (matchStates) {
            if(isSnakeA) {
                setStats({applesEaten: matchStates[currentMatchStateIndex].a_apples_eaten, snakeLength: matchStates[currentMatchStateIndex].a_length});
            } else {
                setStats({applesEaten: matchStates[currentMatchStateIndex].b_apples_eaten, snakeLength: matchStates[currentMatchStateIndex].b_length});
            }
        }
    });

    return (
    <div>Stats</div>
  )
}

