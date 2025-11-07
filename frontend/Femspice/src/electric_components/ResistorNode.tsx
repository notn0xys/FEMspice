import {Handle, Position, useUpdateNodeInternals} from "@xyflow/react";
import { useEffect } from "react";
import type { NodeProps } from "@xyflow/react";

type ResistorData = {
    id: string;
    label: string;
    value: number;
    rotation?: number;
};

export default function ResistorNode({id, data}: NodeProps<ResistorData>) {
    const rotation = data.rotation || 0;
    const updateNodeInternals = useUpdateNodeInternals();
    
    useEffect(() => {
        updateNodeInternals(id);
    }, [rotation, id, updateNodeInternals]);
    
    return (
        <div 
            className="p-2 border-black-200 border rounded text-center bg-white"
            style={{ 
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center',
                width: '100px',
                height: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <strong>Resistor</strong>
            <p>{data.label}</p>
            <Handle 
                type="source" 
                position={Position.Right} 
                id="right" 
                style={{ background: '#555', top: '50%', transform: 'translateY(-50%)' }}
            />
            <Handle 
                type="target" 
                position={Position.Right} 
                id="right-target" 
                style={{ background: '#555', top: '50%', transform: 'translateY(-50%)' }}
            />
            <Handle 
                type="source" 
                position={Position.Left} 
                id="left" 
                style={{ background: '#555', top: '50%', transform: 'translateY(-50%)' }}
            />
            <Handle 
                type="target" 
                position={Position.Left} 
                id="left-target" 
                style={{ background: '#555', top: '50%', transform: 'translateY(-50%)' }}
            />
        </div>
    )
}


