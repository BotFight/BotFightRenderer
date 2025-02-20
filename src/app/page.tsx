"use client";

import Image from "next/image";
import dynamic from 'next/dynamic'
import Renderer from '@/components/Renderer'

import LocalRenderer from "@/components/electron/LocalRenderer";
import TabSwitcher from "@/components/electron/TabSwitcher";

export default function Home() {
  return (
    <main>
      <TabSwitcher/>
    </main>
  );
}
