"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";

export default function MonthlyCollectionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
        No collection data available
      </div>
    );
  }

  return (
    <section className="bg-white block min-h-[300px] rounded-2xl border border-gray-200/60 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-semibold text-navy text-[17px]">Monthly Collection</h3>
        <p className="text-sm text-gray-500 mt-1">Fee collected over the last 6 months</p>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#6b7280" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value) => `Rs ${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              formatter={(value) => [formatCurrency(value), "Collected"]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#0077F5" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}