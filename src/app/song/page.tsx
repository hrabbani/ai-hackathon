'use client';

import dynamic from 'next/dynamic';

const SongPage = dynamic(() => import('../../pages/SongPage'), { ssr: false });

export default function Page() {
  return <SongPage />;
} 