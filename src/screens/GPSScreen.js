import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { HopButton, HopCard, HopScreen, HopText, HopBadge } from '../components';
import { colors, spacing, hopTheme } from '../theme/tokens';
import { copy } from '../constants/copy';
import { saveAuthentication, getActiveRace } from '../database/queries';
import {
  isValidDistance,
  formatDistance,
  formatDuration
} from '../utils/calculations';

const GPSScreen = ({ navigation }) => {
  const [tracking, setTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', copy.gps.messages.permissionRequired);
        return;
      }

      setTracking(true);
      setDistance(0);
      setDuration(0);
      const startTime = Date.now();

      const location = await Location.getCurrentPositionAsync({});
      setStartLocation(location.coords);

      let lastLocation = location.coords;
      let totalDistance = 0;

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5
        },
        (newLocation) => {
          const newCoords = newLocation.coords;
          const dist = haversineDistance(
            lastLocation.latitude,
            lastLocation.longitude,
            newCoords.latitude,
            newCoords.longitude
          );

          totalDistance += dist;
          setDistance(totalDistance);

          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setDuration(elapsed);

          lastLocation = newCoords;
          setEndLocation(newCoords);
        }
      );

      setSubscription(sub);
    } catch (error) {
      Alert.alert('오류', 'GPS 추적 실패: ' + error.message);
      setTracking(false);
    }
  };

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setTracking(false);
  };

  const completeAuthentication = async () => {
    if (!isValidDistance(distance, 3)) {
      Alert.alert('알림', copy.gps.messages.distanceNotEnough);
      return;
    }

    try {
      const race = await getActiveRace();
      if (!race) {
        Alert.alert('알림', '활성 경주가 없습니다');
        return;
      }

      await saveAuthentication(race.raceId, {
        type: 'gps',
        distance: parseFloat(distance.toFixed(2)),
        duration,
        startLat: startLocation?.latitude,
        startLng: startLocation?.longitude,
        endLat: endLocation?.latitude,
        endLng: endLocation?.longitude
      });

      Alert.alert('🎉 ' + copy.home.card.todayHop, copy.gps.messages.success, [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', copy.gps.messages.saveError + ': ' + error.message);
    }
  };

  return (
    <HopScreen scroll={false}>
      <HopText variant="h1" weight="bold" tone="dark" style={styles.title}>
        {copy.gps.title}
      </HopText>

      {/* 지도 영역 (placeholder) */}
      <HopCard
        variant="default"
        background={hopTheme.backgrounds.mapArea}
        contentStyle={styles.mapContent}
      >
        <HopText variant="body" tone="brown">
          {tracking ? copy.gps.state.tracking : copy.gps.state.idle}
        </HopText>
        {tracking ? (
          <HopBadge tone="info" icon="📍" label="추적 중" style={styles.trackingBadge} />
        ) : null}
      </HopCard>

      {/* 통계 카드 */}
      <HopCard variant="default">
        <View style={styles.statRow}>
          <HopText variant="bodySmall" tone="light">
            {copy.gps.stats.distance}
          </HopText>
          <HopText variant="h2" weight="bold" tone="rabbit">
            {formatDistance(distance)}
          </HopText>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <HopText variant="bodySmall" tone="light">
            경과 시간
          </HopText>
          <HopText variant="h3" weight="bold" tone="dark">
            {formatDuration(duration)}
          </HopText>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <HopText variant="bodySmall" tone="light">
            {copy.gps.stats.status}
          </HopText>
          <HopText variant="body" weight="semibold" tone={tracking ? 'rabbit' : 'medium'}>
            {tracking ? '📍 추적 중' : '준비됨'}
          </HopText>
        </View>
      </HopCard>

      {/* 버튼 그룹 */}
      <View style={styles.buttonGroup}>
        {!tracking ? (
          <HopButton
            title={copy.gps.button.start}
            variant="primary"
            onPress={startTracking}
          />
        ) : (
          <>
            <HopButton
              title={copy.gps.button.stop}
              variant="secondary"
              onPress={stopTracking}
            />
            {distance >= 3 ? (
              <HopButton
                title={copy.gps.button.complete}
                variant="primary"
                onPress={completeAuthentication}
              />
            ) : null}
          </>
        )}
        <HopButton
          title={copy.gps.button.back}
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </HopScreen>
  );
};

/**
 * Haversine 거리 계산 (km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  mapContent: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trackingBadge: {
    marginTop: spacing.sm
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary.neutralGray
  },
  buttonGroup: {
    marginTop: spacing.sm
  }
});

export default GPSScreen;
