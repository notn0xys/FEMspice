import {Handle, Position} from "@xyflow/react";


export default function VoltageSourceNode({data}: {data: {id: string, label: string, value: number, rotation?: number}}) {
    const rotation = data.rotation || 0;
    
    
    return (
        <div 
            className="p-2 border-black-200 border rounded text-center bg-white"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <strong>{data.value} V</strong>
            <div>

            </div>
            <strong>-       +</strong>
            <Handle type="target" position={Position.Right} />
            <Handle type="source" position={Position.Left} />
        </div>
    )
}
