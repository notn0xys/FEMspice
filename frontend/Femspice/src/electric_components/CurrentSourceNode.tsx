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
  isDarkMode?: boolean;
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
  isDarkMode = false,
}: CurrentSourceNodeProps) {
  const currentLabel = String(current);

  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    onPinPointerDown?.(pinId, event);
  };

  const selectionColor = "#3a3a36";
  const strokeColor = isSelected ? selectionColor : isDarkMode ? "#f8fafc" : "black";
  const leadColor = isDarkMode ? "#f8fafc" : "black";
  const labelColor = isDarkMode ? "#f8fafc" : "black";
  const bodyFill = isDarkMode ? "#3a3a36" : "white";
  const symbolColor = isDarkMode ? "#f8fafc" : "#000000ff";
  const inactivePinFill = isDarkMode ? "#3a3a36" : "#ffffff";
  const pinStroke = isDarkMode ? "#f8fafc" : "#1f2937";

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
        stroke={leadColor}
        strokeWidth={2}
      />
      <Line
        points={[
          CURRENT_SOURCE_PIN_OFFSETS.bottom.x,
          CURRENT_SOURCE_PIN_OFFSETS.bottom.y,
          0,
          CURRENT_SOURCE_RADIUS,
        ]}
        stroke={leadColor}
        strokeWidth={2}
      />

      <Circle
        x={CURRENT_SOURCE_PIN_OFFSETS.top.x}
        y={CURRENT_SOURCE_PIN_OFFSETS.top.y}
        radius={wireMode ? 7 : 5}
        fill={wireMode ? (activePin === "top" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
        stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
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
        fill={wireMode ? (activePin === "bottom" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
        stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={18}
        onMouseDown={handlePinEvent("bottom")}
        onTouchStart={handlePinEvent("bottom")}
      />

      <Circle
        radius={CURRENT_SOURCE_RADIUS}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        fill={bodyFill}
        shadowEnabled={isSelected}
        shadowBlur={12}
  shadowColor={selectionColor}
      />

      <Line
        points={[0, -8, 0, 8]}
        stroke={symbolColor}
        strokeWidth={2}
        lineCap="round"
      />
      <Line
        points={[0, -8, -4, -2]}
        stroke={symbolColor}
        strokeWidth={2}
        lineCap="round"
      />
      <Line
        points={[0, -8, 4, -2]}
        stroke={symbolColor}
        strokeWidth={2}
        lineCap="round"
      />

      <Text
        text={currentLabel}
        x={-CURRENT_SOURCE_RADIUS - 10}
        y={CURRENT_SOURCE_RADIUS + 10}
        fontSize={12}
        fill={labelColor}
      />
    </Group>
  );
}
