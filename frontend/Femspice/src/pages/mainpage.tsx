
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent, FormEvent } from "react";
import Layout from "@/components/layout";
import { Stage, Layer, Rect , Line} from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import VoltageSourceNode, {
  VOLTAGE_SOURCE_PIN_OFFSETS,
} from "@/electric_components/VoltageSourceNode";
import ResistorNode, {
  RESISTOR_PIN_OFFSETS,
} from "@/electric_components/ResistorNode";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWireMode } from "@/context/wire-mode-context";
const DRAG_DATA_MIME = "application/femspice-component";


const PIN_DEFINITIONS = {
  resistor: RESISTOR_PIN_OFFSETS,
  voltageSource: VOLTAGE_SOURCE_PIN_OFFSETS,
} as const;

type ComponentConnections = Record<string, string[]>;
type ComponentType = keyof typeof PIN_DEFINITIONS;
type WireId = string;

type PinRef = {
  componentId: string;
  pinId: keyof typeof PIN_DEFINITIONS[ComponentType];
};

type CanvasWire = {
  id: WireId;
  from: PinRef;
  to: PinRef;
  points: number[];
  color?: string;
}

type CanvasComponent = {
  id: string;
  type: ComponentType | string;
  x: number;
  y: number;
  rotation: number;
  value?: number;
  title?: string;
  connections: ComponentConnections;
};


type ComponentDraft = {
  title: string;
  value: string;
  rotation: string;
};


