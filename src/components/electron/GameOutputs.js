import React, { useEffect, useRef } from 'react';

export default function GameOutputs({ engineOutput }) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [engineOutput]);

  return (
    <div
      ref={outputRef}
      className="bg-black text-green-500 p-4 rounded-lg overflow-y-auto"
      style={{ width: '600px', height: '400px' }}
    >      <pre>{engineOutput}</pre>
    </div>
  );
}