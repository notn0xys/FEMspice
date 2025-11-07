import Layout from "@/components/layout"
import { useState, useRef, useEffect} from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
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
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ResistorNode from "@/electric_components/ResistorNode";
import VoltageSourceNode from "@/electric_components/VoltageSourceNode";

type NodeData = {
  id?: string;
  label: string;
  value: number;
  rotation?: number;
};

const nodeTypes = {
    resistor: ResistorNode,
    voltageSource: VoltageSourceNode
};

export default function App() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodeName, setNodeName] = useState<string>("");
  const [nodeValue, setNodeValue] = useState<number>(0);
  const [nodeRotation, setNodeRotation] = useState<number>(0);
  const [nodeID, setNodeID] = useState<string>("");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (nodeID === "") return;
    const node = nodes.find((n) => n.id === nodeID);
    const meow_label = node?.data?.label || "";
    const meow_value = node?.data?.value || 0;
    const meow_rotation = node?.data?.rotation || 0;
    setNodeName(meow_label);
    setNodeValue(meow_value);
    setNodeRotation(meow_rotation);
  }, [nodeID, nodes]);
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'r' && nodeID !== "") {
        const currentNode = nodes.find((n) => n.id === nodeID);
        if (!currentNode) return;
        
        const currentRotation = currentNode.data?.rotation || 0;
        const newRotation = (currentRotation + 90) % 360;
        
        setNodes((nds) => nds.map((node) => {
          if (node.id === nodeID) {
            setNodeRotation(newRotation);
            return {...node, data: {...node.data, rotation: newRotation}};
          }
          return node;
        }));
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nodeID, nodes]);
  
  const onNodesChange = (changes: NodeChange<Node<NodeData>>[]) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  
  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));
  
  const onConnect = (connection: Connection) =>
    setEdges((eds) => addEdge({ ...connection, type: 'step' }, eds));
  function onChangeNodeName() {
    if (nodeID === "") return;
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeID) {
        return {...node, data: {...node.data, label: nodeName}}
      }
      return node;
    }))
  }
  function onChangeNodeValue() {
    if (nodeID === "") return;
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeID) {
        return {...node, data: {...node.data, value: nodeValue}}
      } 
      return node;
    }))
  }
  function onChangeNodeRotation() {
    if (nodeID === "") return;
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeID) {
        return {...node, data: {...node.data, rotation: nodeRotation}}
      } 
      return node;
    }))
  }
  return (
    
    <Layout>
      <div style={{ 
        width: '100%', 
        height: '100%'
      }}
      ref={reactFlowWrapper}

      >
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
            const newNode: Node<NodeData> = {
              id: `${type.charAt(0).toUpperCase()}${types_id}`,
              type,
              position,
              data: { label: `${type} ${types_id}` , value: value, rotation: 0 },
            };
            setNodes((nds) => nds.concat(newNode));
          
          }}
          onNodeClick={(_, node) => {
            setNodeID(node?.id || "");
          }
        }
        >
          <Panel position="top-right" style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <Button onClick={() => {

            }}>Run Simulation</Button>
            <Button onClick={() => console.log(nodes)}>check nodes</Button>
            <Button onClick={() => console.log(edges)}>check edges</Button>
          </Panel>
          <Panel position="top-left" style={{display: "flex", flexDirection: "column", gap: "10px", width: "150px"}}>
            <Input placeholder="Node Name" value={nodeName} onChange={(e) => setNodeName(e.target.value)} onBlur={onChangeNodeName} />
            <Input placeholder="Node Value" type="number" value={nodeValue} onChange={(e) => setNodeValue(Number(e.target.value))} onBlur={onChangeNodeValue} />
            <Input placeholder="Rotation (deg)" type="number" value={nodeRotation} onChange={(e) => setNodeRotation(Number(e.target.value))} onBlur={onChangeNodeRotation} />
          </Panel>
          <Background />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </Layout>
  )
}

function getAmountOfSameTypes(nodes: Node<NodeData>[], type: string) {
  return nodes.filter((node) => node.type === type).length;
}
