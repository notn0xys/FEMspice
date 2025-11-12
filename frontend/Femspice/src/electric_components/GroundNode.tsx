import { Group, Line, Text, Circle } from "react-konva";
import type Konva from "konva";

interface GroundNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  label?: string;
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

const GROUND_PIN_LENGTH = 26;
const GROUND_LINE_SPACING = 6;
const GROUND_LINE_WIDTHS = [28, 20, 12];

export const GROUND_PIN_OFFSETS = {
  top: { x: 0, y: -GROUND_PIN_LENGTH },
} as const;

export default function GroundNode({
  x = 0,
  y = 0,
  rotation = 0,
  label = "GND",
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
  isDarkMode = false,
}: GroundNodeProps) {
  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    onPinPointerDown?.(pinId, event);
  };

  const baseStroke = isDarkMode ? "#f8fafc" : "#3a3a36";
  const selectionColor = "#3a3a36";
  const strokeColor = isSelected ? selectionColor : baseStroke;
  const labelColor = isDarkMode ? "#f8fafc" : "#3a3a36";
  const pinStroke = isDarkMode ? "#f8fafc" : "#3a3a36";
  const inactivePinFill = isDarkMode ? "#3a3a36" : "#ffffff";

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
          0,
          GROUND_PIN_OFFSETS.top.y,
          0,
          -GROUND_LINE_SPACING,
        ]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        lineCap="round"
        shadowEnabled={isSelected}
        shadowBlur={10}
  shadowColor={selectionColor}
      />
      <Circle
        x={GROUND_PIN_OFFSETS.top.x}
        y={GROUND_PIN_OFFSETS.top.y}
        radius={wireMode ? 7 : 5}
        fill={wireMode ? (activePin === "top" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
        stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={18}
        onMouseDown={handlePinEvent("top")}
        onTouchStart={handlePinEvent("top")}
      />
      {GROUND_LINE_WIDTHS.map((width, index) => (
        <Line
          key={width}
          points={[-width / 2, index * GROUND_LINE_SPACING, width / 2, index * GROUND_LINE_SPACING]}
          stroke={strokeColor}
          strokeWidth={isSelected ? 3 : 2}
          lineCap="round"
        />
      ))}
      <Text
        text={label}
        x={-20}
        y={GROUND_LINE_WIDTHS.length * GROUND_LINE_SPACING + 4}
        width={40}
        align="center"
        fontSize={12}
        fill={labelColor}
      />
    </Group>
  );
}
