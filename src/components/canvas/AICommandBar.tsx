import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Command, 
  Sparkles, 
  Palette, 
  Sofa, 
  Lightbulb, 
  Layers,
  Search,
  ArrowRight,
  Wand2
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface AICommandBarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSuggestion: string;
  onCommand: (command: string) => void;
}

const commandCategories = [
  {
    heading: 'Styles',
    commands: [
      { icon: Palette, label: 'Scandinavian', description: 'Clean lines, natural materials' },
      { icon: Palette, label: 'Minimalist', description: 'Less is more, essential pieces' },
      { icon: Palette, label: 'Bohemian', description: 'Eclectic, colorful, relaxed' },
      { icon: Palette, label: 'Industrial', description: 'Raw materials, urban edge' },
      { icon: Palette, label: 'Mid-Century Modern', description: 'Retro with contemporary flair' },
    ],
  },
  {
    heading: 'Furniture',
    commands: [
      { icon: Sofa, label: 'Replace sofa', description: 'Swap the main seating' },
      { icon: Sofa, label: 'Add accent chair', description: 'Extra seating option' },
      { icon: Sofa, label: 'Change coffee table', description: 'New centerpiece' },
    ],
  },
  {
    heading: 'Lighting',
    commands: [
      { icon: Lightbulb, label: 'Warm lighting', description: 'Cozy, amber tones' },
      { icon: Lightbulb, label: 'Cool lighting', description: 'Bright, modern feel' },
      { icon: Lightbulb, label: 'Add floor lamp', description: 'Corner illumination' },
    ],
  },
  {
    heading: 'Layout',
    commands: [
      { icon: Layers, label: 'Open layout', description: 'More spacious arrangement' },
      { icon: Layers, label: 'Cozy layout', description: 'Intimate, close-knit' },
      { icon: Layers, label: 'Work-friendly', description: 'Add desk space' },
    ],
  },
];

export const AICommandBar = ({ isOpen, onOpenChange, currentSuggestion, onCommand }: AICommandBarProps) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <>
      {/* Floating command trigger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2"
      >
        <button
          onClick={() => onOpenChange(true)}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-charcoal/80 px-6 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-charcoal/90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ai-amber to-ai-coral">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSuggestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-medium text-white"
              >
                {currentSuggestion}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-white/50">Click or press / to explore</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
        </button>
      </motion.div>

      {/* Command Dialog */}
      <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ai-amber to-ai-coral">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <CommandInput 
              placeholder="Ask AI to redesign..." 
              value={inputValue}
              onValueChange={setInputValue}
              className="border-0 p-0 focus:ring-0"
            />
          </div>
        </div>
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
              <p>No commands found.</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          </CommandEmpty>
          {commandCategories.map((category) => (
            <CommandGroup key={category.heading} heading={category.heading}>
              {category.commands.map((cmd) => (
                <CommandItem
                  key={cmd.label}
                  value={cmd.label}
                  onSelect={() => onCommand(cmd.label)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <cmd.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{cmd.label}</p>
                    <p className="text-sm text-muted-foreground">{cmd.description}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
