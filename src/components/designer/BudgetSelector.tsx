import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const budgets = [
  { id: 'budget', label: 'Budget-Friendly', range: 'Under $2,000' },
  { id: 'mid', label: 'Mid-Range', range: '$2,000 - $5,000' },
  { id: 'luxury', label: 'Luxury', range: '$5,000+' },
];

interface BudgetSelectorProps {
  selectedBudget: string | null;
  onSelect: (budget: string) => void;
}

export function BudgetSelector({ selectedBudget, onSelect }: BudgetSelectorProps) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <DollarSign className="h-5 w-5 text-primary" />
        Set Your Budget
      </h3>
      <div className="grid gap-2 sm:grid-cols-3">
        {budgets.map((budget) => (
          <button
            key={budget.id}
            onClick={() => onSelect(budget.id)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left transition-all",
              selectedBudget === budget.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <p className="font-medium">{budget.label}</p>
            <p className="text-sm text-muted-foreground">{budget.range}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
