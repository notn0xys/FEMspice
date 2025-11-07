import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";
import type { NodeProps } from "@xyflow/react";

type ResistorData = Record<string, unknown> & {
  label: string;
  value: number;
  rotation?: number;
};

export default function ResistorNode({ id, data }: NodeProps<ResistorData>) {
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
        transformOrigin: "center",
        width: "100px",
        height: "60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <strong>Resistor</strong>
      <p>{data.label as string}</p>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#555" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#555" }}
      />
    </div>
  );
}
