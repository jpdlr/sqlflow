import { Node } from 'reactflow';

export interface ConnectionPoint {
  sourceHandle: string;
  targetHandle: string;
}

export function calculateOptimalConnection(
  sourceNode: Node,
  targetNode: Node
): ConnectionPoint {
  if (!sourceNode?.position || !targetNode?.position) {
    return {
      sourceHandle: `${sourceNode.id}-source-bottom`,
      targetHandle: `${targetNode.id}-target-top`,
    };
  }

  const sourcePos = sourceNode.position;
  const targetPos = targetNode.position;
  
  // Approximate node dimensions (can be refined with actual measurements)
  const nodeWidth = 300;
  const nodeHeight = 200;
  
  // Calculate centers
  const sourceCenterX = sourcePos.x + nodeWidth / 2;
  const sourceCenterY = sourcePos.y + nodeHeight / 2;
  const targetCenterX = targetPos.x + nodeWidth / 2;
  const targetCenterY = targetPos.y + nodeHeight / 2;
  
  // Calculate relative position
  const deltaX = targetCenterX - sourceCenterX;
  const deltaY = targetCenterY - sourceCenterY;
  
  // Determine the primary direction
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  
  let sourceHandle: string;
  let targetHandle: string;
  
  if (absX > absY) {
    // Horizontal connection is preferred
    if (deltaX > 0) {
      // Target is to the right of source
      sourceHandle = `${sourceNode.id}-source-right`;
      targetHandle = `${targetNode.id}-target-left`;
    } else {
      // Target is to the left of source
      sourceHandle = `${sourceNode.id}-source-left`;
      targetHandle = `${targetNode.id}-target-right`;
    }
  } else {
    // Vertical connection is preferred
    if (deltaY > 0) {
      // Target is below source
      sourceHandle = `${sourceNode.id}-source-bottom`;
      targetHandle = `${targetNode.id}-target-top`;
    } else {
      // Target is above source
      sourceHandle = `${sourceNode.id}-source-top`;
      targetHandle = `${targetNode.id}-target-bottom`;
    }
  }
  
  return { sourceHandle, targetHandle };
}

export function calculateAllOptimalConnections(
  nodes: Node[],
  relationships: { from: string; to: string }[]
): Map<string, ConnectionPoint> {
  const connections = new Map<string, ConnectionPoint>();
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  relationships.forEach((rel, index) => {
    const sourceNode = nodeMap.get(rel.from);
    const targetNode = nodeMap.get(rel.to);
    
    if (sourceNode && targetNode) {
      const edgeId = `${rel.from}-${rel.to}-${index}`;
      const connection = calculateOptimalConnection(sourceNode, targetNode);
      connections.set(edgeId, connection);
    }
  });
  
  return connections;
}