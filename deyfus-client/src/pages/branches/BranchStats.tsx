import { Package, User, CreditCard, AlertTriangle, ArrowUpDown, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BranchStats {
  products: number;
  users: number;
  sales: number;
  stockAlerts: number;
  inventoryMovements: number;
  financialTransactions: number;
}

interface BranchStatsProps {
  branch: {
    id: number;
    name: string;
    _count: BranchStats;
  };
}

export default function BranchStats({ branch }: BranchStatsProps) {
  const stats = [
    {
      label: 'Productos',
      value: branch._count.products,
      icon: Package,
      color: 'bg-emerald-500',
    },
    {
      label: 'Personal',
      value: branch._count.users,
      icon: User,
      color: 'bg-violet-500',
    },
    {
      label: 'Ventas',
      value: branch._count.sales,
      icon: CreditCard,
      color: 'bg-blue-500',
    },
    {
      label: 'Alertas',
      value: branch._count.stockAlerts,
      icon: AlertTriangle,
      color: 'bg-rose-500',
    },
    {
      label: 'Movimientos',
      value: branch._count.inventoryMovements,
      icon: ArrowUpDown,
      color: 'bg-amber-500',
    },
    {
      label: 'Transacciones',
      value: branch._count.financialTransactions,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
              <stat.icon className="text-white" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}