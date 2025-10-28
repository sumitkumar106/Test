import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import busService from '../services/busService';

const BusDetailsScreen = ({ navigation, route }) => {
  const { busId } = route.params;

  const [bus, setBus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load bus details
   */
  useEffect(() => {
    loadBusDetails();
  }, [busId]);

  const loadBusDetails = async () => {
    try {
      setIsLoading(true);
      const busData = await busService.getBusDetails(busId);
      setBus(busData);
    } catch (error) {
      Alert.alert('Error', error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render stoppage row
   */
  const renderStoppage = (stoppage, index, isLast) => (
    <View key={index} style={styles.stoppageRow}>
      {/* Vertical line and dot */}
      <View style={styles.stoppageLeftColumn}>
        {index !== 0 && <View style={styles.verticalLineTop} />}
        <View style={[
          styles.stoppageDot,
          index === 0 && styles.stoppageDotStart,
          isLast && styles.stoppageDotEnd
        ]} />
        {!isLast && <View style={styles.verticalLineBottom} />}
      </View>

      {/* Stoppage details */}
      <View style={styles.stoppageContent}>
        <Text style={styles.stoppageName}>{stoppage.name}</Text>
        <View style={styles.stoppageInfo}>
          <Text style={styles.stoppageTime}>{stoppage.arrival_time}</Text>
          <Text style={styles.stoppageDistance}>{stoppage.distance_km} km</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading bus details...</Text>
      </View>
    );
  }

  if (!bus) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bus not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <Text style={styles.busName}>{bus.bus_name}</Text>
          <Text style={styles.busNumber}>{bus.bus_number}</Text>

          <View style={styles.routeHeader}>
            <View style={styles.routePoint}>
              <Text style={styles.routeLabel}>From</Text>
              <Text style={styles.routeLocation}>{bus.start_stand}</Text>
              <Text style={styles.routeTime}>{bus.start_time}</Text>
            </View>

            <View style={styles.routeArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>

            <View style={styles.routePoint}>
              <Text style={styles.routeLabel}>To</Text>
              <Text style={styles.routeLocation}>{bus.end_stand}</Text>
              <Text style={styles.routeTime}>{bus.end_time}</Text>
            </View>
          </View>

          {/* Run days */}
          <View style={styles.runDaysSection}>
            <Text style={styles.sectionLabel}>Run Days:</Text>
            <View style={styles.runDays}>
              {['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'].map((day) => (
                <View
                  key={day}
                  style={[
                    styles.dayBadge,
                    bus.run_days.includes(day) && styles.dayBadgeActive
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    bus.run_days.includes(day) && styles.dayTextActive
                  ]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Route details section */}
        <View style={styles.routeSection}>
          <Text style={styles.sectionTitle}>Route & Stoppages</Text>

          {/* Start stand */}
          {renderStoppage(
            {
              name: bus.start_stand,
              arrival_time: bus.start_time,
              distance_km: 0
            },
            0,
            false
          )}

          {/* Intermediate stoppages */}
          {bus.stoppages && bus.stoppages.map((stoppage, index) =>
            renderStoppage(stoppage, index + 1, false)
          )}

          {/* End stand */}
          {renderStoppage(
            {
              name: bus.end_stand,
              arrival_time: bus.end_time,
              distance_km: bus.stoppages?.[bus.stoppages.length - 1]?.distance_km || 0
            },
            (bus.stoppages?.length || 0) + 1,
            true
          )}
        </View>

        {/* Driver info section */}
        {bus.driver_info && (
          <View style={styles.driverSection}>
            <Text style={styles.sectionTitle}>Driver Information</Text>
            <View style={styles.driverCard}>
              <Text style={styles.driverName}>{bus.driver_info.name}</Text>
              <Text style={styles.driverEmail}>{bus.driver_info.email}</Text>
            </View>
          </View>
        )}

        {/* Phase 3 features notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>📍 Live Tracking Coming Soon</Text>
          <Text style={styles.noticeText}>
            GPS tracking, live location on map, and arrival time predictions will be available in the next update.
          </Text>
        </View>
      </ScrollView>

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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 20,
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
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  busNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routePoint: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  routeLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 14,
    color: '#666',
  },
  routeArrow: {
    paddingHorizontal: 15,
  },
  arrowText: {
    fontSize: 24,
    color: '#000',
  },
  runDaysSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  runDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
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
    fontWeight: 'bold',
  },
  routeSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  stoppageRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  stoppageLeftColumn: {
    width: 30,
    alignItems: 'center',
    position: 'relative',
  },
  verticalLineTop: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    position: 'absolute',
    top: 0,
  },
  verticalLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    top: 20,
  },
  stoppageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#999',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  stoppageDotStart: {
    backgroundColor: '#4CAF50',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stoppageDotEnd: {
    backgroundColor: '#f44336',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stoppageContent: {
    flex: 1,
    paddingLeft: 15,
    paddingBottom: 20,
  },
  stoppageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  stoppageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stoppageTime: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  stoppageDistance: {
    fontSize: 13,
    color: '#999',
  },
  driverSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  driverCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  driverEmail: {
    fontSize: 14,
    color: '#666',
  },
  noticeCard: {
    backgroundColor: '#fff3cd',
    padding: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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

export default BusDetailsScreen;
