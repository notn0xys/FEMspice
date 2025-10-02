import Layout from "@/components/layout"
import { useState } from "react";
import { Button } from "@/components/ui/button"
import  {ReactFlow ,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ResistorNode from "@/electric_components/ResistorNode";
import VoltageSourceNode from "@/electric_components/VoltageSourceNode";
const nodeTypes = {
    resistor: ResistorNode,
    voltageSource: VoltageSourceNode
};
const initialNodes: Node[] = [
  {
    id: 'R1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
  },
  {
    id: 'R2',
    type: 'default',
    position: { x: 300, y: 100 },
    data: { label: 'Node 2' },
  },
  {
    id: 'R3',
    type: 'resistor',
    position: { x: 200, y: 300 },
    data: { resistance: 1000 }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'R1',
    target: 'R2',
  },
];

export default function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  
  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  
  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));
  
  const onConnect = (connection: Connection) =>
    setEdges((eds) => addEdge(connection, eds));

  return (
    <Layout>
      <div style={{ 
        width: '100%', 
        height: '100%'
      }}>
        <Button onClick={() => console.log(nodes)}>check nodes</Button>
        <Button onClick={() => console.log(edges)}>check edges</Button>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </Layout>
  )
}