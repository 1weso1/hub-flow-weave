import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface WorkflowType {
  id: string;
  name: string;
  category: string;
  node_count: number;
  complexity: string;
}

interface WorkflowPreviewProps {
  workflow: WorkflowType;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ workflow }) => {
  // Generate mock nodes and edges based on workflow properties
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodeCount = Math.min(workflow.node_count, 20); // Limit for preview
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Create nodes in a rough flow pattern
    for (let i = 0; i < nodeCount; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      
      // Generate different node types based on category and position
      let nodeType = 'default';
      let nodeColor = '#6366f1';
      
      if (i === 0) {
        nodeType = 'input';
        nodeColor = '#10b981';
      } else if (i === nodeCount - 1) {
        nodeType = 'output';
        nodeColor = '#f59e0b';
      } else {
        // Vary node types based on category
        switch (workflow.category.toLowerCase()) {
          case 'data processing':
            nodeColor = '#3b82f6';
            break;
          case 'marketing':
            nodeColor = '#ec4899';
            break;
          case 'social':
            nodeColor = '#8b5cf6';
            break;
          case 'communication':
            nodeColor = '#06b6d4';
            break;
          default:
            nodeColor = '#6366f1';
        }
      }
      
      nodes.push({
        id: `node-${i}`,
        type: nodeType,
        position: { 
          x: col * 200 + Math.random() * 50, 
          y: row * 100 + Math.random() * 30 
        },
        data: { 
          label: i === 0 ? 'Start' : i === nodeCount - 1 ? 'End' : `Step ${i}`
        },
        style: {
          backgroundColor: nodeColor,
          color: 'white',
          border: `2px solid ${nodeColor}`,
          borderRadius: '8px',
        }
      });
      
      // Create edges connecting nodes in sequence with some branching
      if (i > 0) {
        if (i % 3 === 0 && i > 1) {
          // Create a branch from two steps back
          edges.push({
            id: `edge-${i-2}-${i}`,
            source: `node-${i-2}`,
            target: `node-${i}`,
            type: 'smoothstep',
            style: { stroke: nodeColor, strokeWidth: 2 },
            animated: workflow.complexity === 'Advanced'
          });
        } else {
          // Normal sequential connection
          edges.push({
            id: `edge-${i-1}-${i}`,
            source: `node-${i-1}`,
            target: `node-${i}`,
            type: 'smoothstep',
            style: { stroke: nodeColor, strokeWidth: 2 },
            animated: workflow.complexity === 'Advanced'
          });
        }
      }
    }
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(() => {
    // Prevent connection changes in preview mode
  }, []);

  const nodeColor = (node: Node) => {
    if (node.type === 'input') return '#10b981';
    if (node.type === 'output') return '#f59e0b';
    return '#6366f1';
  };

  return (
    <div className="w-full h-[600px] bg-card rounded-lg border border-border/20 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        style={{ 
          backgroundColor: 'hsl(var(--card))',
        }}
        className="workflow-preview"
      >
        <Controls 
          className="!bg-secondary !border-border/20"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={nodeColor}
          className="!bg-secondary !border-border/20"
          maskColor="hsl(var(--card-glass) / 0.1)"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={12} 
          size={1}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
      </ReactFlow>
      
      {/* Preview Overlay */}
      <div className="absolute top-4 right-4 glass-card px-3 py-2 text-sm text-muted-foreground">
        Interactive Preview • {workflow.node_count} nodes
      </div>
    </div>
  );
};