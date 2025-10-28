import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import busService from '../services/busService';

const BusResultsScreen = ({ navigation, route }) => {
  const { from, to, query } = route.params;

  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  /**
   * Generate date tabs (today + next 6 days)
   */
  const generateDateTabs = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateTabs = generateDateTabs();

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  /**
   * Load buses based on search type
   */
  const loadBuses = async (date = selectedDate) => {
    try {
      setIsLoading(true);

      let results;
      if (query) {
        // Search by bus number/name
        results = await busService.searchByNumber(query);
      } else {
        // Search by from/to
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        results = await busService.searchBuses(from, to, dateStr);
      }

      setBuses(results);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  /**
   * Handle date tab selection
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    loadBuses(date);
  };

  /**
   * Render date tab
   */
  const renderDateTab = (date, index) => {
    const { day, month } = formatDate(date);
    const isSelected = date.toDateString() === selectedDate.toDateString();

    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateTab, isSelected && styles.dateTabActive]}
        onPress={() => handleDateSelect(date)}
      >
        <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>{day}</Text>
        <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>{month}</Text>
      </TouchableOpacity>
    );
  };

  /**
   * Render bus card
   */
  const renderBusCard = ({ item }) => (
    <TouchableOpacity
      style={styles.busCard}
      onPress={() => navigation.navigate('BusDetails', { busId: item.id })}
    >
      <View style={styles.busHeader}>
        <Text style={styles.busName}>{item.bus_name}</Text>
        <Text style={styles.busNumber}>{item.bus_number}</Text>
      </View>

      <View style={styles.busRoute}>
        <View style={styles.routeSection}>
          <Text style={styles.routeLabel}>{item.from_stand}</Text>
          <Text style={styles.routeTime}>{item.from_time}</Text>
        </View>

        <View style={styles.routeDuration}>
          <View style={styles.routeLine} />
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>

        <View style={styles.routeSection}>
          <Text style={styles.routeLabel}>{item.to_stand}</Text>
          <Text style={styles.routeTime}>{item.to_time}</Text>
        </View>
      </View>

      <View style={styles.runDays}>
        {['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'].map((day) => (
          <Text
            key={day}
            style={[
              styles.dayText,
              item.run_days.includes(day) && styles.dayTextActive,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🚌</Text>
      <Text style={styles.emptyTitle}>No buses found</Text>
      <Text style={styles.emptySubtitle}>
        {query
          ? `No buses matching "${query}"`
          : `No buses from ${from} to ${to} on this date`}
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Try Different Search</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Searching buses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {query ? `Results for "${query}"` : `${from} → ${to}`}
          </Text>
        </View>
      </View>

      {/* Date Tabs (only for from/to search) */}
      {!query && (
        <View style={styles.dateTabs}>
          <FlatList
            horizontal
            data={dateTabs}
            renderItem={({ item, index }) => renderDateTab(item, index)}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateTabsContent}
          />
        </View>
      )}

      {/* Bus List */}
      <FlatList
        data={buses}
        renderItem={renderBusCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          buses.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
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
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  dateTabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateTabsContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateTab: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateTabActive: {
    backgroundColor: '#000',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateDayActive: {
    color: '#fff',
  },
  dateMonth: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dateMonthActive: {
    color: '#fff',
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
    marginBottom: 15,
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
  },
  busRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  routeSection: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  routeDuration: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  routeLine: {
    width: 40,
    height: 2,
    backgroundColor: '#ddd',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
  },
  runDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dayText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#000',
    fontWeight: 'bold',
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
  backButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  backButtonText: {
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

export default BusResultsScreen;
