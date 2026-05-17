import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { TextInput, Checkbox, Button as PaperButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HopButton, HopCard, HopScreen, HopText } from '../components';
import { colors, spacing, typography } from '../theme/tokens';
import { copy } from '../constants/copy';
import { createRace } from '../database/queries';

const SettingsScreen = ({ navigation, route }) => {
  const isInitial = route?.name === 'InitialSettings';

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [weeklyGoal, setWeeklyGoal] = useState('5');
  const [useGPS, setUseGPS] = useState(true);
  const [usePhoto, setUsePhoto] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (event, date) => {
    if (date) setStartDate(date);
    setShowStartPicker(false);
  };

  const handleEndDateChange = (event, date) => {
    if (date) setEndDate(date);
    setShowEndPicker(false);
  };

  const handleStartRace = async () => {
    if (!useGPS && !usePhoto) {
      Alert.alert('알림', '최소 하나의 인증 방법을 선택하세요');
      return;
    }

    try {
      setLoading(true);
      await createRace(
        startDate.toISOString(),
        endDate.toISOString(),
        parseInt(weeklyGoal, 10) || 5,
        { gps: useGPS, photo: usePhoto }
      );

      if (isInitial) {
        navigation.replace('MainTabs');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('오류', '경주 시작 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HopScreen>
      <HopText variant="h1" tone="dark" weight="bold" style={styles.title}>
        {isInitial ? copy.settings.title : '새 경주 시작'}
      </HopText>

      {/* 기간 설정 */}
      <HopCard variant="default">
        <HopText variant="h4" weight="semibold" tone="dark" style={styles.sectionTitle}>
          {copy.settings.label.period}
        </HopText>

        <View style={styles.dateContainer}>
          <PaperButton
            mode="outlined"
            onPress={() => setShowStartPicker(true)}
            style={styles.dateButton}
            textColor={colors.primary.coolMoss}
          >
            {startDate.toLocaleDateString('ko-KR')}
          </PaperButton>
          <HopText variant="body" tone="light" style={styles.dateSeparator}>~</HopText>
          <PaperButton
            mode="outlined"
            onPress={() => setShowEndPicker(true)}
            style={styles.dateButton}
            textColor={colors.primary.coolMoss}
          >
            {endDate.toLocaleDateString('ko-KR')}
          </PaperButton>
        </View>

        {showStartPicker && (
          <DateTimePicker value={startDate} mode="date" onChange={handleStartDateChange} />
        )}
        {showEndPicker && (
          <DateTimePicker value={endDate} mode="date" onChange={handleEndDateChange} />
        )}
      </HopCard>

      {/* 주간 목표 */}
      <HopCard variant="default">
        <HopText variant="h4" weight="semibold" tone="dark" style={styles.sectionTitle}>
          {copy.settings.label.goal}
        </HopText>
        <HopText variant="bodySmall" tone="light" style={styles.sectionHint}>
          {copy.settings.label.goalHint}
        </HopText>

        <View style={styles.goalButtons}>
          {[3, 5, 7].map((goal) => {
            const selected = weeklyGoal === String(goal);
            return (
              <PaperButton
                key={goal}
                mode={selected ? 'contained' : 'outlined'}
                onPress={() => setWeeklyGoal(String(goal))}
                buttonColor={selected ? colors.primary.warmSage : undefined}
                textColor={selected ? '#FFFFFF' : colors.primary.coolMoss}
                style={styles.goalButton}
              >
                {goal}회
              </PaperButton>
            );
          })}
        </View>

        <TextInput
          label="직접 입력"
          value={weeklyGoal}
          onChangeText={setWeeklyGoal}
          keyboardType="number-pad"
          mode="outlined"
          outlineColor={colors.secondary.neutralGray}
          activeOutlineColor={colors.primary.warmSage}
          style={styles.input}
        />
      </HopCard>

      {/* 인증 방법 */}
      <HopCard variant="default">
        <HopText variant="h4" weight="semibold" tone="dark" style={styles.sectionTitle}>
          {copy.settings.label.method}
        </HopText>

        <View style={styles.checkboxItem}>
          <Checkbox
            status={useGPS ? 'checked' : 'unchecked'}
            onPress={() => setUseGPS(!useGPS)}
            color={colors.primary.warmSage}
          />
          <HopText variant="body" tone="medium" style={styles.checkboxLabel}>
            {copy.settings.methodLabels.gps} 자동 인증
          </HopText>
        </View>

        <View style={styles.checkboxItem}>
          <Checkbox
            status={usePhoto ? 'checked' : 'unchecked'}
            onPress={() => setUsePhoto(!usePhoto)}
            color={colors.primary.warmSage}
          />
          <HopText variant="body" tone="medium" style={styles.checkboxLabel}>
            {copy.settings.methodLabels.photo} 인증
          </HopText>
        </View>
      </HopCard>

      <HopButton
        title={loading ? '시작 중...' : copy.settings.buttonStart}
        variant="primary"
        onPress={handleStartRace}
        disabled={loading}
        style={styles.startButton}
      />
    </HopScreen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  sectionTitle: {
    marginBottom: spacing.sm
  },
  sectionHint: {
    marginBottom: spacing.sm
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderColor: colors.secondary.neutralGray
  },
  dateSeparator: {
    marginHorizontal: spacing.sm
  },
  goalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm
  },
  goalButton: {
    minWidth: 70
  },
  input: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF'
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm
  },
  checkboxLabel: {
    marginLeft: spacing.sm
  },
  startButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl
  }
});

export default SettingsScreen;
