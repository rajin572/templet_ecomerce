/* eslint-disable @typescript-eslint/no-explicit-any */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ICategorySplitItem } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
    Boats: "#1e3a8a",
    Aircraft: "#60a5fa",
    Land: "#bfdbfe",
};

interface CategorySplitChartProps {
    data: ICategorySplitItem[];
    height?: number;
}

const CategorySplitChart = ({ data, height = 170 }: CategorySplitChartProps) => {
    return (
        <div>
            <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="percentage"
                            nameKey="category"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#9ca3af"} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(v: any, name: any) => [`${v}%`, name]}
                            contentStyle={{ borderRadius: 8, fontSize: 12 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                {data.map(({ category, percentage }) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: CATEGORY_COLORS[category] ?? "#9ca3af" }}
                            />
                            <span className="text-secondbase-color font-medium">{category}</span>
                        </span>
                        <span className="font-bold text-base-color">{percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySplitChart;
