import React, { useMemo, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Platform, PanResponder } from "react-native";
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, Circle, Rect } from "react-native-svg";
import Colors from "@/constants/colors";
import { getScreenWidth } from "@/lib/screen-utils";

const SCREEN_WIDTH = getScreenWidth();

interface ChartDataSet {
  data: number[];
  color: string;
  label: string;
}

interface ComparisonChartProps {
  datasets: ChartDataSet[];
  timeLabels: string[];
}

export default function ComparisonChart({ datasets, timeLabels }: ComparisonChartProps) {
  const chartWidth = SCREEN_WIDTH - 40;
  const chartHeight = 200;
  const paddingTop = 16;
  const paddingBottom = 24;
  const paddingLeft = 38;
  const paddingRight = 12;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0 });

  const getIndexFromX = useCallback((touchX: number) => {
    const relativeX = touchX - layoutRef.current.x - paddingLeft;
    if (relativeX < 0 || relativeX > plotWidth || datasets.length === 0) return null;
    const dataLen = datasets[0].data.length;
    const idx = Math.round((relativeX / plotWidth) * (dataLen - 1));
    return Math.max(0, Math.min(dataLen - 1, idx));
  }, [datasets, plotWidth, paddingLeft]);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const idx = getIndexFromX(evt.nativeEvent.pageX);
        setActiveIndex(idx);
      },
      onPanResponderMove: (evt) => {
        const idx = getIndexFromX(evt.nativeEvent.pageX);
        setActiveIndex(idx);
      },
      onPanResponderRelease: () => {
        setTimeout(() => setActiveIndex(null), 1500);
      },
      onPanResponderTerminate: () => {
        setActiveIndex(null);
      },
    }), [getIndexFromX]);

  const { paths, yMin, yMax, yTicks, zeroY } = useMemo(() => {
    if (datasets.length === 0) {
      return { paths: [], yMin: -3, yMax: 3, yTicks: [-3, 0, 3], zeroY: 0 };
    }

    let allMin = 0;
    let allMax = 0;
    datasets.forEach(ds => {
      ds.data.forEach(v => {
        if (v < allMin) allMin = v;
        if (v > allMax) allMax = v;
      });
    });

    const range = Math.max(Math.abs(allMin), Math.abs(allMax), 1);
    const roundedRange = Math.ceil(range);
    const computedYMin = -roundedRange;
    const computedYMax = roundedRange;
    const totalRange = computedYMax - computedYMin;

    const ticks: number[] = [];
    const step = totalRange <= 4 ? 1 : totalRange <= 8 ? 2 : Math.ceil(totalRange / 4);
    for (let v = computedYMin; v <= computedYMax; v += step) {
      ticks.push(v);
    }
    if (ticks[ticks.length - 1] < computedYMax) ticks.push(computedYMax);

    const computedZeroY = paddingTop + plotHeight * (computedYMax / totalRange);

    const computedPaths = datasets.map((ds) => {
      const points = ds.data.map((val, i) => {
        const x = paddingLeft + (i / (ds.data.length - 1)) * plotWidth;
        const y = paddingTop + plotHeight * ((computedYMax - val) / totalRange);
        return { x, y };
      });

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx1 = prev.x + (curr.x - prev.x) * 0.3;
        const cpx2 = prev.x + (curr.x - prev.x) * 0.7;
        d += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
      }

      const lastPoint = points[points.length - 1];
      const fillPath = d +
        ` L ${lastPoint.x} ${computedZeroY}` +
        ` L ${points[0].x} ${computedZeroY} Z`;

      return {
        path: d,
        fillPath,
        color: ds.color,
        label: ds.label,
        lastPoint,
        lastValue: ds.data[ds.data.length - 1],
        points,
      };
    });

    return { paths: computedPaths, yMin: computedYMin, yMax: computedYMax, yTicks: ticks, zeroY: computedZeroY };
  }, [datasets, plotWidth, plotHeight]);

  const labelInterval = Math.max(1, Math.floor(timeLabels.length / 4));

  const activeX = activeIndex !== null && paths.length > 0 && paths[0].points[activeIndex]
    ? paths[0].points[activeIndex].x
    : null;

  const tooltipWidth = 140;
  const tooltipX = activeX !== null
    ? (activeX + tooltipWidth + 8 > chartWidth ? activeX - tooltipWidth - 8 : activeX + 8)
    : 0;

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={(e) => {
        layoutRef.current = {
          x: e.nativeEvent.layout.x,
          y: e.nativeEvent.layout.y,
          width: e.nativeEvent.layout.width,
        };
        containerRef.current?.measureInWindow?.((wx) => {
          if (wx !== undefined) layoutRef.current.x = wx;
        });
      }}
      {...panResponder.panHandlers}
    >
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          {paths.map((p, i) => (
            <LinearGradient key={`grad-${i}`} id={`areaGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={p.color} stopOpacity="0.2" />
              <Stop offset="0.7" stopColor={p.color} stopOpacity="0.05" />
              <Stop offset="1" stopColor={p.color} stopOpacity="0" />
            </LinearGradient>
          ))}
        </Defs>

        {yTicks.map((tick, i) => {
          const y = paddingTop + plotHeight * ((yMax - tick) / (yMax - yMin));
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke={tick === 0 ? `${Colors.dark.textTertiary}60` : `${Colors.dark.divider}40`}
                strokeWidth={tick === 0 ? 0.8 : 0.5}
                strokeDasharray={tick === 0 ? undefined : "3,5"}
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                fill={Colors.dark.textTertiary}
                fontSize={9}
                fontWeight="500"
                opacity={0.7}
              >
                {tick > 0 ? `+${tick}%` : `${tick}%`}
              </SvgText>
            </React.Fragment>
          );
        })}

        {timeLabels.map((label, i) => {
          if (i % labelInterval !== 0 && i !== timeLabels.length - 1) return null;
          const x = paddingLeft + (i / (timeLabels.length - 1)) * plotWidth;
          return (
            <SvgText
              key={`time-${i}`}
              x={x}
              y={chartHeight - 4}
              textAnchor="middle"
              fill={Colors.dark.textTertiary}
              fontSize={9}
              opacity={0.6}
            >
              {label}
            </SvgText>
          );
        })}

        {paths.map((p, i) => (
          <Path
            key={`fill-${i}`}
            d={p.fillPath}
            fill={`url(#areaGrad${i})`}
          />
        ))}

        {paths.map((p, i) => (
          <Path
            key={`line-${i}`}
            d={p.path}
            stroke={p.color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {activeIndex === null && paths.map((p, i) => (
          <React.Fragment key={`end-${i}`}>
            <Circle
              cx={p.lastPoint.x}
              cy={p.lastPoint.y}
              r={4}
              fill={Colors.dark.surface}
              stroke={p.color}
              strokeWidth={2}
            />
          </React.Fragment>
        ))}

        {activeIndex !== null && activeX !== null && (
          <>
            <Line
              x1={activeX}
              y1={paddingTop}
              x2={activeX}
              y2={chartHeight - paddingBottom}
              stroke={Colors.dark.textTertiary}
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.5}
            />
            {paths.map((p, i) => {
              const pt = p.points[activeIndex];
              if (!pt) return null;
              return (
                <React.Fragment key={`active-dot-${i}`}>
                  <Circle cx={pt.x} cy={pt.y} r={6} fill={`${p.color}30`} />
                  <Circle cx={pt.x} cy={pt.y} r={4} fill={Colors.dark.surface} stroke={p.color} strokeWidth={2} />
                </React.Fragment>
              );
            })}
          </>
        )}
      </Svg>

      {activeIndex !== null && (
        <View
          style={[
            styles.tooltip,
            {
              left: tooltipX,
              top: 4,
            },
          ]}
        >
          <Text style={styles.tooltipTime}>
            {timeLabels[activeIndex] || ""}
          </Text>
          {datasets.map((ds, i) => {
            const val = ds.data[activeIndex];
            if (val === undefined) return null;
            const isPositive = val >= 0;
            return (
              <View key={i} style={styles.tooltipRow}>
                <View style={[styles.tooltipDot, { backgroundColor: ds.color }]} />
                <Text style={styles.tooltipLabel}>{ds.label}</Text>
                <Text
                  style={[
                    styles.tooltipValue,
                    { color: isPositive ? Colors.dark.positive : Colors.dark.negative },
                  ]}
                >
                  {isPositive ? "+" : ""}{val.toFixed(2)}%
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 4,
    position: "relative",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(20, 22, 30, 0.95)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    minWidth: 120,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 12px rgba(0,0,0,0.4)" as any }
      : {}),
  },
  tooltipTime: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    marginBottom: 6,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  tooltipLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  tooltipValue: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
});
