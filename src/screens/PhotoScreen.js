import React, { useState } from 'react';
import { View, Image, Alert, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { HopButton, HopCard, HopScreen, HopText } from '../components';
import { colors, spacing, borderRadius } from '../theme/tokens';
import { copy } from '../constants/copy';
import { saveAuthentication, getActiveRace } from '../database/queries';

const PhotoScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  const selectPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('오류', '사진 선택 실패: ' + error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', copy.photo.messages.cameraPermissionRequired);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('오류', '카메라 실패: ' + error.message);
    }
  };

  const completeAuthentication = async () => {
    if (!photo) {
      Alert.alert('알림', copy.photo.messages.photoRequired);
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
        memo: memo || null
      });

      Alert.alert('🎉 ' + copy.home.card.todayHop, copy.photo.messages.success, [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', copy.photo.messages.saveError + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HopScreen>
      <HopText variant="h1" weight="bold" tone="dark" style={styles.title}>
        {copy.photo.title}
      </HopText>

      {/* 사진 영역 */}
      <HopCard
        variant="default"
        contentStyle={styles.photoContent}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <HopText style={styles.placeholderEmoji}>📸</HopText>
            <HopText variant="body" tone="light">
              {copy.photo.placeholder}
            </HopText>
          </View>
        )}
      </HopCard>

      {/* 사진 선택 버튼 */}
      <View style={styles.photoButtons}>
        <View style={styles.photoButton}>
          <HopButton
            title={copy.photo.button.camera}
            variant="primary"
            onPress={takePhoto}
          />
        </View>
        <View style={styles.photoButton}>
          <HopButton
            title={copy.photo.button.gallery}
            variant="secondary"
            onPress={selectPhoto}
          />
        </View>
      </View>

      {photo ? (
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
            variant="primary"
            onPress={completeAuthentication}
            disabled={loading}
          />
        </>
      ) : null}

      <HopButton
        title={copy.photo.button.back}
        variant="secondary"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
    </HopScreen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  photoContent: {
    padding: 0
  },
  photo: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
    borderRadius: borderRadius.xs
  },
  photoPlaceholder: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.bgLight,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.secondary.neutralGray,
    borderStyle: 'dashed'
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  photoButton: {
    flex: 1
  },
  memoInput: {
    backgroundColor: '#FFFFFF',
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  backButton: {
    marginTop: spacing.sm
  }
});

export default PhotoScreen;
