import React from 'react';
import { useRouter } from 'next/navigation';

function ReassignDirectory() {
  const router = useRouter();

  const handleReassignDirectory = async () => {
    await window.electron.storeSet('directory', null);

    router.push('/electron');
  };

  return (
      <button
        onClick={handleReassignDirectory}
        className="px-4 py-2 rounded bg-red-800 text-white hover:bg-red-700"
      >
        Reassign Directory
      </button>
  );
}

export default ReassignDirectory;