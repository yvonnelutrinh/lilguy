
import {useEffect} from 'react';
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

const ProductivityMetrics: React.FC<ProductivityMetricsProps> = ({ className }) => {
    // calculate today's productive time
    const todayData = weekData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const todayProductiveHours = (todayData.productive / 100) * 8; // assuming an 8h workday

    // calculate weekly average
    const weeklyAverage = weekData.reduce((sum, day) => sum + day.productive, 0) / weekData.length;

        useEffect(() => {
          localStorage.setItem("weeklyAverage", JSON.stringify(weeklyAverage));
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
                <Card className="pixel-container">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Today</CardTitle>
                        <CardDescription>Productive Time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayProductiveHours.toFixed(1)}h</div>
                        <div className="text-xs text-muted-foreground">
                            {todayData.productive}% of your time
                        </div>
                        <div className="w-full mt-2 progress-pixel">
                            <div
                                className="fill"
                                style={{
                                    width: `${todayData.productive}%`,
                                    '--fill-color': todayData.productive > 60 ? '#10B981' : todayData.productive > 30 ? '#F59E0B' : '#EF4444'
                                } as React.CSSProperties}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="pixel-container">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Weekly Average</CardTitle>
                        <CardDescription>Productivity Score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weeklyAverage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                            {weeklyAverage > 70 ? 'Excellent!' : weeklyAverage > 50 ? 'Good' : 'Needs improvement'}
                        </div>
                        <div className="w-full mt-2 progress-pixel">
                            <div
                                className="fill"
                                style={{
                                    width: `${weeklyAverage}%`,
                                    '--fill-color': weeklyAverage > 60 ? '#10B981' : weeklyAverage > 30 ? '#F59E0B' : '#EF4444'
                                } as React.CSSProperties}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="pixel-container">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Productive Streak</CardTitle>
                        <CardDescription>Consecutive Days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{streak} days</div>
                        <div className="text-xs text-muted-foreground">
                            {streak > 5 ? 'Amazing streak!' : streak > 2 ? 'Keep it up!' : 'Start a streak!'}
                        </div>
                        <div className="flex mt-2 gap-1">
                            {Array(7).fill(0).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-2 flex-1 border border-black"
                                    style={{
                                        backgroundColor: i < streak ? '#10B981' : '#e1e1e1'
                                    }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Productivity Graph */}
            <Card className="pixel-container">
                <CardHeader>
                    <CardTitle className="text-base">Weekly Productivity</CardTitle>
                </CardHeader>
                <CardContent>
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
                                        fontSize: '1rem'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="productive"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Productive %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="unproductive"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    name="Unproductive %"
                                />
                            </LineChart>
                        </GraphContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductivityMetrics;