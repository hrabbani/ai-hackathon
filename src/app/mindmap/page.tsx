'use client';

import React from 'react';
import MindMap from '../../components/MindMap';
import testMapData from '../../utils/testmap.json';

export default function MindMapPage() {
  return (
    <div className="w-full h-screen">
      <MindMap data={testMapData} />
    </div>
  );
} 