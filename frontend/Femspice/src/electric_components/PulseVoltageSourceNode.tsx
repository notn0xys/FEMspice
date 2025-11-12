import { useMemo } from "react";
import { Circle, Group, Line } from "react-konva";
import type Konva from "konva";

export interface PulseSettings {
  initialValue?: number | null;
  pulseValue?: number | null;
  pulseWidth?: number | null;
  period?: number | null;
}

interface PulseVoltageSourceNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  pulseSettings?: PulseSettings;
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

export const PULSE_VOLTAGE_SOURCE_RADIUS = 22;
export const PULSE_VOLTAGE_SOURCE_PIN_OFFSETS = {
  top: { x: 0, y: -PULSE_VOLTAGE_SOURCE_RADIUS - 12 },
  bottom: { x: 0, y: PULSE_VOLTAGE_SOURCE_RADIUS + 12 },
} as const;

export default function PulseVoltageSourceNode({
  x = 0,
  y = 0,
  rotation = 0,
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
  isDarkMode = false,
}: PulseVoltageSourceNodeProps) {
  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    onPinPointerDown?.(pinId, event);
  };

  const selectionColor = "#3a3a36";
  const strokeColor = isSelected ? selectionColor : isDarkMode ? "#f8fafc" : "#3a3a36";
  const leadColor = isDarkMode ? "#f8fafc" : "#3a3a36";
  const inactivePinFill = isDarkMode ? "#3a3a36" : "#ffffff";
  const pinStroke = isDarkMode ? "#f8fafc" : "#3a3a36";
  const pulseStroke = strokeColor;

  const pulsePathPoints = useMemo(() => {
    const size = PULSE_VOLTAGE_SOURCE_RADIUS - 8;
    return [
      -size,
      8,
      -size,
      -8,
      -size / 2,
      -8,
      -size / 2,
      8,
      size / 2,
      8,
      size / 2,
      -8,
      size,
      -8,
      size,
      8,
    ];
  }, []);

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
          PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.top.x,
          PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.top.y,
          0,
          -PULSE_VOLTAGE_SOURCE_RADIUS,
        ]}
        stroke={leadColor}
        strokeWidth={2}
      />
      <Line
        points={[
          PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.bottom.x,
          PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.bottom.y,
          0,
          PULSE_VOLTAGE_SOURCE_RADIUS,
        ]}
        stroke={leadColor}
        strokeWidth={2}
      />

      <Circle
        x={PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.top.x}
        y={PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.top.y}
        radius={wireMode ? 8 : 6}
        fill={wireMode ? (activePin === "top" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
        stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent("top")}
        onTouchStart={handlePinEvent("top")}
      />
      <Circle
        x={PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.bottom.x}
        y={PULSE_VOLTAGE_SOURCE_PIN_OFFSETS.bottom.y}
        radius={wireMode ? 8 : 6}
        fill={wireMode ? (activePin === "bottom" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
        stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent("bottom")}
        onTouchStart={handlePinEvent("bottom")}
      />

      <Circle
        radius={PULSE_VOLTAGE_SOURCE_RADIUS}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        fill={isDarkMode ? "#3a3a36" : "#ffffff"}
        shadowEnabled={isSelected}
        shadowBlur={12}
        shadowColor={selectionColor}
      />

        <Line
          points={pulsePathPoints}
          stroke={pulseStroke}
          strokeWidth={2}
          lineJoin="round"
          lineCap="round"
          listening={false}
        />
    </Group>
  );
}
