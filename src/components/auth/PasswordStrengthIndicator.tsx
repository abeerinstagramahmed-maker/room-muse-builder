import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const results = useMemo(() => rules.map(r => ({ ...r, passed: r.test(password) })), [password]);
  const score = results.filter(r => r.passed).length;

  const strength = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score <= 4 ? 'Good' : 'Strong';
  const strengthColor = score <= 1 ? 'bg-destructive' : score <= 3 ? 'bg-amber-500' : score <= 4 ? 'bg-primary' : 'bg-emerald-500';

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i < score ? strengthColor : 'bg-muted'
              )}
            />
          ))}
        </div>
        <span className={cn('text-xs font-medium', score <= 1 ? 'text-destructive' : score <= 3 ? 'text-amber-500' : 'text-emerald-500')}>
          {strength}
        </span>
      </div>

      {/* Rules checklist */}
      <ul className="space-y-1">
        {results.map(r => (
          <li key={r.label} className="flex items-center gap-1.5 text-xs">
            {r.passed ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={cn(r.passed ? 'text-muted-foreground' : 'text-muted-foreground/60')}>
              {r.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
