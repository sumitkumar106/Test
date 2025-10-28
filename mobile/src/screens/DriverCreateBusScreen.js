import React, { useState } from 'react';
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

const DriverCreateBusScreen = ({ navigation }) => {
  const [busName, setBusName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [startStand, setStartStand] = useState('');
  const [endStand, setEndStand] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [runDays, setRunDays] = useState([]);
  const [stoppages, setStoppages] = useState([
    { name: '', arrival_time: '', distance_km: '' },
  ]);
  const [errors, setErrors] = useState({});
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
    } else if (busName.trim().length < 2) {
      newErrors.busName = 'Bus name must be at least 2 characters';
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

    if (!startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    } else if (!startTime.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
      newErrors.startTime = 'Invalid format. Use HH:MM AM/PM';
    }

    if (!endTime.trim()) {
      newErrors.endTime = 'End time is required';
    } else if (!endTime.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
      newErrors.endTime = 'Invalid format. Use HH:MM AM/PM';
    }

    if (runDays.length === 0) {
      newErrors.runDays = 'Select at least one run day';
    }

    // Validate stoppages
    stoppages.forEach((stoppage, index) => {
      if (!stoppage.name.trim()) {
        newErrors[`stoppage_${index}_name`] = 'Stoppage name is required';
      }
      if (!stoppage.arrival_time.trim()) {
        newErrors[`stoppage_${index}_time`] = 'Arrival time is required';
      } else if (!stoppage.arrival_time.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
        newErrors[`stoppage_${index}_time`] = 'Invalid format';
      }
      if (!stoppage.distance_km) {
        newErrors[`stoppage_${index}_distance`] = 'Distance is required';
      } else if (isNaN(stoppage.distance_km) || parseFloat(stoppage.distance_km) < 0) {
        newErrors[`stoppage_${index}_distance`] = 'Invalid distance';
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
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
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

      await driverService.createBus(busData);
      Alert.alert('Success', 'Bus created successfully', [
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Bus Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bus Name: *</Text>
          <TextInput
            style={[styles.input, errors.busName && styles.inputError]}
            placeholder="e.g., Patna Express"
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
            placeholder="e.g., BR-01-AB-1234"
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
            placeholder="e.g., Patna Bus Stand"
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
            placeholder="e.g., 06:00 AM"
            value={startTime}
            onChangeText={setStartTime}
          />
          {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
          <Text style={styles.helpText}>Format: HH:MM AM/PM</Text>
        </View>

        {/* End Stand */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Stand: *</Text>
          <TextInput
            style={[styles.input, errors.endStand && styles.inputError]}
            placeholder="e.g., Harinagar Bus Stand"
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
            placeholder="e.g., 12:30 PM"
            value={endTime}
            onChangeText={setEndTime}
          />
          {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
          <Text style={styles.helpText}>Format: HH:MM AM/PM</Text>
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
                  style={[
                    styles.input,
                    styles.stoppageInput,
                    errors[`stoppage_${index}_name`] && styles.inputError,
                  ]}
                  placeholder="Stoppage Name"
                  value={stoppage.name}
                  onChangeText={(value) => updateStoppage(index, 'name', value)}
                />
                {errors[`stoppage_${index}_name`] && (
                  <Text style={styles.errorText}>{errors[`stoppage_${index}_name`]}</Text>
                )}

                <TextInput
                  style={[
                    styles.input,
                    styles.stoppageInput,
                    errors[`stoppage_${index}_time`] && styles.inputError,
                  ]}
                  placeholder="Arrival Time (HH:MM AM/PM)"
                  value={stoppage.arrival_time}
                  onChangeText={(value) => updateStoppage(index, 'arrival_time', value)}
                />
                {errors[`stoppage_${index}_time`] && (
                  <Text style={styles.errorText}>{errors[`stoppage_${index}_time`]}</Text>
                )}

                <TextInput
                  style={[
                    styles.input,
                    styles.stoppageInput,
                    errors[`stoppage_${index}_distance`] && styles.inputError,
                  ]}
                  placeholder="Distance from Start (km)"
                  value={stoppage.distance_km}
                  onChangeText={(value) => updateStoppage(index, 'distance_km', value)}
                  keyboardType="decimal-pad"
                />
                {errors[`stoppage_${index}_distance`] && (
                  <Text style={styles.errorText}>{errors[`stoppage_${index}_distance`]}</Text>
                )}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Bus Listing</Text>
          )}
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
  helpText: {
    color: '#999',
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
});

export default DriverCreateBusScreen;
