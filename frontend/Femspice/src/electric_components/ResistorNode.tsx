import { useEffect, useMemo, useState } from "react";
import { Group, Line, Rect, Text, Circle, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import resistorIcon from "@/assets/componentsIcons/Resistor.png";
import resistorIconWhite from "@/assets/componentsIcons/Resistor_white.png";

interface ResistorNodeProps {
  x?: number;
  y?: number;
  rotation?: number;
  resistance?: string | number;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  onPinPointerDown?: (pinId: string, event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  wireMode?: boolean;
  activePin?: string | null;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
  isDarkMode?: boolean;
}

const RESISTOR_WIDTH = 80;
const RESISTOR_HEIGHT = 25;
const RESISTOR_LEAD_LENGTH = 20;
const RESISTOR_ICON_MARGIN = 4;

export const RESISTOR_PIN_OFFSETS = {
  left: { x: -RESISTOR_WIDTH / 2 - RESISTOR_LEAD_LENGTH, y: 0 },
  right: { x: RESISTOR_WIDTH / 2 + RESISTOR_LEAD_LENGTH, y: 0 },
};

export default function ResistorNode({
  x = 0,
  y = 0,
  rotation = 0,
  resistance = '1kΩ',
  onDragMove,
  onDragEnd,
  onSelect,
  isSelected = false,
  onPinPointerDown,
  wireMode = false,
  activePin = null,
  onContextMenu,
  isDarkMode = false,
}: ResistorNodeProps) {
  const label = typeof resistance === 'number' ? `${resistance}Ω` : resistance;
  const [iconImage, setIconImage] = useState<HTMLImageElement | null>(null);

  const iconSource = useMemo(() => (isDarkMode ? resistorIconWhite : resistorIcon), [isDarkMode]);

  useEffect(() => {
    const img = new window.Image();
    img.src = iconSource;
    img.onload = () => setIconImage(img);
    return () => {
      img.onload = null;
    };
  }, [iconSource]);

  const handlePinEvent = (pinId: string) => (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    onPinPointerDown?.(pinId, event);
  };

  const selectionColor = "#3a3a36";
  const baseStroke = isDarkMode ? "#f8fafc" : "#3a3a36";
  const strokeColor = isSelected ? selectionColor : baseStroke;
  const leadColor = isDarkMode ? "#f8fafc" : "#3a3a36";
  const labelColor = isDarkMode ? "#f8fafc" : "black";
  const bodyFill = isDarkMode ? "#3a3a36" : "#ffffff";
  const inactivePinFill = isDarkMode ? "#3a3a36" : "#ffffff";
  const pinStroke = isDarkMode ? "#f8fafc" : "#3a3a36";

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
      {/* Leads */}
      <Line
        points={[RESISTOR_PIN_OFFSETS.left.x, 0, -RESISTOR_WIDTH / 2, 0]}
        stroke={leadColor}
        strokeWidth={2}
      />
      <Line
        points={[RESISTOR_WIDTH / 2, 0, RESISTOR_PIN_OFFSETS.right.x, 0]}
        stroke={leadColor}
        strokeWidth={2}
      />

      {/* Connection pins */}
      <Circle
        x={RESISTOR_PIN_OFFSETS.left.x}
        y={RESISTOR_PIN_OFFSETS.left.y}
        radius={wireMode ? 8 : 6}
        fill={wireMode ? (activePin === 'left' ? '#1d4ed8' : inactivePinFill) : 'rgba(0,0,0,0)'}
        stroke={wireMode ? pinStroke : 'rgba(0,0,0,0)'}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent('left')}
        onTouchStart={handlePinEvent('left')}
      />
      <Circle
        x={RESISTOR_PIN_OFFSETS.right.x}
        y={RESISTOR_PIN_OFFSETS.right.y}
        radius={wireMode ? 8 : 6}
        fill={wireMode ? (activePin === 'right' ? '#1d4ed8' : inactivePinFill) : 'rgba(0,0,0,0)'}
        stroke={wireMode ? pinStroke : 'rgba(0,0,0,0)'}
        strokeWidth={wireMode ? 1.5 : 0}
        opacity={wireMode ? 1 : 0}
        hitStrokeWidth={20}
        onMouseDown={handlePinEvent('right')}
        onTouchStart={handlePinEvent('right')}
      />

      {/* Resistor body */}
      <Rect
        x={-RESISTOR_WIDTH / 2}
        y={-RESISTOR_HEIGHT / 2}
        width={RESISTOR_WIDTH}
        height={RESISTOR_HEIGHT}
        fill={bodyFill}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={6}
        shadowEnabled={isSelected}
        shadowBlur={10}
  shadowColor={selectionColor}
      />

      {/* Icon inside resistor */}
      {iconImage ? (
        <KonvaImage
          image={iconImage}
          x={-RESISTOR_WIDTH / 2 + RESISTOR_ICON_MARGIN}
          y={-RESISTOR_HEIGHT / 2 + RESISTOR_ICON_MARGIN}
          width={RESISTOR_WIDTH - RESISTOR_ICON_MARGIN * 2}
          height={RESISTOR_HEIGHT - RESISTOR_ICON_MARGIN * 2}
          listening={false}
        />
      ) : (
        <Line
          points={[
            -RESISTOR_WIDTH / 2 + RESISTOR_ICON_MARGIN,
            0,
            -RESISTOR_WIDTH / 2 + 14,
            -RESISTOR_HEIGHT / 2 + 4,
            -RESISTOR_WIDTH / 2 + 22,
            RESISTOR_HEIGHT / 2 - 4,
            -RESISTOR_WIDTH / 2 + 30,
            -RESISTOR_HEIGHT / 2 + 4,
            -RESISTOR_WIDTH / 2 + 38,
            RESISTOR_HEIGHT / 2 - 4,
            -RESISTOR_WIDTH / 2 + 46,
            -RESISTOR_HEIGHT / 2 + 4,
            -RESISTOR_WIDTH / 2 + 54,
            RESISTOR_HEIGHT / 2 - 4,
            -RESISTOR_WIDTH / 2 + 62,
            -RESISTOR_HEIGHT / 2 + 4,
            RESISTOR_WIDTH / 2 - RESISTOR_ICON_MARGIN,
            0,
          ]}
          stroke={leadColor}
          strokeWidth={2}
          lineJoin="round"
          lineCap="round"
        />
      )}

      {/* Label */}
      <Text
        text={label}
        x={-RESISTOR_WIDTH / 2}
        y={RESISTOR_HEIGHT / 2 + 6}
        width={RESISTOR_WIDTH}
        align="center"
        fontSize={12}
        fill={labelColor}
      />
    </Group>
  );
}
