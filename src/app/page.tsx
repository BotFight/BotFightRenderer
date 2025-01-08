'use client';

import Image from "next/image";
import dynamic from 'next/dynamic'

export default function Home() {
  const Game = dynamic(() => import('@/components/Game'), {
    ssr: false
  })

  return (
    <main>
    <Game/>
  </main>
  );
}
