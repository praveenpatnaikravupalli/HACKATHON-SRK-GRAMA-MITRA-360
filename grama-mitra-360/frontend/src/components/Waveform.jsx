import { motion } from 'framer-motion';
export default function Waveform({ active }) {
  return (
    <div className="flex h-12 items-center justify-center gap-1.5" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <motion.span key={i} className="w-1.5 rounded-full bg-brand-600"
          animate={active ? { height: [8, 38, 14, 44, 10], transition: { repeat: Infinity, duration: 0.9 + (i % 4) * 0.15, delay: i * 0.07 } } : { height: 8 }} />
      ))}
    </div>
  );
}
