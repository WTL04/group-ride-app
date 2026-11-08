import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native';
import { colors, spacing } from '../theme';
import {
  LatLon,
  fetchBicycleRoute,
  formatDistance,
  haversineKm,
  reverseLabel,
  stadiaStyleUrl,
} from '../lib/stadia';
import type { DistanceUnit } from '../types';

export interface RouteValue {
  start: LatLon | null;
  end: LatLon | null;
  coordinates: LatLon[];
  distanceKm: number | null;
  startLabel: string;
  endLabel: string;
  snapped: boolean;
}

interface Props {
  apiKey: string;
  distanceUnit: DistanceUnit;
  value: RouteValue;
  onChange: (next: RouteValue) => void;
  fullscreen?: boolean;
}

export const EMPTY_ROUTE: RouteValue = {
  start: null,
  end: null,
  coordinates: [],
  distanceKm: null,
  startLabel: '',
  endLabel: '',
  snapped: false,
};

const FALLBACK_STYLE = 'https://demotiles.maplibre.org/style.json';

function toGeoJSON(coordinates: LatLon[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates.map(p => [p.lon, p.lat]),
        },
      },
    ],
  };
}

export function RoutePicker({
  apiKey,
  distanceUnit,
  value,
  onChange,
  fullscreen,
}: Props) {
  const [target, setTarget] = useState<'start' | 'end'>('start');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  const resolveRoute = useCallback(
    async (start: LatLon, end: LatLon, current: RouteValue) => {
      const mySeq = ++seq.current;
      setLoading(true);
      setStatus(apiKey ? 'Routing…' : 'Straight-line preview (no key).');
      try {
        if (!apiKey) {
          if (mySeq !== seq.current) return;
          onChange({
            ...current,
            start,
            end,
            coordinates: [start, end],
            distanceKm: haversineKm(start, end),
            startLabel: `${start.lat.toFixed(4)}, ${start.lon.toFixed(4)}`,
            endLabel: `${end.lat.toFixed(4)}, ${end.lon.toFixed(4)}`,
            snapped: false,
          });
          return;
        }
        const [route, startLabel, endLabel] = await Promise.all([
          fetchBicycleRoute([start, end], apiKey),
          reverseLabel(start, apiKey).catch(
            () => `${start.lat.toFixed(4)}, ${start.lon.toFixed(4)}`,
          ),
          reverseLabel(end, apiKey).catch(
            () => `${end.lat.toFixed(4)}, ${end.lon.toFixed(4)}`,
          ),
        ]);
        if (mySeq !== seq.current) return;
        onChange({
          start,
          end,
          coordinates: route.coordinates,
          distanceKm: route.distanceKm,
          startLabel,
          endLabel,
          snapped: true,
        });
        setStatus('');
      } catch (e) {
        if (mySeq !== seq.current) return;
        onChange({ ...current, start, end, coordinates: [], distanceKm: null, snapped: false });
        setStatus(e instanceof Error ? e.message : 'Routing failed.');
      } finally {
        if (mySeq === seq.current) setLoading(false);
      }
    },
    [apiKey, onChange],
  );

  useEffect(() => {
    if (value.start && value.end && value.distanceKm === null && !loading) {
      resolveRoute(value.start, value.end, value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.start, value.end]);

  const handleMapPress = useCallback(
    (event: any) => {
      const lngLat: [number, number] | undefined =
        event?.nativeEvent?.lngLat ?? event?.geometry?.coordinates;
      if (!lngLat || lngLat.length < 2) return;
      const point: LatLon = { lon: lngLat[0], lat: lngLat[1] };
      if (target === 'start') {
        const next = { ...value, start: point, distanceKm: null };
        onChange(next);
        if (next.end) resolveRoute(point, next.end, next);
        else setTarget('end');
      } else {
        const next = { ...value, end: point, distanceKm: null };
        onChange(next);
        if (next.start) resolveRoute(next.start, point, next);
        else setTarget('start');
      }
    },
    [target, value, onChange, resolveRoute],
  );

  const clear = useCallback(() => {
    seq.current += 1;
    setLoading(false);
    setStatus('');
    setTarget('start');
    onChange({ ...EMPTY_ROUTE });
  }, [onChange]);

  const center: [number, number] = value.start
    ? [value.start.lon, value.start.lat]
    : [-73.97, 40.78];

  return (
    <View style={fullscreen && styles.fullRoot}>
      <View style={styles.row}>
        <Pressable
          testID="route-set-start"
          accessibilityRole="radio"
          accessibilityState={{ selected: target === 'start' }}
          style={[styles.chip, target === 'start' && styles.chipActive]}
          onPress={() => setTarget('start')}>
          <Text
            style={[styles.chipText, target === 'start' && styles.chipActiveText]}>
            1 · Start
          </Text>
        </Pressable>
        <Pressable
          testID="route-set-end"
          accessibilityRole="radio"
          accessibilityState={{ selected: target === 'end' }}
          style={[styles.chip, target === 'end' && styles.chipActive]}
          onPress={() => setTarget('end')}>
          <Text
            style={[styles.chipText, target === 'end' && styles.chipActiveText]}>
            2 · End
          </Text>
        </Pressable>
        <Pressable
          testID="route-clear"
          accessibilityRole="button"
          style={styles.chip}
          onPress={clear}>
          <Text style={styles.chipText}>Clear</Text>
        </Pressable>
      </View>

      <View
        testID="route-picker-map"
        style={[styles.mapWrap, fullscreen && styles.mapWrapFull]}>
        <Map
          style={styles.map}
          mapStyle={apiKey ? stadiaStyleUrl(apiKey) : FALLBACK_STYLE}
          onPress={handleMapPress}
          logo={false}>
          <Camera
            center={center}
            zoom={11}
          />
          {value.coordinates.length > 1 ? (
            <GeoJSONSource id="route" data={toGeoJSON(value.coordinates)}>
              <Layer
                id="route-line"
                type="line"
                paint={{ 'line-color': colors.primary, 'line-width': 4 }}
              />
            </GeoJSONSource>
          ) : null}
          {value.start ? (
            <Marker id="start-pin" lngLat={[value.start.lon, value.start.lat]}>
              <View style={styles.pinStart} />
            </Marker>
          ) : null}
          {value.end ? (
            <Marker id="end-pin" lngLat={[value.end.lon, value.end.lat]}>
              <View style={styles.pinEnd} />
            </Marker>
          ) : null}
        </Map>
      </View>

      <Text style={styles.helper}>
        Tap map to drop {target}. Then tap again for the other end.
      </Text>
      {value.distanceKm !== null ? (
        <Text testID="route-distance" style={styles.distance}>
          {formatDistance(value.distanceKm, distanceUnit)}
          {value.snapped ? ' · bike route' : ' · straight line'}
        </Text>
      ) : null}
      {status || loading ? (
        <Text testID="route-status" style={styles.status}>
          {loading ? 'Routing…' : status}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullRoot: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  chip: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipActiveText: { color: '#fff' },
  mapWrap: {
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
  },
  mapWrapFull: {
    height: undefined,
    flex: 1,
    borderRadius: 0,
    marginTop: 0,
    borderWidth: 0,
  },
  map: { flex: 1 },
  pinStart: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1B8737',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinEnd: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B3261E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  helper: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  distance: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  status: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
});
