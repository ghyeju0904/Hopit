import React, { useState } from 'react';
import { View, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { HopButton, HopCard, HopScreen, HopText } from '../components';
import { colors, spacing, borderRadius } from '../theme/tokens';
import { copy } from '../constants/copy';
import { saveAuthentication, getActiveRace } from '../database/queries';
import { analyzeRunningPhoto, isAnalysisBlocked } from '../utils/imageAnalysis';

const PhotoScreen = ({ navigation }) => {
  const [photo, setPhoto]               = useState(null);
  const [photoBase64, setPhotoBase64]   = useState(null);
  const [memo, setMemo]                 = useState('');
  const [loading, setLoading]           = useState(false);
  const [analyzing, setAnalyzing]       = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const pickImage = async (fromCamera) => {
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('알림', copy.photo.messages.cameraPermissionRequired);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7,
          base64: true,
        });
      }

      if (result.canceled) return;

      const asset = result.assets[0];
      setPhoto(asset.uri);
      setPhotoBase64(asset.base64 || null);
      setAnalysisResult(null);

      if (asset.base64) {
        runAnalysis(asset.base64);
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  const runAnalysis = async (base64) => {
    setAnalyzing(true);
    try {
      const result = await analyzeRunningPhoto(base64);
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisResult({ error: true, message: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const completeAuthentication = async () => {
    if (!photo) {
      Alert.alert('알림', copy.photo.messages.photoRequired);
      return;
    }
    if (isAnalysisBlocked(analysisResult)) {
      Alert.alert('인증 불가', '러닝 앱 운동 기록 화면을 올려주세요.\n\n나이키런클럽, 스트라바, 애플 건강, 삼성헬스 등의 결과 화면을 캡처해서 업로드하세요.');
      return;
    }

    try {
      setLoading(true);
      const race = await getActiveRace();
      if (!race) {
        Alert.alert('알림', copy.photo.messages.photoNotSelected);
        return;
      }

      await saveAuthentication(race.raceId, {
        type: 'photo',
        photoPath: photo,
        memo: memo || null,
        analysisData: analysisResult && !analysisResult.skipped ? analysisResult : null,
      });

      Alert.alert('🎉 ' + copy.home.card.todayHop, copy.photo.messages.success, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('오류', copy.photo.messages.saveError + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const blocked = isAnalysisBlocked(analysisResult);

  return (
    <HopScreen>
      <HopText variant="h1" weight="bold" tone="dark" style={styles.title}>
        {copy.photo.title}
      </HopText>

      {/* 사진 영역 */}
      <HopCard variant="default" contentStyle={styles.photoContent}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} resizeMode="contain" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <HopText style={styles.placeholderEmoji}>📸</HopText>
            <HopText variant="body" tone="light">{copy.photo.placeholder}</HopText>
          </View>
        )}
      </HopCard>

      {/* 사진 선택 버튼 */}
      <View style={styles.photoButtons}>
        <View style={styles.photoButton}>
          <HopButton title={copy.photo.button.camera}  variant="primary"   onPress={() => pickImage(true)} />
        </View>
        <View style={styles.photoButton}>
          <HopButton title={copy.photo.button.gallery} variant="secondary" onPress={() => pickImage(false)} />
        </View>
      </View>

      {/* 분석 중 */}
      {analyzing && (
        <View style={styles.analyzeRow}>
          <ActivityIndicator size="small" color={colors.primary.warmSage} />
          <HopText variant="body" tone="medium" style={styles.analyzeText}>
            운동 기록 분석 중...
          </HopText>
        </View>
      )}

      {/* 분석 결과 */}
      {!analyzing && analysisResult && !analysisResult.skipped && (
        <AnalysisCard result={analysisResult} />
      )}

      {/* 메모 + 인증 버튼 */}
      {photo && !analyzing && (
        <>
          <TextInput
            label={copy.photo.memoLabel}
            value={memo}
            onChangeText={setMemo}
            placeholder={copy.photo.memoPlaceholder}
            multiline
            numberOfLines={3}
            mode="outlined"
            outlineColor={colors.secondary.neutralGray}
            activeOutlineColor={colors.primary.warmSage}
            style={styles.memoInput}
          />
          <HopButton
            title={loading ? '저장 중...' : copy.photo.button.submit}
            variant={blocked ? 'disabled' : 'primary'}
            onPress={completeAuthentication}
            disabled={loading || blocked}
          />
        </>
      )}

      <HopButton
        title={copy.photo.button.back}
        variant="secondary"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
    </HopScreen>
  );
};

// ── 분석 결과 카드 ───────────────────────────────────────────────
const AnalysisCard = ({ result }) => {
  if (result.error) {
    return (
      <View style={[styles.resultCard, styles.resultWarn]}>
        <HopText variant="body" weight="semibold" style={{ color: colors.primary.carrotOrange }}>
          ⚠️ 분석 실패 — 인증은 계속 진행 가능
        </HopText>
        <HopText variant="caption" tone="light" style={{ marginTop: 2 }}>
          {result.message}
        </HopText>
      </View>
    );
  }

  const valid = result.isRunning === true;
  const borderColor = valid ? colors.primary.warmSage : colors.primary.carrotOrange;
  const badge = valid ? '✅ 러닝 인증 확인' : '❌ 러닝 기록이 아닙니다';
  const badgeColor = valid ? colors.primary.warmSage : colors.primary.carrotOrange;

  return (
    <View style={[styles.resultCard, { borderColor }]}>
      <HopText variant="body" weight="bold" style={{ color: badgeColor, marginBottom: spacing.xs }}>
        {badge}
      </HopText>

      <View style={styles.metricsRow}>
        {result.distance != null && (
          <MetricChip label="거리" value={`${result.distance}km`} />
        )}
        {result.heartRate != null && (
          <MetricChip label="심박수" value={`${result.heartRate}bpm`} />
        )}
        {result.avgSpeed != null && (
          <MetricChip label="평균속도" value={`${result.avgSpeed}km/h`} />
        )}
        {result.duration != null && (
          <MetricChip label="시간" value={result.duration} />
        )}
      </View>

      <HopText variant="caption" tone="light" style={{ marginTop: spacing.xs }}>
        {result.reason}
      </HopText>
    </View>
  );
};

const MetricChip = ({ label, value }) => (
  <View style={styles.chip}>
    <HopText variant="caption" tone="light">{label}</HopText>
    <HopText variant="body" weight="semibold" tone="dark">{value}</HopText>
  </View>
);

// ── 스타일 ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  photoContent: {
    padding: 0,
  },
  photo: {
    width: '100%',
    height: 260,
    borderRadius: borderRadius.xs,
  },
  photoPlaceholder: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.bgLight,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.secondary.neutralGray,
    borderStyle: 'dashed',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoButton: {
    flex: 1,
  },
  analyzeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  analyzeText: {
    marginLeft: spacing.xs,
  },
  resultCard: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  resultWarn: {
    borderColor: colors.primary.carrotOrange,
    backgroundColor: '#FFF4E8',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.neutral.bgLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 70,
  },
  memoInput: {
    backgroundColor: '#FFFFFF',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButton: {
    marginTop: spacing.sm,
  },
});

export default PhotoScreen;
