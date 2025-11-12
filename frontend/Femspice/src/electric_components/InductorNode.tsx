import { useEffect, useMemo, useState } from "react";
import { Circle, Group, Image as KonvaImage, Line, Rect, Text } from "react-konva";
import type Konva from "konva";

import inductorIcon from "@/assets/componentsIcons/inductor.png";
import inductorIconWhite from "@/assets/componentsIcons/inductor_white.png";

interface InductorNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  inductance?: string | number;
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
  isDarkMode?: boolean;
}

const INDUCTOR_WIDTH = 80;
const INDUCTOR_HEIGHT = 25;
const INDUCTOR_LEAD_LENGTH = 20;

export const INDUCTOR_PIN_OFFSETS = {
  left: { x: -INDUCTOR_WIDTH / 2 - INDUCTOR_LEAD_LENGTH, y: 0 },
  right: { x: INDUCTOR_WIDTH / 2 + INDUCTOR_LEAD_LENGTH, y: 0 },
};

export default function InductorNode({
  x = 0,
  y = 0,
  rotation = 0,
  inductance = "10mH",
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
  isDarkMode = false,
}: InductorNodeProps) {
  const label = typeof inductance === "number" ? `${inductance}H` : inductance;
  const [icon, setIcon] = useState<HTMLImageElement | null>(null);

  const iconSource = useMemo(() => (isDarkMode ? inductorIconWhite : inductorIcon), [isDarkMode]);

  useEffect(() => {
    const img = new window.Image();
    img.src = iconSource;
    img.onload = () => setIcon(img);
    return () => {
      img.onload = null;
    };
  }, [iconSource]);

  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    event.cancelBubble = true;
    onPinPointerDown?.(pinId, event);
  };

  const selectionColor = "#3a3a36";
  const baseStroke = isDarkMode ? "#f8fafc" : "black";
  const strokeColor = isSelected ? selectionColor : baseStroke;
  const leadColor = isDarkMode ? "#f8fafc" : "black";
  const labelColor = isDarkMode ? "#f8fafc" : "black";
  const bodyFill = isDarkMode ? "#3a3a36" : "#ffffff";
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
        points={[INDUCTOR_PIN_OFFSETS.left.x, 0, -INDUCTOR_WIDTH / 2, 0]}
        stroke={leadColor}
        strokeWidth={2}
      />
      <Line
        points={[INDUCTOR_WIDTH / 2, 0, INDUCTOR_PIN_OFFSETS.right.x, 0]}
        stroke={leadColor}
        strokeWidth={2}
      />

      <Circle
        x={INDUCTOR_PIN_OFFSETS.left.x}
        y={0}
        radius={wireMode ? 8 : 6}
  fill={wireMode ? (activePin === "left" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
  stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent("left")}
        onTouchStart={handlePinEvent("left")}
      />
      <Circle
        x={INDUCTOR_PIN_OFFSETS.right.x}
        y={0}
        radius={wireMode ? 8 : 6}
  fill={wireMode ? (activePin === "right" ? "#1d4ed8" : inactivePinFill) : "rgba(0,0,0,0)"}
  stroke={wireMode ? pinStroke : "rgba(0,0,0,0)"}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent("right")}
        onTouchStart={handlePinEvent("right")}
      />

      <Rect
        x={-INDUCTOR_WIDTH / 2}
        y={-INDUCTOR_HEIGHT / 2}
        width={INDUCTOR_WIDTH}
        height={INDUCTOR_HEIGHT}
        fill={bodyFill}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={6}
        shadowEnabled={isSelected}
        shadowBlur={10}
  shadowColor={selectionColor}
      />

      {icon ? (
        <KonvaImage
          image={icon}
          x={-INDUCTOR_WIDTH / 2 + 8}
          y={-INDUCTOR_HEIGHT / 2 + 4}
          width={INDUCTOR_WIDTH - 16}
          height={INDUCTOR_HEIGHT - 8}
          listening={false}
        />
      ) : null}

      <Text
        text={label}
        x={-INDUCTOR_WIDTH / 2}
        y={INDUCTOR_HEIGHT / 2 + 6}
        width={INDUCTOR_WIDTH}
        align="center"
        fontSize={12}
        fill={labelColor}
      />
    </Group>
  );
}
