import { useState } from "react";

type TutorialModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  //pur your image path here uhhh just hardcode the desc.
  const images = [
    "/tutorial/step1.png",
    "/tutorial/step2.png",
    "/tutorial/step3.png",
    "/tutorial/step4.png",
    "/tutorial/step5.png",
    "/tutorial/step6.png",
  ];

  const descriptions = [
    "Step 1: tutorial 1.",
    "Step 2: tutorial 2.",
    "Step 3: tutorial 3.",
    "Step 4: tutorial 4.",
    "Step 5: tutorial 5.",
    "Step 6: tutorial 6.",
  ];

  const prevItem = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
              src={images[currentIndex]}
              alt={`Tutorial step ${currentIndex + 1}`}
              className="w-full max-h-[70vh] object-contain rounded"
            />
          </div>

          <div className="flex-[0.35] pl-4 flex items-center">
            <p className="text-gray-700 dark:text-gray-300">
              {descriptions[currentIndex]}
            </p>
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
            {currentIndex + 1} / {images.length}
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
