
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent, FormEvent } from "react";
import Layout from "@/components/layout";
import { Stage, Layer, Rect, Line, Group, Label as KonvaLabel, Tag as KonvaTag, Text as KonvaText } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import VoltageSourceNode, {
  VOLTAGE_SOURCE_PIN_OFFSETS,
} from "@/electric_components/VoltageSourceNode";
import ResistorNode, {
  RESISTOR_PIN_OFFSETS,
} from "@/electric_components/ResistorNode";
import CapacitorNode, {
  CAPACITOR_PIN_OFFSETS,
} from "@/electric_components/CapacitorNode";
import InductorNode, {
  INDUCTOR_PIN_OFFSETS,
} from "@/electric_components/InductorNode";
import GroundNode, {
  GROUND_PIN_OFFSETS,
} from "@/electric_components/GroundNode";
import CurrentSourceNode, {
  CURRENT_SOURCE_PIN_OFFSETS,
} from "@/electric_components/CurrentSourceNode";
import PulseVoltageSourceNode, {
  PULSE_VOLTAGE_SOURCE_PIN_OFFSETS,
  type PulseSettings,
} from "@/electric_components/PulseVoltageSourceNode";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const DRAG_DATA_MIME = "application/femspice-component";

const LIGHT_WIRE_COLOR = "#000000";
const DARK_WIRE_COLOR = "#f8fafc";
const DEFAULT_WIRE_COLORS = new Set([
  LIGHT_WIRE_COLOR,
  DARK_WIRE_COLOR,
  "#000000",
  "#000000ff",
  "#ffffff",
]);

const normalizeColorHex = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();


const PIN_DEFINITIONS = {
  resistor: RESISTOR_PIN_OFFSETS,
  voltageSource: VOLTAGE_SOURCE_PIN_OFFSETS,
  capacitor: CAPACITOR_PIN_OFFSETS,
  inductor: INDUCTOR_PIN_OFFSETS,
  ground: GROUND_PIN_OFFSETS,
  currentSource: CURRENT_SOURCE_PIN_OFFSETS,
  pulseVoltageSource: PULSE_VOLTAGE_SOURCE_PIN_OFFSETS,
} as const;

const isSupportedComponentType = (type: string): type is ComponentType =>
  type in PIN_DEFINITIONS;

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
  pulseSettings?: PulseSettings;
};


type ComponentDraft = {
  title: string;
  value: string;
  rotation: string;
  pulseInitial: string;
  pulseValue: string;
  pulseWidth: string;
  pulsePeriod: string;
};

type SimulationApiResponse = {
  result?: {
    node_voltages?: Record<string, number | null>;
    component_currents?: Record<string, number | null>;
  };
  mappings?: Record<string, string>;
  components_mapping?: Record<string, string>;
};

type SimulationState = {
  nodeVoltages: Record<string, number>;
  componentCurrents: Record<string, number | null>;
  pinToNode: Record<string, string>;
  componentMapping: Record<string, string>;
};

const normalizeNodeName = (node: string) => node.trim().toUpperCase();

const normalizeNumeric = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }
    const parsed = Number.parseFloat(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const normalizePulseSettings = (input: unknown): PulseSettings | undefined => {
  if (!input || typeof input !== "object") {
    return undefined;
  }

  const source = input as Record<string, unknown>;

  const nestedPulse = (() => {
    const nestedCandidates = [source.pulseSettings, source.pulse_settings];
    for (const candidate of nestedCandidates) {
      if (candidate && typeof candidate === "object") {
        const normalized = normalizePulseSettings(candidate);
        if (normalized) {
          return normalized;
        }
      }
    }
    return undefined;
  })();

  const extractNumeric = (raw: unknown): number | undefined => {
    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        return undefined;
      }
      return normalizeNumeric(raw[0]);
    }
    return normalizeNumeric(raw);
  };

  const initialRaw =
    source.initialValue ??
    source.initial_value ??
    source.initial ??
    source.initial_val ??
    source.initialVoltage;

  const pulseValueRaw = source.pulseValue ?? source.pulse_value;
  const pulseWidthRaw = source.pulseWidth ?? source.pulse_width;
  const periodRaw = source.period ?? source.pulse_period;

  const normalized: PulseSettings = {
    initialValue: extractNumeric(initialRaw) ?? nestedPulse?.initialValue,
    pulseValue: extractNumeric(pulseValueRaw) ?? nestedPulse?.pulseValue,
    pulseWidth: extractNumeric(pulseWidthRaw) ?? nestedPulse?.pulseWidth,
    period: extractNumeric(periodRaw) ?? nestedPulse?.period,
  };

  return Object.values(normalized).some((value) => value !== undefined)
    ? normalized
    : undefined;
};

