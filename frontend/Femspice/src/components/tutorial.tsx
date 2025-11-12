import { useState } from "react";

type TutorialModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const tutorialSteps = [
    {
      image: "/tutorial/step1-open-library.png",
      title: "Open the component library",
      description:
        "Use the sidebar to browse fundamental elements. Drag any part onto the canvas to start building your schematic.",
    },
    {
      image: "/tutorial/step2-drop-component.png",
      title: "Place your first component",
      description:
        "Drop a resistor, source, or ground onto the grid. Components snap to the canvas so alignment stays clean.",
    },
    {
      image: "/tutorial/step3-wire-mode.png",
      title: "Toggle wire mode",
      description:
        "Switch wire mode on from the top toolbar. Click on a pin to begin routing a connection between components.",
    },
    {
      image: "/tutorial/step4-complete-wire.png",
      title: "Connect component pins",
      description:
        "Click a second compatible pin to finish the wire. Press Esc to cancel",
    },
    {
      image: "/tutorial/step5-edit-properties.png",
      title: "Edit component properties",
      description:
        "Select a component and use the inspector panel to adjust labels, values, rotation, and pulse settings.",
    },
    {
      image: "/tutorial/step6-run-simulation.png",
      title: "Run a simulation",
      description:
        "Choose DC or transient mode, then click Run. FEMspice normalizes values and sends the schematic to the solver.",
    },
    {
      image: "/tutorial/step7-view-results.png",
      title: "Review voltage or current overlays",
      description:
        "After a run, toggle the Voltage/Current buttons to see measurement tags at a glance for each wire or device.",
    },
    {
      image: "/tutorial/step8-save-circuit.png",
      title: "Save or clear your workspace",
      description:
        "Open the Save dialog to store the circuit with a description, or clear the canvas to begin a new draft.",
    },
  ];

  const prevItem = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? tutorialSteps.length - 1 : prev - 1,
    );
  };

  const nextItem = () => {
    setCurrentIndex((prev) =>
      prev === tutorialSteps.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex w-full max-w-5xl flex-col rounded-lg bg-[#f5f5f5] p-6 shadow-lg dark:bg-[#3a3a37]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          ✕
        </button>

        <div className="flex">
          <div className="flex-[0.65] pr-4">
            <img
              src={tutorialSteps[currentIndex]?.image}
              alt={`Tutorial step ${currentIndex + 1}`}
              className="w-full max-h-[70vh] object-contain rounded"
            />
          </div>

          <div className="flex-[0.35] pl-4 flex items-center">
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {tutorialSteps[currentIndex]?.title}
              </p>
              <p>{tutorialSteps[currentIndex]?.description}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={prevItem}
            className="px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            ←
          </button>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {currentIndex + 1} / {tutorialSteps.length}
          </p>
          <button
            onClick={nextItem}
            className="px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
