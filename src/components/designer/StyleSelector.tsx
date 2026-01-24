import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const styles = [
  { id: 'modern', label: 'Modern Minimal', emoji: '🪴' },
  { id: 'scandinavian', label: 'Scandinavian', emoji: '🌿' },
  { id: 'industrial', label: 'Industrial', emoji: '🏭' },
  { id: 'bohemian', label: 'Bohemian', emoji: '🌸' },
  { id: 'traditional', label: 'Traditional', emoji: '🏛️' },
  { id: 'coastal', label: 'Coastal', emoji: '🌊' },
];

interface StyleSelectorProps {
  selectedStyle: string | null;
  onSelect: (style: string) => void;
}

export function StyleSelector({ selectedStyle, onSelect }: StyleSelectorProps) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <Palette className="h-5 w-5 text-primary" />
        Choose Your Style
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all",
              selectedStyle === style.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-xl">{style.emoji}</span>
            <span className="text-sm font-medium">{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
