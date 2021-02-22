import React from 'react'
import { Tooltip, XAxis, AreaChart, Area } from 'recharts'

export default function NetChart({ data }) {
    return (
        <AreaChart
            width={450}
            height={120}
            data={data}
        >
            <Tooltip />
            <defs>
                <linearGradient id='colorSpeed' x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#41BBD9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#41BBD9" stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="speed" stroke="#8884d8" fillOpacity={1} fill="url(#colorSpeed)" />
        </AreaChart>
    )
}