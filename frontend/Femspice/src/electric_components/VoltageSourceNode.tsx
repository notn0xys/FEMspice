import {Handle, Position, useUpdateNodeInternals} from "@xyflow/react";
import { useEffect } from "react";
import type { NodeProps } from "@xyflow/react";

type VoltageSourceData = {
    id: string;
    label: string;
    value: number;
    rotation?: number;
};

export default function VoltageSourceNode({id, data}: NodeProps<VoltageSourceData>) {
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
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <strong>{data.value} V</strong>
            <div></div>
            <strong>-       +</strong>
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
