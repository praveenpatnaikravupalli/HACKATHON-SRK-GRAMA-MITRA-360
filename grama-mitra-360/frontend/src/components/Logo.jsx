import { Mic } from 'lucide-react';
export default function Logo({ size = 'md' }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white"><Mic size={22} /></span>
      <span className={`font-bold tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>GRAMA MITRA <span className="text-saffron-600">360</span></span>
    </span>
  );
}
