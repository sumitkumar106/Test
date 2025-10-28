import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import driverService from '../services/driverService';
import { useFocusEffect } from '@react-navigation/native';

const DriverDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load driver's buses
   */
  const loadBuses = async () => {
    try {
      setIsLoading(true);
      const driverBuses = await driverService.getMyBuses();
      setBuses(driverBuses);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadBuses();
    setRefreshing(false);
  };

  /**
   * Handle delete bus
   */
  const handleDeleteBus = (busId, busName) => {
    Alert.alert(
      'Delete Bus',
      `Are you sure you want to delete ${busName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await driverService.deleteBus(busId);
              Alert.alert('Success', 'Bus deleted successfully');
              loadBuses(); // Reload list
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  // Load buses on mount and when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadBuses();
    }, [])
  );

  /**
   * Render bus card
   */
  const renderBusCard = ({ item }) => (
    <View style={styles.busCard}>
      <View style={styles.busHeader}>
        <View style={styles.busInfo}>
          <Text style={styles.busName}>{item.bus_name}</Text>
          <Text style={styles.busNumber}>{item.bus_number}</Text>
        </View>
        <View style={styles.busActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('DriverEditBus', { busId: item.id })}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBus(item.id, item.bus_name)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.busRoute}>
        <Text style={styles.routeText}>
          {item.start_stand} → {item.end_stand}
        </Text>
      </View>

      <View style={styles.busDetails}>
        <Text style={styles.detailText}>
          ⏰ {item.start_time} - {item.end_time}
        </Text>
        <Text style={styles.detailText}>
          🛑 {item.stoppages_count} stops
        </Text>
      </View>

      <View style={styles.runDays}>
        {['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'].map((day) => (
          <View
            key={day}
            style={[
              styles.dayBadge,
              item.run_days.includes(day) && styles.dayBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                item.run_days.includes(day) && styles.dayTextActive,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🚌</Text>
      <Text style={styles.emptyTitle}>No buses listed yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first bus to start receiving passengers
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('DriverCreateBus')}
      >
        <Text style={styles.addButtonText}>Add Your First Bus</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading your buses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bus Listings</Text>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => navigation.navigate('DriverCreateBus')}
        >
          <Text style={styles.addIcon}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Bus List */}
      <FlatList
        data={buses}
        renderItem={renderBusCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          buses.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Banner Ad Placeholder */}
      <View style={styles.bannerAd}>
        <Text style={styles.bannerAdText}>banner ads</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 20,
  },
  listContainer: {
    padding: 15,
  },
  emptyListContainer: {
    flex: 1,
  },
  busCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  busInfo: {
    flex: 1,
  },
  busName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  busNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  busActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  busRoute: {
    marginBottom: 10,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  runDays: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeActive: {
    backgroundColor: '#000',
  },
  dayText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerAd: {
    height: 60,
    backgroundColor: '#F4E6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerAdText: {
    fontSize: 14,
    color: '#666',
  },
});

export default DriverDashboardScreen;
