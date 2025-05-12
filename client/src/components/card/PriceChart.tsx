import { useRef, useEffect } from "react";
import { CardPrice } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceChartProps {
  priceHistory: CardPrice[];
  days?: number;
}

export default function PriceChart({ priceHistory, days = 30 }: PriceChartProps) {
  // Sort price history by date ascending
  const sortedHistory = [...priceHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Format dates for display
  const formattedData = sortedHistory.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: item.price,
    timestamp: new Date(item.timestamp).getTime()
  }));

  // Calculate domain padding for y-axis
  const prices = formattedData.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;
  const yDomain: [number, number] = [
    Math.max(0, minPrice - padding), // Never go below 0
    maxPrice + padding
  ];

  // Format price for tooltip
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date for tooltip
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{formatDate(payload[0].payload.timestamp)}</p>
          <p className="text-telegram-blue">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[200px]">
      {priceHistory.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickMargin={5}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={yDomain}
              tickFormatter={value => formatPrice(value)}
              width={60}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--telegram-blue))" 
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Not enough price data to display chart
        </div>
      )}
    </div>
  );
}
