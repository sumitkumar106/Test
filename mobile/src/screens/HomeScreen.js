import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import busService from '../services/busService';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const { user, handleLogout } = useAuth();

  const [fromStand, setFromStand] = useState('');
  const [toStand, setToStand] = useState('');
  const [busQuery, setBusQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load search history
   */
  const loadSearchHistory = async () => {
    try {
      const history = await busService.getSearchHistory();
      setSearchHistory(history.slice(0, 10)); // Show last 10
    } catch (error) {
      // Silently fail - search history is not critical
      console.log('Failed to load search history:', error.message);
    }
  };

  /**
   * Load search history on mount
   */
  useEffect(() => {
    loadSearchHistory();
  }, []);

  /**
   * Handle search button press
   */
  const handleSearch = () => {
    if (!fromStand.trim() || !toStand.trim()) {
      Alert.alert('Required Fields', 'Please enter both From and To stands');
      return;
    }

    navigation.navigate('BusResults', {
      from: fromStand.trim(),
      to: toStand.trim(),
    });
  };

  /**
   * Handle bus number/name search
   */
  const handleBusSearch = () => {
    if (!busQuery.trim()) {
      Alert.alert('Required Field', 'Please enter a bus number or name');
      return;
    }

    navigation.navigate('BusResults', {
      query: busQuery.trim(),
    });
  };

  /**
   * Handle search history item tap
   */
  const handleHistoryItemPress = (item) => {
    setFromStand(item.from_stand);
    setToStand(item.to_stand);
  };

  /**
   * Handle logout
   */
  const onLogout = async () => {
    await handleLogout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome to bus stand</Text>
          <Text style={styles.subtitle}>Where are you going to next?</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      {user && (
        <View style={styles.userInfo}>
          <View style={styles.userInfoLeft}>
            <Text style={styles.userName}>Hello, {user.name}!</Text>
            <Text style={styles.userRole}>
              {user.role === 'driver' ? '🚌 Driver' : '👤 Passenger'}
            </Text>
          </View>
          {user.role === 'driver' && (
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={() => navigation.navigate('DriverDashboard')}
            >
              <Text style={styles.dashboardButtonText}>My Buses</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* From/To Search */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Buses</Text>

        {/* From Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🚏 From</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter start location"
            placeholderTextColor="#999"
            value={fromStand}
            onChangeText={setFromStand}
          />
        </View>

        {/* To Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📍 To</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            placeholderTextColor="#999"
            value={toStand}
            onChangeText={setToStand}
          />
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Bus</Text>
        </TouchableOpacity>
      </View>

      {/* Bus Number/Name Search */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search by Bus Number/Name</Text>

        <View style={styles.busSearchContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Bus No./Bus Name"
            placeholderTextColor="#999"
            value={busQuery}
            onChangeText={setBusQuery}
          />
          <TouchableOpacity style={styles.busSearchButton} onPress={handleBusSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search History */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search History</Text>
        {searchHistory.length === 0 ? (
          <Text style={styles.emptyText}>No recent searches</Text>
        ) : (
          searchHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>
                {item.from} → {item.to}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Banner Ad Placeholder */}
      <View style={styles.bannerAd}>
        <Text style={styles.bannerAdText}>banner ads</Text>
      </View>

      {/* Placeholder for future features */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          ⚠️ This is Phase 1: Authentication Complete!
        </Text>
        <Text style={styles.placeholderSubtext}>
          Search functionality, bus listings, GPS tracking, and other features will be implemented in subsequent phases.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 20,
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    height: 50,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  busSearchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  busSearchButton: {
    width: 60,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  bannerAd: {
    height: 60,
    backgroundColor: '#F4E6A3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bannerAdText: {
    fontSize: 14,
    color: '#666',
  },
  placeholder: {
    padding: 20,
    margin: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#388e3c',
    lineHeight: 20,
  },
});

export default HomeScreen;
