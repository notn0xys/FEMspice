import Layout from "@/components/layout"
import { Button } from "@/components/ui/button.tsx"
import React, { useState } from "react";
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
export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((nds) => {applyNodeChanges(changes, nds); console.log(nds); return nds;});
  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => {applyEdgeChanges(changes, eds); console.log(eds); return eds;});
  const onConnect = (connection: Connection) =>
    setEdges((eds) => {addEdge(connection, eds); console.log(eds); return eds;});
  return (
    <Layout>
      <div className="App">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
        
      </div>
    </Layout>
  )
}