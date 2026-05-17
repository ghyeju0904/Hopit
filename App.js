import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 데이터베이스 초기화
import { initDatabase } from './src/database/db';

// 디자인 토큰
import { colors } from './src/theme/tokens';

// 화면 컴포넌트
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthChoiceScreen from './src/screens/AuthChoiceScreen';
import GPSScreen from './src/screens/GPSScreen';
import PhotoScreen from './src/screens/PhotoScreen';
import StatsScreen from './src/screens/StatsScreen';
import ResultScreen from './src/screens/ResultScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ONBOARDING_KEY = 'hopit:hasOnboarded';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.warmSage,
    secondary: colors.primary.coolMoss,
    background: colors.neutral.bgWhite,
    surface: '#FFFFFF',
    onSurface: colors.neutral.textMedium
  }
};

const CenteredLoader = ({ message }) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.neutral.bgWhite
    }}
  >
    <ActivityIndicator size="large" color={colors.primary.warmSage} />
    {message ? (
      <Text style={{ marginTop: 12, color: colors.neutral.textLight }}>{message}</Text>
    ) : null}
  </View>
);

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary.warmSage,
        tabBarInactiveTintColor: colors.neutral.textLight,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: colors.neutral.textDark }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '홈',
          tabBarLabel: '홈',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>
        }}
      />
      <Tab.Screen
        name="Auth"
        component={AuthChoiceScreen}
        options={{
          title: '인증',
          tabBarLabel: '인증',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✓</Text>
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: '통계',
          tabBarLabel: '통계',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '설정',
          tabBarLabel: '설정',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const [isOnboarded, setIsOnboarded] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem(ONBOARDING_KEY);
        setIsOnboarded(hasOnboarded === 'true');
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setIsOnboarded(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Failed to save onboarding flag:', error);
    }
  };

  if (isOnboarded === null) {
    return <CenteredLoader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true
        }}
      >
        {!isOnboarded ? (
          <>
            <Stack.Screen name="Onboarding" options={{ animationEnabled: false }}>
              {(props) => (
                <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />
              )}
            </Stack.Screen>
            <Stack.Screen name="InitialSettings" component={SettingsScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="GPS" component={GPSScreen} />
            <Stack.Screen name="Photo" component={PhotoScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="InitialSettings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Database initialization error:', error);
        setDbError(error.message);
      }
    };
    setupDatabase();
  }, []);

  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: colors.neutral.bgWhite
        }}
      >
        <Text style={{ color: colors.error, fontWeight: 'bold', marginBottom: 8 }}>
          데이터베이스 오류
        </Text>
        <Text style={{ color: colors.neutral.textLight, textAlign: 'center' }}>
          {dbError}
        </Text>
      </View>
    );
  }

  if (!dbReady) {
    return <CenteredLoader message="데이터 준비 중..." />;
  }

  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
    </PaperProvider>
  );
}
