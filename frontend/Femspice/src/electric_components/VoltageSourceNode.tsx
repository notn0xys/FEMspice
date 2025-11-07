import {Handle, Position, useUpdateNodeInternals} from "@xyflow/react";
import { useEffect } from "react";
import type { NodeProps } from "@xyflow/react";

type VoltageSourceData = Record<string, unknown> & {
    label: string;
    value: number;
    rotation?: number;
};

export default function VoltageSourceNode({id, data}: NodeProps<VoltageSourceData>) {
    const rotation = (data.rotation as number) || 0;
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
            <strong>{data.value as number} V</strong>
            <div></div>
            <strong>-       +</strong>
            <Handle 
                type="source" 
                position={Position.Right} 
                id="right" 
                style={{ background: '#555' }}
            />
            <Handle 
                type="target" 
                position={Position.Left} 
                id="left" 
                style={{ background: '#555' }}
            />
        </div>
    )
}
