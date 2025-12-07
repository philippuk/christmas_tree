import React, { useRef } from "react";
import { TreeState } from "../types";

interface OverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
  onUpload: (images: string[]) => void;
}

const Overlay: React.FC<OverlayProps> = ({ treeState, setTreeState, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleState = () => {
    setTreeState(treeState === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Create local URLs for the uploaded files
      const urls = files.map(file => URL.createObjectURL(file));
      onUpload(urls);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] text-center">
          NOËL LUXE
        </h1>
        <p className="text-white/60 text-sm md:text-base tracking-widest mt-2 uppercase">
          Interactive Holiday Experience
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center pointer-events-auto pb-10 gap-4">
        
        {/* Toggle State Button */}
        <button
          onClick={toggleState}
          className={`
            relative px-8 py-3 rounded-full text-white font-bold tracking-wider uppercase text-sm
            transition-all duration-700 ease-out border border-white/20
            ${treeState === TreeState.FORMED 
              ? "bg-[#8a0303]/80 hover:bg-[#a00404] shadow-[0_0_30px_#8a0303]" 
              : "bg-white/10 hover:bg-white/20 backdrop-blur-md"}
          `}
        >
          {treeState === TreeState.FORMED ? "Unleash Chaos" : "Assemble Tree"}
        </button>

        {/* Upload Button */}
        <div className="flex flex-col items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
            accept="image/*" 
          />
          <button 
            onClick={triggerUpload}
            className="text-xs text-white/50 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-1"
          >
            + Add Your Memories
          </button>
        </div>
        
        <p className="mt-2 text-xs text-white/40 font-light">
          {treeState === TreeState.FORMED 
            ? "Drag to Rotate • Scroll to Zoom" 
            : "Watch the particles float"}
        </p>
      </div>
    </div>
  );
};

export default Overlay;