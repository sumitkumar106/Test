import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import BusResultsScreen from '../screens/BusResultsScreen';
import DriverDashboardScreen from '../screens/DriverDashboardScreen';
import DriverCreateBusScreen from '../screens/DriverCreateBusScreen';
import DriverEditBusScreen from '../screens/DriverEditBusScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Auth Stack - Login and Signup screens
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

/**
 * Main App Stack - Authenticated screens
 */
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Bus Stand' }}
      />
      {/* TODO: Add more screens in future phases */}
      {/* <Stack.Screen name="BusResults" component={BusResultsScreen} /> */}
      {/* <Stack.Screen name="BusDetails" component={BusDetailsScreen} /> */}
      {/* <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} /> */}
    </Stack.Navigator>
  );
};

/**
 * Main App Navigator with Authentication Flow
 */
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AppNavigator;
