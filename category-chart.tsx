import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Category } from "@shared/schema";

interface CategoryExpense {
  categoryId: number;
  amount: number;
  category?: Category;
}

export default function CategoryChart() {
  const { data: categoryData, isLoading } = useQuery<CategoryExpense[]>({
    queryKey: ["/api/analytics/categories"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full rounded-full mx-auto" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-3 w-3 rounded-full mr-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total amount
  const totalAmount = categoryData?.reduce((acc, item) => acc + item.amount, 0) || 0;
  
  // Format data for the pie chart
  const chartData = categoryData?.map(item => ({
    id: item.categoryId,
    name: item.category?.name || "Unknown",
    value: item.amount,
    color: item.category?.color || "#ccc",
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
  })) || [];

  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle"
        dominantBaseline="central" 
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-mutedForeground">
            ${data.value.toFixed(2)} ({data.percentage.toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                innerRadius={30}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
                animationBegin={200}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-sm font-medium text-mutedForeground">Total</p>
              <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {chartData.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              <span className="text-sm flex-1">{entry.name}</span>
              <span className="text-sm font-medium">
                ${entry.value.toFixed(2)} ({entry.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
