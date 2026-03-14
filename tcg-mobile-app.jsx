// ============================================================
// TCG MOBILE APP - React Native
// Cross-platform mobile app for That Computer Guy
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const API_BASE = 'https://babysitter-b322c-default-rtdb.firebaseio.com';

// ── HOME SCREEN ──
function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || 'Guest');
    } catch (e) {
      console.error('Failed to load user data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👨‍💼 That Computer Guy</Text>
        <Text style={styles.subtitle}>Hello, {userName}!</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Booking')}
        >
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>Book Service</Text>
          <Text style={styles.cardSubtitle}>Schedule an appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.cardIcon}>💬</Text>
          <Text style={styles.cardTitle}>Chat with AI</Text>
          <Text style={styles.cardSubtitle}>Get instant support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Services')}
        >
          <Text style={styles.cardIcon}>🔧</Text>
          <Text style={styles.cardTitle}>View Services</Text>
          <Text style={styles.cardSubtitle}>Browse all services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Invoices')}
        >
          <Text style={styles.cardIcon}>💳</Text>
          <Text style={styles.cardTitle}>My Invoices</Text>
          <Text style={styles.cardSubtitle}>View past invoices</Text>
        </TouchableOpacity>
      </View>

      {/* Company Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📞 (812) 373-6023</Text>
          <Text style={styles.infoText}>📧 gary.amick0614@gmail.com</Text>
          <Text style={styles.infoText}>📍 Seymour, Indiana</Text>
          <Text style={styles.infoText}>⏰ 24/7 Available</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ── BOOKING SCREEN ──
function BookingScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });

  const submitBooking = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'booking'
        })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', data.message || 'Booking submitted successfully!');
        setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' });
      } else {
        Alert.alert('Error', data.error || 'Failed to submit booking');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Book a Service</Text>

        {/* Form Fields */}
        <TextInputField
          placeholder="Your Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        <TextInputField
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />
        <TextInputField
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
        <TextInputField
          placeholder="Service Type"
          value={formData.service}
          onChangeText={(text) => setFormData({ ...formData, service: text })}
        />
        <TextInputField
          placeholder="Preferred Date"
          value={formData.date}
          onChangeText={(text) => setFormData({ ...formData, date: text })}
        />
        <TextInputField
          placeholder="Preferred Time"
          value={formData.time}
          onChangeText={(text) => setFormData({ ...formData, time: text })}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={submitBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Submit Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── CHAT SCREEN ──
function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', text: inputText };
    setMessages([...messages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          context: 'customer'
        })
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', text: data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      const errorMessage = { role: 'system', text: 'Error: Unable to connect to AI' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.messageBubble}>
            <ActivityIndicator color="#00d4ff" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInputField
          placeholder="Ask a question..."
          value={inputText}
          onChangeText={setInputText}
          multiline={false}
        />
        <TouchableOpacity onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendButton}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── INVOICES SCREEN ──
function InvoicesScreen() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/invoices');
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (e) {
      console.error('Failed to load invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 My Invoices</Text>

        {invoices.length === 0 ? (
          <Text style={styles.emptyText}>No invoices yet</Text>
        ) : (
          invoices.map((invoice) => (
            <View key={invoice.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{invoice.id}</Text>
                <Text style={[styles.badge, { color: invoice.status === 'paid' ? '#22c55e' : '#f97316' }]}>
                  {invoice.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.cardSubtitle}>
                ${invoice.total.toFixed(2)} • Due: {new Date(invoice.due_date).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ── SERVICES SCREEN ──
function ServicesScreen() {
  const services = [
    { name: 'Computer Repair', icon: '💻' },
    { name: 'Networking', icon: '🌐' },
    { name: 'Software Installation', icon: '📱' },
    { name: 'Data Recovery', icon: '💾' },
    { name: 'Security Setup', icon: '🔒' },
    { name: 'Troubleshooting', icon: '🔧' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Our Services</Text>

        {services.map((service, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardIcon}>{service.icon}</Text>
            <Text style={styles.cardTitle}>{service.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── MAIN COMPONENT ──
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0b0e14" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#141922' },
          headerTintColor: '#00d4ff',
          headerTitleStyle: { fontWeight: '700' },
          tabBarStyle: { backgroundColor: '#141922', borderTopColor: '#273044' },
          tabBarActiveTintColor: '#00d4ff',
          tabBarInactiveTintColor: '#7d8fa8'
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            tabBarIcon: () => <Text>🏠</Text>
          }}
        />
        <Tab.Screen
          name="Services"
          component={ServicesScreen}
          options={{
            title: 'Services',
            tabBarLabel: 'Services',
            tabBarIcon: () => <Text>🔧</Text>
          }}
        />
        <Tab.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            title: 'Book Service',
            tabBarLabel: 'Book',
            tabBarIcon: () => <Text>📅</Text>
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'Chat',
            tabBarLabel: 'Chat',
            tabBarIcon: () => <Text>💬</Text>
          }}
        />
        <Tab.Screen
          name="Invoices"
          component={InvoicesScreen}
          options={{
            title: 'Invoices',
            tabBarLabel: 'Invoices',
            tabBarIcon: () => <Text>💳</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── COMPONENTS ──
function TextInputField({ placeholder, value, onChangeText, keyboardType, multiline }) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.inputPlaceholder}>{placeholder}</Text>
      {/* Note: Use actual TextInput from react-native in real implementation */}
    </View>
  );
}

// ── STYLES ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0e14'
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#273044'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00d4ff',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#7d8fa8'
  },
  section: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dde4f0',
    marginBottom: 12
  },
  card: {
    backgroundColor: '#1a2030',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#273044'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dde4f0'
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7d8fa8',
    marginTop: 4
  },
  badge: {
    fontSize: 11,
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#00d4ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 16,
    alignItems: 'center'
  },
  buttonText: {
    color: '#0b0e14',
    fontWeight: '700',
    fontSize: 14
  },
  infoBox: {
    backgroundColor: '#1a2030',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#273044'
  },
  infoText: {
    color: '#dde4f0',
    fontSize: 13,
    marginVertical: 6
  },
  chatContainer: {
    flex: 1,
    padding: 16
  },
  messageBubble: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00d4ff',
    borderBottomRightRadius: 2
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a2030',
    borderWidth: 1,
    borderColor: '#273044',
    borderBottomLeftRadius: 2
  },
  messageText: {
    color: '#dde4f0',
    fontSize: 13
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#273044',
    backgroundColor: '#141922'
  },
  inputField: {
    flex: 1,
    backgroundColor: '#1a2030',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#273044'
  },
  inputPlaceholder: {
    color: '#7d8fa8',
    fontSize: 12
  },
  sendButton: {
    fontSize: 20,
    paddingHorizontal: 12,
    color: '#00d4ff'
  },
  emptyText: {
    color: '#7d8fa8',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20
  }
});
