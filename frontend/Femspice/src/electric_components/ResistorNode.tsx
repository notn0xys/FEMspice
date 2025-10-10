import {Handle, Position} from "@xyflow/react";


export default function ResistorNode({data} : {data: {id: string, label: string, value : number, rotation?: number}}) {
    const rotation = data.rotation || 0;
    
    return (
        <div 
            className="p-2 border-black-200 border rounded text-center bg-white"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <strong>{data.label}</strong>
            <div>
                <strong>{data.value} Ω</strong>
            </div>
            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Left} />
        </div>
    )
}


