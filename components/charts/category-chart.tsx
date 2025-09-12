"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Computers", value: 35, color: "#10b981" },
  { name: "Components", value: 25, color: "#3b82f6" },
  { name: "Peripherals", value: 20, color: "#f59e0b" },
  { name: "Networking", value: 12, color: "#ef4444" },
  { name: "Storage", value: 8, color: "#8b5cf6" },
]

export function CategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, "Sales Share"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
