import { useEffect, useState } from "react";
import { Circle, Group, Image as KonvaImage, Line, Rect, Text } from "react-konva";
import type Konva from "konva";

import capacitorIcon from "@/assets/componentsIcons/capacitor.png";

interface CapacitorNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  capacitance?: string | number;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  onPinPointerDown?: (
    pinId: string,
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => void;
  wireMode?: boolean;
  activePin?: string | null;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}

const CAPACITOR_WIDTH = 80;
const CAPACITOR_HEIGHT = 25;
const CAPACITOR_LEAD_LENGTH = 20;

export const CAPACITOR_PIN_OFFSETS = {
  left: { x: -CAPACITOR_WIDTH / 2 - CAPACITOR_LEAD_LENGTH, y: 0 },
  right: { x: CAPACITOR_WIDTH / 2 + CAPACITOR_LEAD_LENGTH, y: 0 },
};

export default function CapacitorNode({
  x = 0,
  y = 0,
  rotation = 0,
  capacitance = "1µF",
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
}: CapacitorNodeProps) {
  const label = typeof capacitance === "number" ? `${capacitance}F` : capacitance;
  const [icon, setIcon] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = capacitorIcon;
    img.onload = () => setIcon(img);
    return () => {
      img.onload = null;
    };
  }, []);

  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
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
        points={[CAPACITOR_PIN_OFFSETS.left.x, 0, -CAPACITOR_WIDTH / 2, 0]}
        stroke="black"
        strokeWidth={2}
      />
      <Line
        points={[CAPACITOR_WIDTH / 2, 0, CAPACITOR_PIN_OFFSETS.right.x, 0]}
        stroke="black"
        strokeWidth={2}
      />

      <Circle
        x={CAPACITOR_PIN_OFFSETS.left.x}
        y={0}
        radius={wireMode ? 8 : 6}
        fill={wireMode ? (activePin === "left" ? "#1d4ed8" : "#ffffff") : "rgba(0,0,0,0)"}
        stroke={wireMode ? "#1f2937" : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent("left")}
        onTouchStart={handlePinEvent("left")}
      />
      <Circle
        x={CAPACITOR_PIN_OFFSETS.right.x}
        y={0}
        radius={wireMode ? 8 : 6}
        fill={wireMode ? (activePin === "right" ? "#1d4ed8" : "#ffffff") : "rgba(0,0,0,0)"}
        stroke={wireMode ? "#1f2937" : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent("right")}
        onTouchStart={handlePinEvent("right")}
      />

      <Rect
        x={-CAPACITOR_WIDTH / 2}
        y={-CAPACITOR_HEIGHT / 2}
        width={CAPACITOR_WIDTH}
        height={CAPACITOR_HEIGHT}
        fill="#ffffff"
        stroke={isSelected ? "#2563eb" : "black"}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={6}
        shadowEnabled={isSelected}
        shadowBlur={10}
        shadowColor="#2563eb"
      />

      {icon ? (
        <KonvaImage
          image={icon}
          x={-CAPACITOR_WIDTH / 2 + 8}
          y={-CAPACITOR_HEIGHT / 2 + 4}
          width={CAPACITOR_WIDTH - 16}
          height={CAPACITOR_HEIGHT - 8}
          listening={false}
        />
      ) : null}

      <Text
        text={label}
        x={-CAPACITOR_WIDTH / 2}
        y={CAPACITOR_HEIGHT / 2 + 6}
        width={CAPACITOR_WIDTH}
        align="center"
        fontSize={12}
        fill="black"
      />
    </Group>
  );
}
