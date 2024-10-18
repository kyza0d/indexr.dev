import { Hash, ToggleLeft, Calendar, Mail, DollarSign, Percent, AlertCircle, List, Folder, Binary, Code, X, Ban, Text, CircleX } from 'lucide-react';

import { InferredType } from './type-inference';

export const getIcon = (type: InferredType) => {
  switch (type) {
    case 'number': return { icon: Hash, className: "text-[hsl(var(--type-number))] h-5 w-5" };
    case 'boolean': return { icon: ToggleLeft, className: "text-[hsl(var(--type-boolean))] h-5 w-5" };
    case 'date': return { icon: Calendar, className: "text-[hsl(var(--type-date))] h-5 w-5" };
    case 'email': return { icon: Mail, className: "text-[hsl(var(--type-email))] h-5 w-5" };
    case 'currency': return { icon: DollarSign, className: "text-[hsl(var(--type-currency))] h-5 w-5" };
    case 'percentage': return { icon: Percent, className: "text-[hsl(var(--type-percentage))] h-5 w-5" };
    case 'array': return { icon: List, className: "text-[hsl(var(--type-array))] h-5 w-5" };
    case 'object': return { icon: Folder, className: "text-[hsl(var(--type-object))] h-5 w-5" };
    case 'null': return { icon: Ban, className: "text-[hsl(var(--type-null))] h-5 w-5" };
    case 'empty': return { icon: CircleX, className: "text-[hsl(var(--type-empty))] h-5 w-5" };
    case 'unknown': return { icon: AlertCircle, className: "text-[hsl(var(--type-unknown))] h-5 w-5" };
    case 'bigint': return { icon: Binary, className: "text-[hsl(var(--type-bigint))] h-5 w-5" };
    case 'regex': return { icon: Code, className: "text-[hsl(var(--type-regex))] h-5 w-5" };
    default: return { icon: Text, className: "text-[hsl(var(--type-text))] h-5 w-5" };
  }
};
