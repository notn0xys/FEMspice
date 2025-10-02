import Layout from "@/components/layout"
import { useState, useRef} from "react";
import { Button } from "@/components/ui/button"
import  {ReactFlow ,
  MiniMap,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  SelectionMode,
  type ReactFlowInstance,
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
    type: 'smoothstep'
  },
];

export default function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  
  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));
  
  const onConnect = (connection: Connection) =>
    setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds));

  return (
    
    <Layout>
      <div style={{ 
        width: '100%', 
        height: '100%'
      }}
      ref={reactFlowWrapper}

      >

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
          selectionOnDrag
          selectionMode={SelectionMode.Partial}
          onInit={(rfi) => setReactFlowInstance(rfi)}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
            const dataString = event.dataTransfer.getData("application/reactflow");
            const dataObject = JSON.parse(dataString);
            const type = dataObject.type;
            const value = dataObject.value;
            if (!type) {
              console.log("type is null");
              return;
            }
            if (!reactFlowInstance) {
              console.log("reactFlowInstance is null");
              return;
            }
            
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });
            const types_id = getAmountOfSameTypes(nodes, type) + 1;
            const newNode = {
              id: `${type.charAt(0).toUpperCase() + type.slice(1)}${types_id}`,
              type,
              position,
              data: { label: `${type} ${types_id}` , value: value   },
            };
            setNodes((nds) => nds.concat(newNode));
          
          }}
        >
          <Background />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </Layout>
  )
}

function getAmountOfSameTypes(nodes: Node[], type: string) {
  return nodes.filter((node) => node.type === type).length;
}