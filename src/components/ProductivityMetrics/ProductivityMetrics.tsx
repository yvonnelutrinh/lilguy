import { useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer as GraphContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card/Card";

// Helper function to safely set localStorage item
const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, typeof value === 'object' || typeof value === 'number' ? JSON.stringify(value) : value);
  }
};

// placeholder data for tracking metrics
const weekData = [
    { day: 'Mon', productive: 65, unproductive: 35 },
    { day: 'Tue', productive: 59, unproductive: 41 },
    { day: 'Wed', productive: 80, unproductive: 20 },
    { day: 'Thu', productive: 81, unproductive: 19 },
    { day: 'Fri', productive: 56, unproductive: 44 },
    { day: 'Sat', productive: 55, unproductive: 45 },
    { day: 'Sun', productive: 40, unproductive: 60 },
];

interface ProductivityMetricsProps {
    className?: string;
}

// Pixel Icon components for metrics
const ClockIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="8" y="2" width="8" height="2" fill="currentColor" />
      <rect x="6" y="4" width="2" height="2" fill="currentColor" />
      <rect x="16" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="6" width="2" height="2" fill="currentColor" />
      <rect x="18" y="6" width="2" height="2" fill="currentColor" />
      <rect x="4" y="16" width="2" height="2" fill="currentColor" />
      <rect x="18" y="16" width="2" height="2" fill="currentColor" />
      <rect x="6" y="18" width="2" height="2" fill="currentColor" />
      <rect x="16" y="18" width="2" height="2" fill="currentColor" />
      <rect x="8" y="20" width="8" height="2" fill="currentColor" />
      <rect x="2" y="8" width="2" height="8" fill="currentColor" />
      <rect x="20" y="8" width="2" height="8" fill="currentColor" />
      <rect x="10" y="10" width="2" height="6" fill="currentColor" />
      <rect x="12" y="8" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const ChartIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="4" y="4" width="16" height="2" fill="currentColor" />
      <rect x="4" y="8" width="4" height="2" fill="currentColor" />
      <rect x="4" y="12" width="8" height="2" fill="currentColor" />
      <rect x="4" y="16" width="12" height="2" fill="currentColor" />
      <rect x="20" y="20" width="2" height="2" fill="currentColor" />
      <rect x="2" y="2" width="2" height="20" fill="currentColor" />
      <rect x="2" y="20" width="18" height="2" fill="currentColor" />
    </svg>
  </div>
);

const TrophyIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="8" y="2" width="8" height="2" fill="currentColor" />
      <rect x="6" y="4" width="12" height="2" fill="currentColor" />
      <rect x="4" y="6" width="4" height="2" fill="currentColor" />
      <rect x="16" y="6" width="4" height="2" fill="currentColor" />
      <rect x="2" y="8" width="4" height="6" fill="currentColor" />
      <rect x="18" y="8" width="4" height="6" fill="currentColor" />
      <rect x="6" y="14" width="12" height="2" fill="currentColor" />
      <rect x="8" y="16" width="8" height="2" fill="currentColor" />
      <rect x="10" y="18" width="4" height="4" fill="currentColor" />
    </svg>
  </div>
);

