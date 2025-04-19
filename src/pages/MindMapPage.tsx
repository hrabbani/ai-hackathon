import React from 'react';
import MindMap from '../components/MindMap';
import testMapData from '../utils/testmap.json';

const MindMapPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MindMap data={testMapData} />
    </div>
  );
};

export default MindMapPage; 