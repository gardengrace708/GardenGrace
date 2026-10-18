export default function Badge({ children }) {
  const tone = {
    NEW: 'bg-wood text-obsidian',
    BESTSELLER: 'bg-ivory text-obsidian',
    LIMITED: 'bg-red-700 text-white',
    TRENDING: 'bg-orange-500 text-white',
  };

  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.22em] ${tone[children] || tone.NEW}`}>{children}</span>;
}