const ProductivityMetrics: React.FC<ProductivityMetricsProps> = ({ className }) => {
    // calculate today's productive time
    const todayData = weekData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const todayProductiveHours = (todayData.productive / 100) * 8; // assuming an 8h workday

    // calculate weekly average
    const weeklyAverage = weekData.reduce((sum, day) => sum + day.productive, 0) / weekData.length;

    useEffect(() => {
        setLocalStorageItem("weeklyAverage", weeklyAverage);
    }, [weeklyAverage]);

    // calculate streak (consecutive days above 60% productivity)
    let streak = 0;
    for (let i = weekData.length - 1; i >= 0; i--) {
        if (weekData[i].productive >= 60) {
            streak++;
        } else {
            break;
        }
    }

    return (
        <div className={className}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="pixel-window">
                    <div className="pixel-window-header bg-pixel-blue">
                        <div className="flex items-center gap-2">
                            <ClockIcon />
                            <div className="text-pixel-sm">TODAY</div>
                        </div>
                        <div className="pixel-window-controls">
                            <div className="pixel-window-button"></div>
                            <div className="pixel-window-button"></div>
                            <div className="pixel-window-button"></div>
                        </div>
                    </div>
                    <div className="pixel-window-content">
                        <div className="text-xl font-bold mb-1">{todayProductiveHours.toFixed(1)}h</div>
                        <div className="text-pixel-sm text-gray-600 mb-3">
                            {todayData.productive}% productive time
                        </div>
                        <div className="w-full pixel-progress">
                            <div
                                className="pixel-progress-fill"
                                style={{
                                    width: `${todayData.productive}%`,
                                    backgroundColor: todayData.productive > 60 ? 'var(--pixel-green)' : todayData.productive > 30 ? '#F59E0B' : '#EF4444'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="pixel-window">
                    <div className="pixel-window-header bg-pixel-green">
                        <div className="flex items-center gap-2">
                            <ChartIcon />
                            <div className="text-pixel-sm">WEEKLY AVERAGE</div>
                        </div>
                        <div className="pixel-window-controls">
                            <div className="pixel-window-button"></div>
                            <div className="pixel-window-button"></div>
                            <div className="pixel-window-button"></div>
                        </div>
                    </div>
                    <div className="pixel-window-content">
                        <div className="text-xl font-bold mb-1">{weeklyAverage.toFixed(1)}%</div>
                        <div className="text-pixel-sm text-gray-600 mb-3">
                            {weeklyAverage > 70 ? 'EXCELLENT!' : weeklyAverage > 50 ? 'GOOD' : 'NEEDS WORK'}
                        </div>
                        <div className="w-full pixel-progress">
                            <div
                                className="pixel-progress-fill"
                                style={{
                                    width: `${weeklyAverage}%`,
                                    backgroundColor: weeklyAverage > 60 ? 'var(--pixel-green)' : weeklyAverage > 30 ? '#F59E0B' : '#EF4444'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="pixel-window">
                    <div className="pixel-window-header bg-pixel-teal">
                        <div className="flex items-center gap-2">
                            <TrophyIcon />
                            <div className="text-pixel-sm">STREAK</div>
                        </div>
                        <div className="pixel-window-controls">
                            <div className="pixel-window-button"></div>
                            <div className="pixel-window-button"></div>
                            <div className="pixel-window-button"></div>
                        </div>
                    </div>
                    <div className="pixel-window-content">
                        <div className="text-xl font-bold mb-1">{streak} days</div>
                        <div className="text-pixel-sm text-gray-600 mb-3">
                            {streak > 5 ? 'AMAZING STREAK!' : streak > 2 ? 'KEEP IT UP!' : 'START A STREAK!'}
                        </div>
                        <div className="flex mt-2 gap-1 segmented-progress">
                            {Array(7).fill(0).map((_, i) => (
                                <div
                                    key={i}
                                    className={`segment ${i < streak ? 'filled' : ''}`}
                                    style={{
                                        backgroundColor: i < streak ? 'var(--pixel-green)' : '#e1e1e1'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Productivity Graph */}
            <div className="pixel-window">
                <div className="pixel-window-header bg-pixel-beige">
                    <div className="text-pixel-sm text-black">WEEKLY PRODUCTIVITY</div>
                    <div className="pixel-window-controls">
                        <div className="pixel-window-button"></div>
                        <div className="pixel-window-button"></div>
                        <div className="pixel-window-button"></div>
                    </div>
                </div>
                <div className="pixel-window-content">
                    <div className="h-64">
                        <GraphContainer width="100%" height="100%">
                            <LineChart
                                data={weekData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        border: '.0625rem solid black',
                                        fontSize: '0.7rem',
                                        fontFamily: "'Press Start 2P', monospace",
                                        padding: '8px'
                                    }}
                                />
                                <Legend 
                                    wrapperStyle={{
                                        fontFamily: "'Press Start 2P', monospace",
                                        fontSize: '0.7rem'
                                    }}
                                />
                                <Line
                                    type="stepAfter"
                                    dataKey="productive"
                                    stroke="var(--pixel-green)"
                                    strokeWidth={2}
                                    name="Productive %"
                                    dot={{ strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                    type="stepAfter"
                                    dataKey="unproductive"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    name="Unproductive %"
                                    dot={{ strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </GraphContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityMetrics;
