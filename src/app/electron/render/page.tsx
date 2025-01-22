'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LocalRenderer from '@/components/LocalRenderer'; 

export default function RenderPage() {
  return (
    <main>
    <LocalRenderer/>
  </main>
  );
}
