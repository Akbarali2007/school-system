"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MonthlyCollectionChart from "@/components/admin/MonthlyCollectionChart";
import FeeTypeSummaryTable from "@/components/admin/FeeTypeSummaryTable";

export default function AdminFeesPage() {
  const [loading, setLoading] = useState(true);
  
  // Mock data for charts (Replace with real API call if needed)
  const monthlyData = [
    { month: "Jan", amount: 1800000 }, { month: "Feb", amount: 2400000 }, 
    { month: "Mar", amount: 2900000 }, { month: "Apr", amount: 3200000 }, 
    { month: "May", amount: 3500000 }, { month: "Jun", amount: 4200000 }
  ];
  
  const summaryData = [
    { type: "Tuition Fee", amount: 1850000, collected: 76 },
    { type: "Admission Fee", amount: 320000, collected: 92 },
    { type: "Exam Fee", amount: 210000, collected: 68 },
    { type: "Transport Fee", amount: 180000, collected: 85 },
    { type: "Library Fee", amount: 95000, collected: 70 },
  ];

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-brand mb-2 inline-flex items-center gap-2 transition">← Back to Dashboard</Link>
            <h1 className="text-3xl font-semibold text-navy tracking-tight">Fee Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your school's fee collection and analytics.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/fees/invoices" className="bg-white border border-gray-200 text-navy px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">View Invoices</Link>
            <Link href="/admin/fees/structure" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition shadow-sm shadow-brand/20">+ Generate Invoice</Link>
          </div>
        </div>

        {/* KPI Cards (Simplified) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Fee Collection (Today)", value: "Rs. 285,000", trend: "+18%", color: "text-green-500" },
            { label: "Outstanding Fees", value: "Rs. 1,245,000", trend: "12% of total", color: "text-orange-500" },
            { label: "Fee Defaulters", value: "186", trend: "+6%", color: "text-red-500" },
            { label: "Total Students", value: "1,240", trend: "+3%", color: "text-green-500" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <h3 className="text-2xl font-semibold text-navy mt-2">{kpi.value}</h3>
              <p className={`text-xs mt-2 font-medium ${kpi.color}`}>{kpi.trend}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyCollectionChart data={monthlyData} />
          <FeeTypeSummaryTable data={summaryData} />
        </div>

      </div>
    </main>
  );
}