const getWireLabelPosition = (points: number[]): { x: number; y: number } | null => {
  if (points.length < 4) {
    return null;
  }

  const x1 = points[0];
  const y1 = points[1];
  const x2 = points[points.length - 2];
  const y2 = points[points.length - 1];

  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
};

const formatVoltage = (value: number) => `${value.toFixed(3)} V`;
const formatCurrent = (value: number) => `${value.toFixed(3)} A`;

const isEditableElement = (element: Element | null): boolean => {
  if (!element) {
    return false;
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return true;
  }

  return element instanceof HTMLElement ? element.isContentEditable : false;
};


export default function MainPage() {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectorId, setInspectorId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveDescription, setSaveDescription] = useState("");
  const [searchParams] = useSearchParams();
  const [graphsrc, setGraphsrc] = useState<string>("");
  const [isGraphDialogOpen, setIsGraphDialogOpen] = useState(false);
  const openSaveDialog = useCallback(() => {
    setSaveName("");
    setIsSaveDialogOpen(true);
  }, []);
  const hasLoadedRef = useRef(false);
  const [draft, setDraft] = useState<ComponentDraft>({
    title: "",
    value: "",
    rotation: "0",
    pulseInitial: "",
    pulseValue: "",
    pulseWidth: "",
    pulsePeriod: "",
  });
  const [wires, setWires] = useState<CanvasWire[]>([]);
  const [draftWire, setDraftWire] = useState<CanvasWire | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationState | null>(null);
  const [circuitMode, setCircuitMode] = useState<"dc" | "ac">("dc");
  const [measurementMode, setMeasurementMode] = useState<"voltage" | "current">("voltage");
  const activeComponent = useMemo(
    () => components.find((component) => component.id === inspectorId) ?? null,
    [components, inspectorId],
  );
  const { wireMode, toggleWireMode } = useWireMode();
  const wireColor = isDarkMode ? DARK_WIRE_COLOR : LIGHT_WIRE_COLOR;
  const measurementTagFill = isDarkMode ? "rgba(0,0,0,0.85)" : "rgba(255, 255, 255, 0.85)";
  const measurementTagStroke = isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.6)";
  const measurementTextColor = isDarkMode ? "#f8fafc" : "#000000ff";
  const previousWireColorRef = useRef(wireColor);
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);
  useEffect(() => {
    const previousWireColor = previousWireColorRef.current;
    const knownDefaults = new Set([
      ...DEFAULT_WIRE_COLORS,
      normalizeColorHex(previousWireColor),
    ]);

    setWires((prevWires) =>
      prevWires.map((wire) => {
        const wireColorKey = normalizeColorHex(
          typeof wire.color === "string" ? wire.color : undefined,
        );
        if (!wire.color || knownDefaults.has(wireColorKey)) {
          return { ...wire, color: wireColor };
        }
        return wire;
      })
    );

    setDraftWire((prevDraft) => {
      if (!prevDraft) {
        return prevDraft;
      }

      const draftColorKey = normalizeColorHex(prevDraft.color);
      if (!prevDraft.color || knownDefaults.has(draftColorKey)) {
        return { ...prevDraft, color: wireColor };
      }

      return prevDraft;
    });

    previousWireColorRef.current = wireColor;
  }, [wireColor]);
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
    const circuitId = searchParams.get("id");
    if (!circuitId || hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    const fetchCircuit = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/simulate/load/${circuitId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Loaded circuit data:", data);
        const normalizedComponents: CanvasComponent[] = (data.components ?? []).map(
          (component: any) => {
            const pulseSettings =
              normalizePulseSettings(component) ??
              normalizePulseSettings(component.pulseSettings) ??
              normalizePulseSettings(component.pulse_settings);

            const valueFromArray = Array.isArray(component?.initial_value)
              ? normalizeNumeric(component.initial_value[0])
              : undefined;
            const normalizedValue = normalizeNumeric(component.value);
            const resolvedValue =
              component.type === "pulseVoltageSource"
                ? pulseSettings?.initialValue ?? valueFromArray ?? normalizedValue
                : normalizedValue;

            const resolvedPosition =
              typeof component.position === "object" && component.position
                ? component.position
                : undefined;

            const connections =
              component.connections && typeof component.connections === "object"
                ? (component.connections as ComponentConnections)
                : ({} as ComponentConnections);

            const normalizedComponent: CanvasComponent = {
              id: String(component.id ?? ""),
              type: String(component.type ?? ""),
              x:
                typeof component.x === "number"
                  ? component.x
                  : normalizeNumeric(resolvedPosition?.x) ?? 0,
              y:
                typeof component.y === "number"
                  ? component.y
                  : normalizeNumeric(resolvedPosition?.y) ?? 0,
              rotation: normalizeNumeric(component.rotation) ?? 0,
              value: resolvedValue,
              title:
                component.title === null || component.title === undefined
                  ? undefined
                  : String(component.title),
              connections,
              pulseSettings,
            };

            return normalizedComponent;
          },
        );
        setComponents(normalizedComponents);
        const normalizedWires: CanvasWire[] = (data.wires ?? []).map((wire: any) => {
          const { from_, ...rest } = wire;
          const savedColor =
            typeof wire.color === "string" ? wire.color : undefined;
          const normalizedColor =
            savedColor &&
            !DEFAULT_WIRE_COLORS.has(normalizeColorHex(savedColor))
              ? savedColor
              : wireColor;
          return {
            ...rest,
            from: from_,
            color: normalizedColor,
          };
        });
        setWires(normalizedWires);
      } catch (error) {
        console.error("Error loading circuit:", error);
      }
    };

    fetchCircuit();
  }, [searchParams]);
  useEffect(() => {
    if (!activeComponent) {
      if (inspectorId) {
        setInspectorId(null);
      }

        setDraft({
          title: "",
          value: "",
          rotation: "0",
          pulseInitial: "",
          pulseValue: "",
          pulseWidth: "",
          pulsePeriod: "",
        });
      return;
    }

    setDraft({
      title: activeComponent.title ?? "",
      value:
        activeComponent.value !== undefined ? String(activeComponent.value) : "",
      rotation: String(activeComponent.rotation ?? 0),
      pulseInitial:
        activeComponent.pulseSettings?.initialValue !== undefined &&
        activeComponent.pulseSettings?.initialValue !== null
          ? String(activeComponent.pulseSettings.initialValue)
          : "",
      pulseValue:
        activeComponent.pulseSettings?.pulseValue !== undefined &&
        activeComponent.pulseSettings?.pulseValue !== null
          ? String(activeComponent.pulseSettings.pulseValue)
          : "",
      pulseWidth:
        activeComponent.pulseSettings?.pulseWidth !== undefined &&
        activeComponent.pulseSettings?.pulseWidth !== null
          ? String(activeComponent.pulseSettings.pulseWidth)
          : "",
      pulsePeriod:
        activeComponent.pulseSettings?.period !== undefined &&
        activeComponent.pulseSettings?.period !== null
          ? String(activeComponent.pulseSettings.period)
          : "",
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
        const activeElement = typeof document !== "undefined" ? document.activeElement : null;
        if (isEditableElement(activeElement)) {
          return;
        }

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
    (event: KonvaEventObject<PointerEvent>) => {
      if (!wireMode) return;
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
    [wireMode]
  );

  function getPinPosition(
    component: CanvasComponent,
    pinId: string,
  ): { x: number; y: number } | null {
    if (!isSupportedComponentType(component.type)) {
      return null;
    }

    const pinOffsets = PIN_DEFINITIONS[component.type] as Record<
      string,
      { x: number; y: number }
    >;
    const offset = pinOffsets[pinId];

    if (!offset) {
      return null;
    }

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
          color: wireColor,
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
    }, [wireMode, components, draftWire, wireColor]
  );  
  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const dataString = event.dataTransfer?.getData(DRAG_DATA_MIME);
      if (!dataString) {
        return;
      }

  let payload: { type?: string; value?: number; title?: string; pulseSettings?: PulseSettings };
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

      const defaultPulseSettings: PulseSettings | undefined =
        componentType === "pulseVoltageSource"
          ? payload.pulseSettings ?? {
              initialValue: 0,
              pulseValue: 10,
              pulseWidth: 0.01,
              period: 0.02,
            }
          : undefined;

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

      const initialValue =
        componentType === "pulseVoltageSource"
          ? defaultPulseSettings?.initialValue ?? undefined
          : payload.value;

      setComponents((prevComponents) => [
        ...prevComponents,
        {
          id: newId,
          type: componentType,
          x: dropPosition.x,
          y: dropPosition.y,
          rotation: 0,
          value: initialValue,
          title: payload.title,
          connections: {},
          pulseSettings: defaultPulseSettings,
        },
      ]);

      handleSelect(newId);
    },
    [handleSelect],
  );

  const applySimulationResult = useCallback((data: SimulationApiResponse) => {
    const nodeVoltages: Record<string, number> = {};
    const rawNodeVoltages = data.result?.node_voltages ?? {};
    Object.entries(rawNodeVoltages).forEach(([node, value]) => {
      if (typeof value === "number") {
        nodeVoltages[normalizeNodeName(node)] = value;
      }
    });

    const pinToNodeEntries = Object.entries(data.mappings ?? {}).map(
      ([pinRef, nodeName]) => [pinRef, normalizeNodeName(nodeName)],
    );

    setSimulationResult({
      nodeVoltages,
      componentCurrents: data.result?.component_currents ?? {},
      pinToNode: Object.fromEntries(pinToNodeEntries),
      componentMapping: data.components_mapping ?? {},
    });
  }, []);

  const wireAnnotations = useMemo(() => {
    if (!simulationResult || measurementMode !== "voltage") {
      return new Map<string, number>();
    }

    const annotations = new Map<string, number>();

    wires.forEach((wire) => {
      const fromKey = `${wire.from.componentId}:${wire.from.pinId}`;
      const toKey = `${wire.to.componentId}:${wire.to.pinId}`;
      const fromNode = simulationResult.pinToNode[fromKey];
      const toNode = simulationResult.pinToNode[toKey];

      if (!fromNode || fromNode !== toNode) {
        return;
      }

      const rawVoltage = simulationResult.nodeVoltages[fromNode];
      const voltage =
        typeof rawVoltage === "number"
          ? rawVoltage
          : fromNode === "0"
            ? 0
            : undefined;

      if (voltage === undefined) {
        return;
      }

      annotations.set(wire.id, voltage);
    });

    return annotations;
  }, [simulationResult, wires, measurementMode]);

  const componentCurrentAnnotations = useMemo(() => {
    if (!simulationResult || measurementMode !== "current") {
      return new Map<string, number>();
    }

    const annotations = new Map<string, number>();

    components.forEach((component) => {
      const spiceName = simulationResult.componentMapping[component.id];
      if (!spiceName) {
        return;
      }

      const current = simulationResult.componentCurrents[spiceName];
      if (current === null || current === undefined) {
        return;
      }

      annotations.set(component.id, current);
    });

    return annotations;
  }, [components, measurementMode, simulationResult]);

  const handleRunCircuit = useCallback(async () => {
    let simulateAC = false;
    if (circuitMode !== "dc" ) {
      simulateAC = true;
    }
    if (!simulateAC) {
      const payload = {
        components: components.map((component) => {
          const base = {
          id: component.id,
          type: component.type,
          position: { x: component.x, y: component.y },
          rotation: component.rotation,
          value: component.value ?? null,
          title: component.title ?? null,
          connections: component.connections,
        };

        if (component.type === "pulseVoltageSource") {
          const initialValue =
            component.pulseSettings?.initialValue ?? component.value ?? 0;

          return {
            ...base,
            value: initialValue ?? null,
            initial_value: [initialValue ?? 0, "", "volt"],
            pulse_value: component.pulseSettings?.pulseValue ?? null,
            pulse_width: component.pulseSettings?.pulseWidth ?? null,
            period: component.pulseSettings?.period ?? null,
          };
        }

        return base;
      }),
      wires: wires.map((wire) => ({
        id: wire.id,
        from: wire.from,
        to: wire.to,
        points: wire.points,
        color: wire.color ?? wireColor,
      })),
    };

    setSimulationResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/simulate/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Simulation request payload:", payload);

      if (!response.ok) {
        if (response.status === 400) {
          let message = "No ground detected. Add a ground component and try again.";
          try {
            const errorBody = await response.json();
            const detail =
              typeof errorBody?.detail === "string"
                ? errorBody.detail
                : typeof errorBody?.message === "string"
                  ? errorBody.message
                  : null;
            if (detail && detail.trim().length > 0) {
              message = detail;
            }
          } catch (parseError) {
            console.debug("Failed to parse 400 response", parseError);
          }
          toast.error(message, { duration: 4000 });
          return;
        }

        throw new Error(`Simulation request failed (${response.status})`);
      }

      const data = (await response.json()) as SimulationApiResponse;
      applySimulationResult(data);
      console.log(data);
    } catch (error) {
      toast.error("Unable to run the simulation. Please try again.");
      console.groupCollapsed("[FEMspice] Simulation fallback");
      console.log("Payload", payload);
      console.warn(
        "Simulation request failed or endpoint not configured. Using sample response. Replace with real API endpoint when available.",
      );
      console.error(error);
      console.groupEnd();
    }
    }

    else {
      const payload = {
        components: components.map((component) => {
          const base = {
          id: component.id,
          type: component.type,
          position: { x: component.x, y: component.y },
          rotation: component.rotation,
          value: component.value ?? null,
          title: component.title ?? null,
          connections: component.connections,
        };
        if (component.type === "pulseVoltageSource") {
          const initialValue =
            component.pulseSettings?.initialValue ?? component.value ?? 0;

          return {
            ...base,
            value: initialValue ?? null,
            initial_value: [initialValue ?? 0, "", "volt"],
            pulse_value: component.pulseSettings?.pulseValue ?? null,
            pulse_width: component.pulseSettings?.pulseWidth ?? null,
            period: component.pulseSettings?.period ?? null,
          };
        }
        return base;
      }),
      wires: wires.map((wire) => ({
        id: wire.id,
        from: wire.from,
        to: wire.to,
        points: wire.points,
        color: wire.color ?? wireColor,
      })),
      step_time: 1e-04,
      end_time: 0.03
    };
    setSimulationResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/simulate/transcient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Simulation request payload:", payload);
      if (!response.ok) {
        if (response.status === 400) {
          let message = "No ground detected. Add a ground component and try again.";
          try {
            const errorBody = await response.json();
            const detail = errorBody?.detail;
            toast.error(detail || message, { duration: 4000 });
            return;
          } catch (parseError) {
            console.debug("Failed to parse 400 response", parseError);
          }
          toast.error(message, { duration: 4000 });
          return;
        }
        throw new Error(`Simulation request failed (${response.status})`);
      }
      const blob = await response.blob();
      console.log("Received blob:", blob);
      const graphsrc = URL.createObjectURL(blob);
      console.log("Generated graphsrc URL:", graphsrc);
      setGraphsrc(graphsrc);
      setIsGraphDialogOpen(true);
    } catch (error) {
      toast.error("Unable to run the Transcient simulation. Please try again.");
    }
  }

  }, [components, wires, circuitMode, applySimulationResult]);

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

      let nextPulseSettings = activeComponent.pulseSettings;
      if (activeComponent.type === "pulseVoltageSource") {
        const parsePulseNumber = (input: string, label: string): number | undefined => {
          const trimmed = input.trim();
          if (trimmed === "") {
            return undefined;
          }
          const numeric = Number.parseFloat(trimmed);
          if (!Number.isFinite(numeric)) {
            toast.error(`${label} must be a number`);
            throw new Error("invalid pulse input");
          }
          return numeric;
        };

        try {
          const parsedInitial = parsePulseNumber(draft.pulseInitial, "Initial value");
          const parsedPulse = parsePulseNumber(draft.pulseValue, "Pulse value");
          const parsedWidth = parsePulseNumber(draft.pulseWidth, "Pulse width");
          const parsedPeriod = parsePulseNumber(draft.pulsePeriod, "Period");

          nextPulseSettings = {
            initialValue: parsedInitial,
            pulseValue: parsedPulse,
            pulseWidth: parsedWidth,
            period: parsedPeriod,
          };

          if (!Object.values(nextPulseSettings).some((value) => value !== undefined)) {
            nextPulseSettings = undefined;
          }

          nextValue = parsedInitial ?? undefined;
        } catch (error) {
          console.debug("Pulse inspector input rejected", error);
          return;
        }
      }

      setComponents((prev) =>
        prev.map((component) =>
          component.id === activeComponent.id
            ? {
                ...component,
                title: trimmedTitle === "" ? undefined : trimmedTitle,
                value: nextValue,
                rotation: nextRotation,
                pulseSettings: nextPulseSettings,
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
          ? { ...component, rotation: component.rotation + 45 }
          : component
      )
    );

    setWires((prevWires) => {
      if (prevWires.length === 0) return prevWires;

      const componentMap = new Map<string, CanvasComponent>(
        components.map((component) => [
          component.id,
          component.id === selectedId
            ? { ...component, rotation: component.rotation + 45 }
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
    const activeElement = typeof document !== "undefined" ? document.activeElement : null;
    if (
      isEditableElement(activeElement) ||
      isSaveDialogOpen ||
      Boolean(inspectorId)
    ) {
      return;
    }

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
}, [selectedWireId, isSaveDialogOpen, inspectorId]);
  //Rotate
  useEffect(() => {
    if (!selectedId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = typeof document !== "undefined" ? document.activeElement : null;
      if (
        isEditableElement(activeElement) ||
        isSaveDialogOpen ||
        Boolean(inspectorId)
      ) {
        return;
      }

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
  }, [selectedId, rotateSelected, isSaveDialogOpen, inspectorId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = typeof document !== "undefined" ? document.activeElement : null;
      if (
        isEditableElement(activeElement) ||
        isSaveDialogOpen ||
        Boolean(inspectorId)
      ) {
        return;
      }

      if (event.key !== "Backspace" && event.key !== "Delete") {
        return;
      }

      event.preventDefault();

      setComponents((prevComponents) =>
        prevComponents
          .filter((component) => component.id !== selectedId)
          .map((component) => {
            const updatedConnections = Object.fromEntries(
              Object.entries(component.connections).map(([pin, targets]) => {
                const filtered = targets.filter((id) => id !== selectedId);
                return filtered.length > 0 ? [pin, filtered] : [pin, []];
              })
            );

            Object.keys(updatedConnections).forEach((pin) => {
              if (updatedConnections[pin]?.length === 0) {
                delete updatedConnections[pin];
              }
            });

            return { ...component, connections: updatedConnections };
          })
      );

      setWires((prevWires) =>
        prevWires.filter(
          (wire) =>
            wire.from.componentId !== selectedId &&
            wire.to.componentId !== selectedId
        )
      );

      setSelectedId(null);
      setInspectorId(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, isSaveDialogOpen, inspectorId]);

  const handleNodeContextMenu = useCallback(
    (componentId: string, event: KonvaEventObject<PointerEvent>) => {
      event.evt.preventDefault();
      handleEditRequest(componentId);
    },
    [handleEditRequest],
  );

  function renderComponent(component: CanvasComponent) {
    const isSelected = selectedId === component.id;
    const themeKey = `${component.id}-${isDarkMode ? "dark" : "light"}`;

    switch (component.type) {
      case "resistor":
        return (
          <ResistorNode
            key={themeKey}
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
            isDarkMode={isDarkMode}
          />
        );
      case "capacitor":
        return (
          <CapacitorNode
            key={themeKey}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            capacitance={component.value ? `${component.value}F` : "1µF"}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
            isDarkMode={isDarkMode}
          />
        );
      case "inductor":
        return (
          <InductorNode
            key={themeKey}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            inductance={component.value ? `${component.value}H` : "10mH"}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
            isDarkMode={isDarkMode}
          />
        );
      case "voltageSource":
        return (
          <VoltageSourceNode
            key={themeKey}
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
            isDarkMode={isDarkMode}
          />
        );
      case "currentSource":
        return (
          <CurrentSourceNode
            key={themeKey}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            current={component.value ? `${component.value}A` : "5A"}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
            isDarkMode={isDarkMode}
          />
        );
      case "pulseVoltageSource":
        return (
          <PulseVoltageSourceNode
            key={themeKey}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            pulseSettings={component.pulseSettings}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
            isDarkMode={isDarkMode}
          />
        );
      case "ground":
        return (
          <GroundNode
            key={themeKey}
            x={component.x}
            y={component.y}
            rotation={component.rotation}
            label={component.title ?? "GND"}
            onDragEnd={(event) => handleComponentDragEnd(component.id, event)}
            onSelect={() => handleSelect(component.id)}
            isSelected={isSelected}
            onContextMenu={(event) => handleNodeContextMenu(component.id, event)}
            wireMode={wireMode}
            onPinPointerDown={(pinId, event) =>
              handlePinPointerDown(component.id, pinId, event)
            }
            isDarkMode={isDarkMode}
          />
        );
      default:
        return (
          <Rect
            key={themeKey}
            x={component.x}
            y={component.y}
            width={50}
            height={50}
            fill={isDarkMode ? "#0f172a" : "gray"}
            stroke={isSelected ? "#2563eb" : isDarkMode ? "#f8fafc" : "transparent"}
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
  const handleConfirmSave = useCallback(async () => {
    const trimmedName = saveName.trim();
    const trimmedDescription = saveDescription.trim();

    if (trimmedName === "") {
      console.error("Save name cannot be empty");
      return;
    }

    const serializedComponents = components.map((component) => {
      const base = {
        id: component.id,
        type: component.type,
        x: component.x,
        y: component.y,
        rotation: component.rotation,
        value: component.value ?? null,
        title: component.title ?? null,
        connections: component.connections,
      };

      if (component.type === "pulseVoltageSource") {
        const initialValue =
          component.pulseSettings?.initialValue ?? component.value ?? 0;

        return {
          ...base,
          value: initialValue ?? null,
          initial_value: [initialValue ?? 0, "", "volt"],
          pulse_value: component.pulseSettings?.pulseValue ?? null,
          pulse_width: component.pulseSettings?.pulseWidth ?? null,
          period: component.pulseSettings?.period ?? null,
        };
      }

      return base;
    });

    const serializedWires = wires.map((wire) => ({
      id: wire.id,
      from_: wire.from,
      to: wire.to,
      points: wire.points,
      color: wire.color ?? wireColor,
    }));

    const payload = {
      name: trimmedName,
      description: trimmedDescription,
      mode: circuitMode,
      components: serializedComponents,
      wires: serializedWires,
    };

    const token = localStorage.getItem("token");

    setIsSaving(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/simulate/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save circuit (${response.status})`);
      }

      toast.success("Circuit saved successfully!");

      setIsSaveDialogOpen(false);
      setSaveDescription("");
      setSaveName("");
      setSelectedId(null);
      setInspectorId(null);
    } catch (error) {
      console.error("Error saving circuit:", error);
    } finally {
      setIsSaving(false);
    }
  }, [circuitMode, components, saveDescription, saveName, wires]);

  const handleClearCircuit = useCallback(() => {
    setComponents([]);
    setWires([]);
    setDraftWire(null);
    setSelectedId(null);
    setSelectedWireId(null);
    setInspectorId(null);
    setSimulationResult(null);
    setDraft({
      title: "",
      value: "",
      rotation: "0",
      pulseInitial: "",
      pulseValue: "",
      pulseWidth: "",
      pulsePeriod: "",
    });
    setSaveName("");
    setSaveDescription("");
    setIsSaveDialogOpen(false);
    setIsSaving(false);
    if (wireMode) {
      toggleWireMode();
    }
  }, [wireMode, toggleWireMode]);
  const handleStagePointerDown = useCallback(
    (event: KonvaEventObject<PointerEvent>) => {
      const stage = event.target.getStage();
      const clickedStage = event.target === stage;

      if (!wireMode || !draftWire) {
        if (clickedStage) {
          setSelectedWireId(null);
          handleSelect(null);
        }
        return;
      }

      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

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
  const valueFieldLabel = (() => {
    switch (activeComponent?.type) {
      case "resistor":
        return "Resistance (Ω)";
      case "voltageSource":
        return "Voltage (V)";
      case "currentSource":
        return "Current (A)";
      case "capacitor":
        return "Capacitance (F)";
      case "inductor":
        return "Inductance (H)";
      case "pulseVoltageSource":
        return "Initial Value (V)";
      default:
        return "Value";
    }
  })();

  const valueFieldPlaceholder = (() => {
    switch (activeComponent?.type) {
      case "resistor":
        return "Enter resistance";
      case "voltageSource":
        return "Enter voltage";
      case "currentSource":
        return "Enter current";
      case "capacitor":
        return "Enter capacitance";
      case "inductor":
        return "Enter inductance";
      case "pulseVoltageSource":
        return "Enter initial value";
      default:
        return "Enter value";
    }
  })();
  const id = searchParams.get("id");
  return (
    <Layout
      onRunCircuit={handleRunCircuit}
      mode={circuitMode}
      onModeChange={setCircuitMode}
      onSaveCircuit={openSaveDialog}
      onClearCircuit={handleClearCircuit}
      id= { id ?? "" }
    >
      <div
        ref={containerRef}
        className="relative flex-1 h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant={measurementMode === "voltage" ? "default" : "outline"}
            size="sm"
            onClick={() => setMeasurementMode("voltage")}
            disabled={!simulationResult}
          >
            Voltage
          </Button>
          <Button
            variant={measurementMode === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setMeasurementMode("current")}
            disabled={!simulationResult}
          >
            Current
          </Button>
        </div>
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
          {measurementMode === "voltage" ? (
            <Layer>
              {wires.map((wire) => {
                const annotation = wireAnnotations.get(wire.id);
                const labelPosition =
                  annotation !== undefined
                    ? getWireLabelPosition(wire.points)
                    : null;

                return (
                  <Group key={wire.id}>
                    <Line
                      points={wire.points}
                      stroke={selectedWireId === wire.id ? "#2563eb" : wire.color ?? wireColor}
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
                    {annotation !== undefined && labelPosition ? (
                      <KonvaLabel
                        x={labelPosition.x}
                        y={labelPosition.y - 18}
                        listening={false}
                      >
                        <KonvaTag
                          fill={measurementTagFill}
                          stroke={measurementTagStroke}
                          strokeWidth={1}
                          cornerRadius={4}
                        />
                        <KonvaText
                          text={formatVoltage(annotation)}
                          fill={measurementTextColor}
                          fontSize={12}
                          padding={4}
                        />
                      </KonvaLabel>
                    ) : null}
                  </Group>
                );
              })}
              {draftWire && (
                <Line
                  points={draftWire.points}
                  stroke={draftWire.color || wireColor}
                  strokeWidth={3}
                  dash={[8, 8]}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </Layer>
          ) : (
            <Layer>
              {wires.map((wire) => (
                <Line
                  key={wire.id}
                  points={wire.points}
                  stroke={selectedWireId === wire.id ? "#2563eb" : wire.color ?? wireColor}
                  strokeWidth={selectedWireId === wire.id ? 4 : 2}
                  lineCap="round"
                  lineJoin="round"
                  onMouseDown={(event) => {
                    event.cancelBubble = true;
                    setSelectedWireId(wire.id);
                    setSelectedId(null);
                    setInspectorId(null);
                  }}
                />
              ))}
              {draftWire && (
                <Line
                  points={draftWire.points}
                  stroke={draftWire.color || wireColor}
                  strokeWidth={3}
                  dash={[8, 8]}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </Layer>
          )}
          <Layer>
            {components.map((component) => renderComponent(component))}
          </Layer>
          {measurementMode === "current" ? (
            <Layer listening={false}>
              {components.map((component) => {
                const current = componentCurrentAnnotations.get(component.id);
                if (current === undefined) {
                  return null;
                }

                return (
                  <KonvaLabel
                    key={`${component.id}-current`}
                    x={component.x - 40}
                    y={component.y - 50}
                    listening={false}
                  >
                    <KonvaTag
                      fill={measurementTagFill}
                      stroke={measurementTagStroke}
                      strokeWidth={1}
                      cornerRadius={4}
                    />
                    <KonvaText
                      text={formatCurrent(current)}
                      fill={measurementTextColor}
                      fontSize={12}
                      padding={4}
                    />
                  </KonvaLabel>
                );
              })}
            </Layer>
          ) : null}
        </Stage>
      </div>
      <Dialog open={isGraphDialogOpen} onOpenChange={setIsGraphDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Graph</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <img src={graphsrc} alt="Graph" />
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
            <DialogTitle>Save Circuit</DialogTitle>
          </DialogHeader>
            <DialogDescription>
              Enter a name for your circuit to save it.
            </DialogDescription>
          <Input autoFocus placeholder="Circuit Name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
          <DialogDescription className="mt-4">
            Enter a description for your circuit (optional).
          </DialogDescription>
          <Input placeholder="Circuit Description" value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} />
          <DialogFooter>
            <DialogClose asChild> 
              <Button>Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmSave} disabled={isSaving || !saveName.trim()}>
              {isSaving ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
              {activeComponent.type !== "pulseVoltageSource" ? (
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
              ) : null}
              {activeComponent.type === "pulseVoltageSource" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${activeComponent.id}-pulse-initial`}>Initial Value (V)</Label>
                    <Input
                      id={`${activeComponent.id}-pulse-initial`}
                      type="number"
                      placeholder="Enter initial value"
                      value={draft.pulseInitial}
                      onChange={(event) => handleDraftChange("pulseInitial", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${activeComponent.id}-pulse-value`}>Pulse Value (V)</Label>
                    <Input
                      id={`${activeComponent.id}-pulse-value`}
                      type="number"
                      placeholder="Enter pulse value"
                      value={draft.pulseValue}
                      onChange={(event) => handleDraftChange("pulseValue", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${activeComponent.id}-pulse-width`}>Pulse Width (s)</Label>
                    <Input
                      id={`${activeComponent.id}-pulse-width`}
                      type="number"
                      placeholder="Enter pulse width"
                      value={draft.pulseWidth}
                      onChange={(event) => handleDraftChange("pulseWidth", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${activeComponent.id}-pulse-period`}>Period (s)</Label>
                    <Input
                      id={`${activeComponent.id}-pulse-period`}
                      type="number"
                      placeholder="Enter period"
                      value={draft.pulsePeriod}
                      onChange={(event) => handleDraftChange("pulsePeriod", event.target.value)}
                    />
                  </div>
                </div>
              ) : null}
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
