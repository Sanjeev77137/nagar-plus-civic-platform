import { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface CameraGalleryButtonsProps {
  onPick: (file: File) => void;
}

/** Side-by-side camera + gallery pickers. `capture` forces the live camera on mobile. */
export default function CameraGalleryButtons({ onPick }: CameraGalleryButtonsProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onPick(file);
  };

  const buttonClass =
    'flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl py-3.5 text-sm font-semibold text-slate-700 transition-colors cursor-pointer';

  return (
    <div className="flex gap-3">
      <button type="button" className={buttonClass} onClick={() => cameraRef.current?.click()}>
        <Camera className="w-4 h-4 text-blue-800" />
        📷 Open Camera
      </button>
      <button type="button" className={buttonClass} onClick={() => galleryRef.current?.click()}>
        <ImageIcon className="w-4 h-4 text-emerald-600" />
        🖼️ Choose from Gallery
      </button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}
