import {Handle, Position} from "@xyflow/react";


export default function VoltageSourceNode({data}: {data: {id: string, label: string, value: number}}) {
    return (
        <div className="p-2 border-black-200 border rounded text-center bg-white">
            <strong>{data.value} V</strong>
            <div>

            </div>
            <strong>-       +</strong>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    )
}