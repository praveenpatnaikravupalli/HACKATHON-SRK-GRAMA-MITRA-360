import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
export default function MicButton({ listening, onClick, label, size = 'lg' }) {
  const s = size === 'lg' ? 'h-32 w-32' : 'h-20 w-20';
  return (
    <div className="relative grid place-items-center">
      {listening && [0, 1].map(i => (
        <motion.span key={i} className={`absolute rounded-full bg-brand-500/30 ${s}`}
          animate={{ scale: [1, 1.7], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.7 }} />
      ))}
      <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} aria-label={label} aria-pressed={listening}
        className={`relative grid place-items-center rounded-full text-white shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-saffron-500 ${s} ${listening ? 'bg-red-600' : 'bg-gradient-to-br from-brand-500 to-brand-700'}`}>
        {listening ? <Square size={36} /> : <Mic size={size === 'lg' ? 52 : 34} />}
      </motion.button>
    </div>
  );
}
