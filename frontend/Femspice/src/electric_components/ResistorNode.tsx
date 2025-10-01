import {Handle, Position} from "@xyflow/react";


export default function ResistorNode({data} : {data: {id: string, label: string, value : number}}) {
    return (
        <div className="p-2 border-black-200 border rounded text-center bg-white">
            <strong>Resistor</strong>
            <p>{data.label}</p>
            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Left} />
        </div>
    )
}

