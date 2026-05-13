import React from 'react';
import { MapExplorer, type MapNode, type MapPath } from './MapExplorer';

const demoNodes: MapNode[] = [
  { id: 'node-1', name: '青云门', type: '门派', dangerLevel: 1, isExplored: true, isAdjacent: true, isCurrent: true, x: 50, y: 30 },
  { id: 'node-2', name: '悦来客栈', type: '客栈', dangerLevel: 1, isExplored: true, isAdjacent: true, isCurrent: false, x: 20, y: 45 },
  { id: 'node-3', name: '东市集', type: '市集', dangerLevel: 2, isExplored: true, isAdjacent: true, isCurrent: false, x: 80, y: 45 },
  { id: 'node-4', name: '落霞村', type: '村庄', dangerLevel: 2, isExplored: true, isAdjacent: false, isCurrent: false, x: 15, y: 20 },
  { id: 'node-5', name: '断崖秘境', type: '秘境', dangerLevel: 4, isExplored: true, isAdjacent: false, isCurrent: false, x: 85, y: 15 },
  { id: 'node-6', name: '无名山洞', type: '山洞', dangerLevel: 3, isExplored: false, isAdjacent: false, isCurrent: false, x: 50, y: 10 },
  { id: 'node-7', name: '黑风寨', type: '荒野', dangerLevel: 5, isExplored: false, isAdjacent: false, isCurrent: false, x: 95, y: 50 },
];

const demoPaths: MapPath[] = [
  { from: 'node-1', to: 'node-2', isUnlocked: true },
  { from: 'node-1', to: 'node-3', isUnlocked: true },
  { from: 'node-2', to: 'node-4', isUnlocked: true },
  { from: 'node-3', to: 'node-5', isUnlocked: true },
  { from: 'node-1', to: 'node-6', isUnlocked: false },
  { from: 'node-3', to: 'node-7', isUnlocked: false },
];

interface Props {
  onClose: () => void;
}

const MapExplorerModal: React.FC<Props> = ({ onClose }) => (
  <MapExplorer
    nodes={demoNodes}
    paths={demoPaths}
    currentActionPoints={3}
    maxActionPoints={5}
    timeOfDay="下午"
    playerSilver={128}
    onMove={(nodeId) => console.log('Move to', nodeId)}
    onClose={onClose}
  />
);

export default MapExplorerModal;
