import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      await register({ name, email: email.toLowerCase().trim(), phone, password });
      Alert.alert('Success', 'OTP sent to your email', [
        { text: 'OK', onPress: () => navigation.navigate('OTP', { email: email.toLowerCase().trim() }) }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="person-add" size={80} color="#FF6B6B" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} editable={!loading} />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="mail" size={20} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="call" size={20} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!loading} />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} editable={!loading} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} editable={!loading} />
          </View>
          <TouchableOpacity style={[styles.registerButton, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Sign Up</Text>}
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  registerButton: { backgroundColor: '#FF6B6B', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: '#666', fontSize: 14 },
  loginLink: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },
});

export default RegisterScreen;
