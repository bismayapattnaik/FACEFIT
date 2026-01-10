import React, { useCallback, useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, id }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</label>
      
      {image ? (
        <div className="relative group w-full aspect-[3/4] bg-neon-card rounded-xl overflow-hidden border border-neon-cyan/30">
          <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
          <button 
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          className={`
            relative w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden
            ${isDragging ? 'border-neon-cyan bg-neon-cyan/10' : 'border-gray-700 hover:border-neon-cyan/50 hover:bg-gray-800/50'}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            id={id} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            accept="image/*"
            onChange={handleChange}
          />
          
          <div className="p-4 rounded-full bg-neon-card border border-gray-700 text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.15)]">
            {label.toLowerCase().includes('face') ? <Camera size={32} /> : <Upload size={32} />}
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-gray-400 font-medium">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-600 mt-1">JPEG, PNG, WEBP</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
