import { Group, Circle, Line, Text } from "react-konva";
import type Konva from "konva";

interface CurrentSourceNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  current?: string | number;
  onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  onPinPointerDown?: (
    pinId: string,
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => void;
  wireMode?: boolean;
  activePin?: string | null;
  onContextMenu?: (event: Konva.KonvaEventObject<PointerEvent>) => void;
}

export const CURRENT_SOURCE_RADIUS = 20;
export const CURRENT_SOURCE_PIN_OFFSETS = {
  top: { x: 0, y: -CURRENT_SOURCE_RADIUS - 10 },
  bottom: { x: 0, y: CURRENT_SOURCE_RADIUS + 10 },
} as const;

export default function CurrentSourceNode({
  x = 0,
  y = 0,
  rotation = 0,
  current = "5A",
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
}: CurrentSourceNodeProps) {
  const currentLabel = String(current);

  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    onPinPointerDown?.(pinId, event);
  };

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable={!wireMode}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onContextMenu={onContextMenu}
    >
      <Line
        points={[
          CURRENT_SOURCE_PIN_OFFSETS.top.x,
          CURRENT_SOURCE_PIN_OFFSETS.top.y,
          0,
          -CURRENT_SOURCE_RADIUS,
        ]}
        stroke="black"
        strokeWidth={2}
      />
      <Line
        points={[
          CURRENT_SOURCE_PIN_OFFSETS.bottom.x,
          CURRENT_SOURCE_PIN_OFFSETS.bottom.y,
          0,
          CURRENT_SOURCE_RADIUS,
        ]}
        stroke="black"
        strokeWidth={2}
      />

      <Circle
        x={CURRENT_SOURCE_PIN_OFFSETS.top.x}
        y={CURRENT_SOURCE_PIN_OFFSETS.top.y}
        radius={wireMode ? 7 : 5}
        fill={wireMode ? (activePin === "top" ? "#1d4ed8" : "#ffffff") : "rgba(0,0,0,0)"}
        stroke={wireMode ? "#1f2937" : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={18}
        onMouseDown={handlePinEvent("top")}
        onTouchStart={handlePinEvent("top")}
      />
      <Circle
        x={CURRENT_SOURCE_PIN_OFFSETS.bottom.x}
        y={CURRENT_SOURCE_PIN_OFFSETS.bottom.y}
        radius={wireMode ? 7 : 5}
        fill={wireMode ? (activePin === "bottom" ? "#1d4ed8" : "#ffffff") : "rgba(0,0,0,0)"}
        stroke={wireMode ? "#1f2937" : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={18}
        onMouseDown={handlePinEvent("bottom")}
        onTouchStart={handlePinEvent("bottom")}
      />

      <Circle
        radius={CURRENT_SOURCE_RADIUS}
        stroke={isSelected ? "#2563eb" : "black"}
        strokeWidth={isSelected ? 3 : 2}
        fill="white"
        shadowEnabled={isSelected}
        shadowBlur={12}
        shadowColor="#2563eb"
      />

      <Line
        points={[0, -8, 0, 8]}
        stroke="#000000ff"
        strokeWidth={2}
        lineCap="round"
      />
      <Line
        points={[0, -8, -4, -2]}
        stroke="#000000ff"
        strokeWidth={2}
        lineCap="round"
      />
      <Line
        points={[0, -8, 4, -2]}
        stroke="#000000ff"
        strokeWidth={2}
        lineCap="round"
      />

      <Text
        text={currentLabel}
        x={-CURRENT_SOURCE_RADIUS - 10}
        y={CURRENT_SOURCE_RADIUS + 10}
        fontSize={12}
        fill="black"
      />
    </Group>
  );
}