export default function MainPage() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectorId, setInspectorId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComponentDraft>({
    title: "",
    value: "",
    rotation: "0",
  });
  const [wires, setWires] = useState<CanvasWire[]>([]);
  const [draftWire, setDraftWire] = useState<CanvasWire | null>(null);
  const activeComponent = useMemo(
    () => components.find((component) => component.id === inspectorId) ?? null,
    [components, inspectorId],
  );
  const { wireMode, setWireMode, toggleWireMode } = useWireMode();
  //Resize stage to fit container
  useEffect(() => {
    const updateStageSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setStageSize({ width: rect.width, height: rect.height });
    };

    updateStageSize();
    window.addEventListener("resize", updateStageSize);

    return () => {
      window.removeEventListener("resize", updateStageSize);
    };
  }, []);

  useEffect(() => {
    if (!activeComponent) {
      if (inspectorId) {
        setInspectorId(null);
      }

      setDraft({ title: "", value: "", rotation: "0" });
      return;
    }

    setDraft({
      title: activeComponent.title ?? "",
      value:
        activeComponent.value !== undefined ? String(activeComponent.value) : "",
      rotation: String(activeComponent.rotation ?? 0),
    });
  }, [activeComponent, inspectorId]);

  const handleSelect = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) {
        setInspectorId(null);
      }
    },
    [setInspectorId],
  );

  const handleEditRequest = useCallback(
    (id: string) => {
      handleSelect(id);
      setInspectorId(id);
    },
    [handleSelect],
  );
  //remove draft wire
  useEffect(() => {
    if (!draftWire) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
        setDraftWire((prev) =>
          prev && prev.points.length > 4
            ? { ...prev, points: prev.points.slice(0, -4).concat(prev.points.slice(-2)) }
            : prev
        );
      }
      if (event.key === "Escape") {
        setDraftWire(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [draftWire]);
  const handleStagePointerMove = useCallback(
    (event) => {
      if (!wireMode || !draftWire) return;
      const pointer = event.target.getStage()?.getPointerPosition();
      if (!pointer) return;

      setDraftWire((prev) =>
        prev
          ? {
              ...prev,
              points: [
                ...prev.points.slice(0, -2),
                pointer.x,
                pointer.y,
              ],
            }
          : prev
      );
    },
    [wireMode, draftWire]
  );

  function getPinPosition(component: CanvasComponent, pinId: string): { x: number; y: number } | null {
    const pinOffsets = PIN_DEFINITIONS[component.type as ComponentType];
    if (!pinOffsets) return null;

    const offset = pinOffsets[pinId as keyof typeof pinOffsets];
    if (!offset) return null;

    // Account for rotation
    const radians = (component.rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const rotatedX = offset.x * cos - offset.y * sin;
    const rotatedY = offset.x * sin + offset.y * cos;

    return {
      x: component.x + rotatedX,
      y: component.y + rotatedY,
    };
  }
  const recomputeWirePoints = useCallback(
    (wire: CanvasWire, componentMap: Map<string, CanvasComponent>) => {
      const fromComponent = componentMap.get(wire.from.componentId);
      const toComponent = componentMap.get(wire.to.componentId);

      if (!fromComponent || !toComponent) {
        return wire;
      }

      const fromPosition = getPinPosition(fromComponent, wire.from.pinId as string);
      const toPosition = getPinPosition(toComponent, wire.to.pinId as string);

      if (!fromPosition || !toPosition) {
        return wire;
      }

      const existingIntermediate = wire.points.slice(2, -2);

      return {
        ...wire,
        points: [
          fromPosition.x,
          fromPosition.y,
          ...existingIntermediate,
          toPosition.x,
          toPosition.y,
        ],
      };
    },
    [getPinPosition]
  );
  const handleDragOver = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);
    const handleComponentDragEnd = useCallback(
    (componentId: string, event: KonvaEventObject<DragEvent>) => {
      const { x, y } = event.target.position();
      setComponents((prevComponents) =>
        prevComponents.map((component) =>
          component.id === componentId ? { ...component, x, y } : component
        )
      );

      setWires((prevWires) => {
        if (prevWires.length === 0) return prevWires;

        const componentMap = new Map<string, CanvasComponent>(
          (
            components.map((component) => [component.id, component]) as Array<
              [string, CanvasComponent]
            >
          ).map(([id, component]) => [
            id,
            id === componentId ? { ...component, x, y } : component,
          ])
        );

        return prevWires.map((wire) => {
          if (
            wire.from.componentId !== componentId &&
            wire.to.componentId !== componentId
          ) {
            return wire;
          }
          return recomputeWirePoints(wire, componentMap);
        });
      });
    },
    [components, recomputeWirePoints]
  );
  const handlePinPointerDown = useCallback(
    (componentID: string, pinId: string, event: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!wireMode) return;
      event.evt.preventDefault();
      const component = components.find(c => c.id === componentID);
      if (!component) return;

      const pointerPosition = event.target.getStage()?.getPointerPosition();
      const pinPosition = getPinPosition(component, pinId);
      if (!pointerPosition || !pinPosition) return;
      if (!draftWire) {
        const newWire: CanvasWire = {
          id: `wire-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          from: { componentId: componentID, pinId: pinId as keyof typeof PIN_DEFINITIONS[ComponentType] },
          to: { componentId: componentID, pinId: pinId as keyof typeof PIN_DEFINITIONS[ComponentType] },
          points: [pinPosition.x, pinPosition.y, pointerPosition.x, pointerPosition.y],
          color: "#1f2937",
        };
        setDraftWire(newWire);
        return;
      }
      if (draftWire.from.componentId === componentID && draftWire.from.pinId === pinId) {
        setDraftWire(null);
        return;
      }
      const targetComponent = components.find((item) => item.id === draftWire.from.componentId);
      if (!targetComponent) {
        setDraftWire(null);
        return;
      }

      const releaseComponent = components.find((item) => item.id === componentID);
      if (!releaseComponent) {
        setDraftWire(null);
        return;
      }
      const releasePinPosition = getPinPosition(releaseComponent, pinId);
      if (!releasePinPosition) {
        setDraftWire(null);
        return;
      }
      const finalizedWire: CanvasWire = {
        ...draftWire,
        to: {
          componentId: componentID,
          pinId: pinId as keyof typeof PIN_DEFINITIONS[ComponentType],
        },
        points: [
          ...draftWire.points.slice(0, -2), // all locked segments
          releasePinPosition.x,
          releasePinPosition.y,             // final endpoint
        ],
      };
      setWires((prevWires) => [...prevWires, finalizedWire]);
      setDraftWire(null);

      setComponents((prev) => 
        prev.map((component) => {
        if (component.id === targetComponent.id) {
          return {
            ...component,
            connections: {
              ...component.connections,
              [draftWire.from.pinId]: [
                ...(component.connections[draftWire.from.pinId] || []),
                componentID,
              ],
            },
          };
        }
        if (component.id === componentID) {
          return {
            ...component,
            connections: {
              ...component.connections,
              [pinId]: [
                ...(component.connections[pinId] || []),
                draftWire.from.componentId,
              ],
            },
          };
        }
        return component;
      }),
    );
    }, [wireMode, components, draftWire]
  );  
  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const dataString = event.dataTransfer?.getData(DRAG_DATA_MIME);
      if (!dataString) {
        return;
      }

      let payload: { type?: string; value?: number; title?: string };
      try {
        payload = JSON.parse(dataString);
      } catch (error) {
        console.error("Failed to parse drag payload", error);
        return;
      }

      const componentType = payload.type;
      if (!componentType) {
        console.error("Drag payload missing component type", payload);
        return;
      }

      const stage = stageRef.current;
      if (!stage) return;

      const stageRect = stage.container().getBoundingClientRect();
      const dropPosition = {
        x: event.clientX - stageRect.left,
        y: event.clientY - stageRect.top,
      };

      const newId = `${componentType}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      setComponents((prevComponents) => [
        ...prevComponents,
        {
          id: newId,
          type: componentType,
          x: dropPosition.x,
          y: dropPosition.y,
          rotation: 0,
          value: payload.value,
          title: payload.title,
          connections: {},
        },
      ]);

      handleSelect(newId);
    },
    [handleSelect],
  );

  const handleDraftChange = useCallback(
    (field: keyof ComponentDraft, value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );
  //wire mode effect remove selection and inspector
  useEffect(() => {
    if (wireMode) {
      setSelectedId(null);
      setInspectorId(null);
    }
  }, [wireMode]);
  const handleInspectorSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!activeComponent) {
        return;
      }

      const trimmedTitle = draft.title.trim();
      const parsedValue = draft.value.trim();
      const parsedRotation = Number.parseFloat(draft.rotation);
      const nextRotation = Number.isNaN(parsedRotation)
        ? activeComponent.rotation
        : parsedRotation;

      let nextValue: number | undefined;
      if (parsedValue === "") {
        nextValue = undefined;
      } else {
        const numericValue = Number.parseFloat(parsedValue);
        nextValue = Number.isNaN(numericValue)
          ? activeComponent.value
          : numericValue;
      }

      setComponents((prev) =>
        prev.map((component) =>
          component.id === activeComponent.id
            ? {
                ...component,
                title: trimmedTitle === "" ? undefined : trimmedTitle,
                value: nextValue,
                rotation: nextRotation,
              }
            : component,
        ),
      );
    },
    [activeComponent, draft, setComponents],
  );

  const handleInspectorClose = useCallback(() => {
    setInspectorId(null);
    if (wireMode) {
      toggleWireMode();
    }
  }, []);

  const rotateSelected = useCallback(() => {
    if (!selectedId) return;

    setComponents((prevComponents) =>
      prevComponents.map((component) =>
        component.id === selectedId
          ? { ...component, rotation: component.rotation + 90 }
          : component
      )
    );

    setWires((prevWires) => {
      if (prevWires.length === 0) return prevWires;

      const componentMap = new Map<string, CanvasComponent>(
        components.map((component) => [
          component.id,
          component.id === selectedId
            ? { ...component, rotation: component.rotation + 90 }
            : component,
        ])
      );

      return prevWires.map((wire) => {
        if (
          wire.from.componentId !== selectedId &&
          wire.to.componentId !== selectedId
        ) {
          return wire;
        }
        return recomputeWirePoints(wire, componentMap);
      });
    });
  }, [selectedId, components, recomputeWirePoints]);
  //Delete selected wire
  useEffect(() => {
  if (!selectedWireId) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Delete" && event.key !== "Backspace") return;

    setWires((prevWires) => {
      const wireToRemove = prevWires.find((wire) => wire.id === selectedWireId);
      if (!wireToRemove) return prevWires;

      setComponents((prevComponents) =>
        prevComponents.map((component) => {
          if (
            component.id !== wireToRemove.from.componentId &&
            component.id !== wireToRemove.to.componentId
          ) {
            return component;
          }

          const updatedConnections = Object.fromEntries(
            Object.entries(component.connections).map(([pin, targets]) => {
              const filtered = targets.filter((targetId) =>
                component.id === wireToRemove.from.componentId
                  ? targetId !== wireToRemove.to.componentId
                  : targetId !== wireToRemove.from.componentId
              );
              return filtered.length > 0 ? [pin, filtered] : [pin, []];
            })
          );

          // Optional: strip empty arrays entirely
          Object.keys(updatedConnections).forEach((pin) => {
            if (updatedConnections[pin]?.length === 0) {
              delete updatedConnections[pin];
            }
          });

          return { ...component, connections: updatedConnections };
        })
      );

      return prevWires.filter((wire) => wire.id !== selectedWireId);
    });

    setSelectedWireId(null);
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [selectedWireId]);
  //Rotate
  useEffect(() => {
    if (!selectedId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "r" &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        rotateSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, rotateSelected]);

  const handleNodeContextMenu = useCallback(
    (componentId: string, event: KonvaEventObject<PointerEvent>) => {
      event.evt.preventDefault();
      handleEditRequest(componentId);
    },
    [handleEditRequest],
  );

  function renderComponent(component: CanvasComponent) {
    const isSelected = selectedId === component.id;

    switch (component.type) {
      case "resistor":
        return (
          <ResistorNode
            key={component.id}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            resistance={component.value ? `${component.value}Ω` : "1kΩ"}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
          />
        );
      case "voltageSource":
        return (
          <VoltageSourceNode
            key={component.id}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            voltage={component.value ? `${component.value}V` : "5V"}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
          />
        );
      default:
        return (
          <Rect
            key={component.id}
            x={component.x}
            y={component.y}
            width={50}
            height={50}
            fill="gray"
            stroke={isSelected ? "#2563eb" : "transparent"}
            strokeWidth={isSelected ? 3 : 0}
            shadowEnabled={isSelected}
            shadowBlur={8}
            draggable
            onClick={() => handleSelect(component.id)}
            onTap={() => handleSelect(component.id)}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
          />
        );
    }
  }
  const handleStagePointerDown = useCallback(
    (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!wireMode || !draftWire) {
        if (event.target === event.target.getStage()) {
          handleSelect(null);
        }
        return;
      }

      const stage = event.target.getStage();
      const pointer = stage?.getPointerPosition();
      const clickedStage = event.target === stage;

      if (!pointer) return;
      if (!wireMode || !draftWire) {
        if (clickedStage) {
          setSelectedWireId(null);
          handleSelect(null);
        }
        return;
      }
      setDraftWire((prev) =>
        prev
          ? {
              ...prev,
              points: [
                ...prev.points.slice(0, -2),
                pointer.x,
                pointer.y,
                pointer.x,
                pointer.y,
              ],
            }
          : prev
      );
    },
    [wireMode, draftWire, handleSelect]
  );
  const valueFieldLabel =
    activeComponent?.type === "resistor"
      ? "Resistance (Ω)"
      : activeComponent?.type === "voltageSource"
        ? "Voltage (V)"
        : "Value";

  const valueFieldPlaceholder =
    activeComponent?.type === "resistor"
      ? "Enter resistance"
      : activeComponent?.type === "voltageSource"
        ? "Enter voltage"
        : "Enter value";
  return (
    <Layout>
      <div
        ref={containerRef}
        className="flex-1 h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={(event) => {
            if (event.target === event.target.getStage()) {
              handleSelect(null);
            }
          }}
          onTouchStart={(event) => {
            if (event.target === event.target.getStage()) {
              handleSelect(null);
            }
          }}
          onContextMenu={(event) => {
            if (event.target === event.target.getStage()) {
              event.evt.preventDefault();
              handleSelect(null);
            }
          }}
          onPointerMove={handleStagePointerMove}
          onPointerDown={handleStagePointerDown}
        >
          {/* Render components here */}
          <Layer>
            {wires.map((wire) => (
              <Line
                key={wire.id}
                points={wire.points}
                stroke={selectedWireId === wire.id ? "#2563eb" : wire.color ?? "#1f2937"}
                strokeWidth={selectedWireId === wire.id ? 4 : 2}
                lineCap="round"
                lineJoin="round"
                onMouseDown={(event) => {
                  event.cancelBubble = true;          // don’t let Stage clear it
                  setSelectedWireId(wire.id);
                  setSelectedId(null);
                  setInspectorId(null);
                }}
              />

            ))}
            {draftWire && (
              <Line
                points={draftWire.points}
                stroke={draftWire.color || "#3b82f6"}
                strokeWidth={3}
                dash={[8, 8]}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </Layer>
          <Layer>
            {components.map((component) => renderComponent(component))}
          </Layer>
        </Stage>
      </div>
      <Sheet
        open={Boolean(inspectorId)}
        onOpenChange={(open) => {
          if (!open) {
            handleInspectorClose();
          }
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit component</SheetTitle>
            <SheetDescription>
              {activeComponent
                ? `Update the properties for ${activeComponent.title ?? activeComponent.type}`
                : "Select a component to edit its properties."}
            </SheetDescription>
          </SheetHeader>
          {activeComponent ? (
            <form
              className="flex flex-1 flex-col gap-4 px-4 pb-6"
              onSubmit={handleInspectorSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor={`${activeComponent.id}-title`}>Label</Label>
                <Input
                  id={`${activeComponent.id}-title`}
                  placeholder="Optional label"
                  value={draft.title}
                  onChange={(event) => handleDraftChange("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${activeComponent.id}-value`}>
                  {valueFieldLabel}
                </Label>
                <Input
                  id={`${activeComponent.id}-value`}
                  type="number"
                  placeholder={`${valueFieldPlaceholder} (optional)`}
                  value={draft.value}
                  onChange={(event) => handleDraftChange("value", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${activeComponent.id}-rotation`}>
                  Rotation (°)
                </Label>
                <Input
                  id={`${activeComponent.id}-rotation`}
                  type="number"
                  step={15}
                  value={draft.rotation}
                  onChange={(event) => handleDraftChange("rotation", event.target.value)}
                />
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="submit">Save changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleInspectorClose}
                >
                  Close
                </Button>
              </div>
            </form>
          ) : (
            <div className="px-4 pb-6 text-sm text-muted-foreground">
              Select a component to edit its properties.
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  )
}
