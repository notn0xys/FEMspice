import { Group, Circle, Line, Text } from 'react-konva';
import type Konva from 'konva';

interface VoltageSourceNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  voltage?: string | number;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  onPinPointerDown?: (pinId: string, event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  wireMode?: boolean;
  activePin?: string | null;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}

export const VOLTAGE_SOURCE_RADIUS = 20;
export const VOLTAGE_SOURCE_PIN_OFFSETS = {
  top: { x: 0, y: -VOLTAGE_SOURCE_RADIUS - 10 },
  bottom: { x: 0, y: VOLTAGE_SOURCE_RADIUS + 10 },
};

export default function VoltageSourceNode({
  x = 0,
  y = 0,
  rotation = 0,
  voltage = '5V',
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
}: VoltageSourceNodeProps) {
  const voltageLabel = String(voltage);

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
      offsetX={0}
      offsetY={0}
      draggable={!wireMode}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onContextMenu={onContextMenu}
    >
      {/* Wires / terminals */}
      <Line
        points={[VOLTAGE_SOURCE_PIN_OFFSETS.top.x, VOLTAGE_SOURCE_PIN_OFFSETS.top.y, 0, -VOLTAGE_SOURCE_RADIUS]}
        stroke="black"
        strokeWidth={2}
      />
      <Line
        points={[VOLTAGE_SOURCE_PIN_OFFSETS.bottom.x, VOLTAGE_SOURCE_PIN_OFFSETS.bottom.y, 0, VOLTAGE_SOURCE_RADIUS]}
        stroke="black"
        strokeWidth={2}
      />

      {/* Connection pins */}
      <Circle
        x={VOLTAGE_SOURCE_PIN_OFFSETS.top.x}
        y={VOLTAGE_SOURCE_PIN_OFFSETS.top.y}
        radius={wireMode ? 7 : 5}
        fill={wireMode ? (activePin === 'top' ? '#1d4ed8' : '#ffffff') : 'rgba(0,0,0,0)'}
        stroke={wireMode ? '#1f2937' : 'rgba(0,0,0,0)'}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={18}
        onMouseDown={handlePinEvent('top')}
        onTouchStart={handlePinEvent('top')}
      />
      <Circle
        x={VOLTAGE_SOURCE_PIN_OFFSETS.bottom.x}
        y={VOLTAGE_SOURCE_PIN_OFFSETS.bottom.y}
        radius={wireMode ? 7 : 5}
        fill={wireMode ? (activePin === 'bottom' ? '#1d4ed8' : '#ffffff') : 'rgba(0,0,0,0)'}
        stroke={wireMode ? '#1f2937' : 'rgba(0,0,0,0)'}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={18}
        onMouseDown={handlePinEvent('bottom')}
        onTouchStart={handlePinEvent('bottom')}
      />

      {/* Voltage source circle */}
      <Circle
        radius={VOLTAGE_SOURCE_RADIUS}
        stroke={isSelected ? "#2563eb" : "black"}
        strokeWidth={isSelected ? 3 : 2}
        fill="white"
        shadowEnabled={isSelected}
        shadowBlur={12}
        shadowColor="#2563eb"
      />

      {/* + and - symbols */}
      <Text
        text="+"
        x={-5}
        y={-VOLTAGE_SOURCE_RADIUS + 5}
        fontSize={14}
        fontStyle="bold"
        fill="black"
      />
      <Text
        text="-"
        x={-4}
        y={VOLTAGE_SOURCE_RADIUS - 15}
        fontSize={14}
        fontStyle="bold"
        fill="black"
      />

      {/* Label for voltage */}
      <Text
        text={voltageLabel}
        x={-VOLTAGE_SOURCE_RADIUS - 10}
        y={VOLTAGE_SOURCE_RADIUS + 10}
        fontSize={12}
        fill="black"
      />
    </Group>
  );
}
