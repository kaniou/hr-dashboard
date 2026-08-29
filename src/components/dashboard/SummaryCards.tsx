import { Users, UserCheck, UserCheck2 } from "lucide-react";

interface SummaryCardsProps {
  total: number;
  male: number;
  female: number;
}

export function SummaryCards({ total, male, female }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">บุคลากรทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">เพศชาย</p>
            <p className="text-2xl font-bold text-gray-900">{male.toLocaleString()}</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg">
            <UserCheck className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">เพศหญิง</p>
            <p className="text-2xl font-bold text-gray-900">{female.toLocaleString()}</p>
          </div>
          <div className="bg-pink-100 p-3 rounded-lg">
            <UserCheck2 className="h-6 w-6 text-pink-600" />
          </div>
        </div>
      </div>
    </div>
  );
}