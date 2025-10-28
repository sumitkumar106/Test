import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import driverService from '../services/driverService';

const DriverEditBusScreen = ({ navigation, route }) => {
  const { busId } = route.params;

  const [busName, setBusName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [startStand, setStartStand] = useState('');
  const [endStand, setEndStand] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [runDays, setRunDays] = useState([]);
  const [stoppages, setStoppages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'T', value: 'T' },
    { label: 'W', value: 'W' },
    { label: 'Th', value: 'Th' },
    { label: 'F', value: 'F' },
    { label: 'Sa', value: 'Sa' },
  ];

  /**
   * Load existing bus data
   */
  useEffect(() => {
    loadBusData();
  }, [busId]);

  const loadBusData = async () => {
    try {
      setIsLoading(true);
      const bus = await driverService.getBusDetails(busId);

      setBusName(bus.bus_name);
      setBusNumber(bus.bus_number);
      setStartStand(bus.start_stand);
      setEndStand(bus.end_stand);
      setStartTime(bus.start_time);
      setEndTime(bus.end_time);
      setRunDays(bus.run_days);
      setStoppages(
        bus.stoppages.map((s) => ({
          name: s.name,
          arrival_time: s.arrival_time,
          distance_km: s.distance_km.toString(),
        }))
      );
    } catch (error) {
      Alert.alert('Error', error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle run day selection
   */
  const toggleRunDay = (day) => {
    if (runDays.includes(day)) {
      setRunDays(runDays.filter((d) => d !== day));
    } else {
      setRunDays([...runDays, day]);
    }
  };

  /**
   * Add new stoppage row
   */
  const addStoppage = () => {
    setStoppages([...stoppages, { name: '', arrival_time: '', distance_km: '' }]);
  };

  /**
   * Remove stoppage row
   */
  const removeStoppage = (index) => {
    if (stoppages.length > 1) {
      setStoppages(stoppages.filter((_, i) => i !== index));
    }
  };

  /**
   * Update stoppage field
   */
  const updateStoppage = (index, field, value) => {
    const newStoppages = [...stoppages];
    newStoppages[index][field] = value;
    setStoppages(newStoppages);
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!busName.trim()) {
      newErrors.busName = 'Bus name is required';
    }

    if (!busNumber.trim()) {
      newErrors.busNumber = 'Bus number is required';
    }

    if (!startStand.trim()) {
      newErrors.startStand = 'Start stand is required';
    }

    if (!endStand.trim()) {
      newErrors.endStand = 'End stand is required';
    }

    if (!startTime.trim() || !startTime.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
      newErrors.startTime = 'Invalid time format';
    }

    if (!endTime.trim() || !endTime.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
      newErrors.endTime = 'Invalid time format';
    }

    if (runDays.length === 0) {
      newErrors.runDays = 'Select at least one run day';
    }

    stoppages.forEach((stoppage, index) => {
      if (!stoppage.name.trim()) {
        newErrors[`stoppage_${index}_name`] = 'Required';
      }
      if (!stoppage.arrival_time.trim()) {
        newErrors[`stoppage_${index}_time`] = 'Required';
      }
      if (!stoppage.distance_km || isNaN(stoppage.distance_km)) {
        newErrors[`stoppage_${index}_distance`] = 'Invalid';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const busData = {
        bus_name: busName.trim(),
        bus_number: busNumber.trim().toUpperCase(),
        start_stand: startStand.trim(),
        end_stand: endStand.trim(),
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        run_days: runDays,
        stoppages: stoppages.map((s) => ({
          name: s.name.trim(),
          arrival_time: s.arrival_time.trim(),
          distance_km: parseFloat(s.distance_km),
        })),
      };

      await driverService.updateBus(busId, busData);
      Alert.alert('Success', 'Bus updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete bus
   */
  const handleDelete = () => {
    Alert.alert(
      'Delete Bus',
      'This will permanently delete the bus listing. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await driverService.deleteBus(busId);
              Alert.alert('Success', 'Bus deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('DriverDashboard'),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading bus details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Bus Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bus Name: *</Text>
          <TextInput
            style={[styles.input, errors.busName && styles.inputError]}
            value={busName}
            onChangeText={setBusName}
          />
          {errors.busName && <Text style={styles.errorText}>{errors.busName}</Text>}
        </View>

        {/* Bus Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bus No: *</Text>
          <TextInput
            style={[styles.input, errors.busNumber && styles.inputError]}
            value={busNumber}
            onChangeText={setBusNumber}
            autoCapitalize="characters"
          />
          {errors.busNumber && <Text style={styles.errorText}>{errors.busNumber}</Text>}
        </View>

        {/* Start Stand */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Stand: *</Text>
          <TextInput
            style={[styles.input, errors.startStand && styles.inputError]}
            value={startStand}
            onChangeText={setStartStand}
          />
          {errors.startStand && <Text style={styles.errorText}>{errors.startStand}</Text>}
        </View>

        {/* Start Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bus Start Time: *</Text>
          <TextInput
            style={[styles.input, errors.startTime && styles.inputError]}
            value={startTime}
            onChangeText={setStartTime}
          />
          {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
        </View>

        {/* End Stand */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Stand: *</Text>
          <TextInput
            style={[styles.input, errors.endStand && styles.inputError]}
            value={endStand}
            onChangeText={setEndStand}
          />
          {errors.endStand && <Text style={styles.errorText}>{errors.endStand}</Text>}
        </View>

        {/* End Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bus End Time: *</Text>
          <TextInput
            style={[styles.input, errors.endTime && styles.inputError]}
            value={endTime}
            onChangeText={setEndTime}
          />
          {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
        </View>

        {/* Run Days */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Bus Run Day: *</Text>
          <View style={styles.runDaysContainer}>
            {days.map((day) => (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayButton,
                  runDays.includes(day.value) && styles.dayButtonActive,
                ]}
                onPress={() => toggleRunDay(day.value)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    runDays.includes(day.value) && styles.dayButtonTextActive,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.runDays && <Text style={styles.errorText}>{errors.runDays}</Text>}
        </View>

        {/* Stoppages */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stoppages: *</Text>
          {stoppages.map((stoppage, index) => (
            <View key={index} style={styles.stoppageRow}>
              <Text style={styles.stoppageNumber}>#{index + 1}</Text>

              <View style={styles.stoppageInputs}>
                <TextInput
                  style={[styles.input, styles.stoppageInput]}
                  placeholder="Stoppage Name"
                  value={stoppage.name}
                  onChangeText={(value) => updateStoppage(index, 'name', value)}
                />

                <TextInput
                  style={[styles.input, styles.stoppageInput]}
                  placeholder="Arrival Time"
                  value={stoppage.arrival_time}
                  onChangeText={(value) => updateStoppage(index, 'arrival_time', value)}
                />

                <TextInput
                  style={[styles.input, styles.stoppageInput]}
                  placeholder="Distance (km)"
                  value={stoppage.distance_km}
                  onChangeText={(value) => updateStoppage(index, 'distance_km', value)}
                  keyboardType="decimal-pad"
                />
              </View>

              {stoppages.length > 1 && (
                <TouchableOpacity
                  style={styles.removeStoppageButton}
                  onPress={() => removeStoppage(index)}
                >
                  <Text style={styles.removeStoppageText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addStoppageButton} onPress={addStoppage}>
            <Text style={styles.addStoppageText}>+ ADD MORE STOPPAGE</Text>
          </TouchableOpacity>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Bus Listing</Text>
          )}
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Bus</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  inputError: {
    borderColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 5,
  },
  runDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dayButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  stoppageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stoppageNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
    marginTop: 15,
  },
  stoppageInputs: {
    flex: 1,
  },
  stoppageInput: {
    marginBottom: 8,
  },
  removeStoppageButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10,
  },
  removeStoppageText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  addStoppageButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addStoppageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    height: 50,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DriverEditBusScreen;
