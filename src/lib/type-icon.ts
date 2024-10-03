import { Hash, ToggleLeft, Calendar, Mail, DollarSign, Percent, FileText, AlertCircle, List, Folder, Binary, Code, X, Ban } from 'lucide-react';

import { InferredType } from './type-inference';

export const getIcon = (type: InferredType) => {
  switch (type) {
    case 'number': return { icon: Hash, className: "text-blue-500" };
    case 'boolean': return { icon: ToggleLeft, className: "text-green-500" };
    case 'date': return { icon: Calendar, className: "text-orange-500" };
    case 'email': return { icon: Mail, className: "text-purple-500" };
    case 'currency': return { icon: DollarSign, className: "text-yellow-500" };
    case 'percentage': return { icon: Percent, className: "text-indigo-500" };
    case 'array': return { icon: List, className: "text-gray-500" };
    case 'object': return { icon: Folder, className: "text-gray-500" };
    case 'null': return { icon: Ban, className: "text-gray-500" };
    case 'empty': return { icon: X, className: "text-gray-300" };
    case 'unknown': return { icon: AlertCircle, className: "text-gray-500" };
    case 'bigint': return { icon: Binary, className: "text-cyan-500" };
    case 'regex': return { icon: Code, className: "text-lime-500" };
    default: return { icon: FileText, className: "text-gray-500" };
  }
};

