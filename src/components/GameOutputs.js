import { useEffect, useRef } from 'react';

export default function GameOutputs({ engineOutput }) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [engineOutput]);

  return engineOutput ? (
    <div
      ref={outputRef}
      className="bg-black text-green-500 p-4 rounded-lg overflow-y-auto text-sm h-64 flex-grow w-full"
    >      <pre className="w-full text-wrap">{engineOutput}</pre>
    </div>
  ) : (
    <div className="p-4 border rounded-lg shadow-md w-full text-zinc-500 h-64 flex-grow bg-black flex justify-center items-center italic text-lg">
      Play a match to view output
    </div>
  )
}