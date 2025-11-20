import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const OTPScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { verifyOTP, register } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }
    try {
      setLoading(true);
      await verifyOTP(email, otp);
    } catch (error) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await register({ email });
      setTimer(60);
      Alert.alert('Success', 'OTP resent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="mail" size={80} color="#FF6B6B" />
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify OTP</Text>}
        </TouchableOpacity>
        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  email: { fontSize: 16, color: '#FF6B6B', marginTop: 5, fontWeight: 'bold' },
  form: { width: '100%' },
  otpInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 20, fontSize: 24, textAlign: 'center', letterSpacing: 10, marginBottom: 20 },
  verifyButton: { backgroundColor: '#FF6B6B', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendContainer: { alignItems: 'center' },
  timerText: { color: '#666', fontSize: 14 },
  resendLink: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },
});

export default OTPScreen;
