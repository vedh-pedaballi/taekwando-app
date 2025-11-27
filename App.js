import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// TODO: Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCbcMnjYudlp2rXo04cVsWIdaYvTXMFbHg",
  authDomain: "taekwondo-app-cc561.firebaseapp.com",
  projectId: "taekwondo-app-cc561",
  storageBucket: "taekwondo-app-cc561.firebasestorage.app",
  messagingSenderId: "426922231832",
  appId: "1:426922231832:web:1b8aedb3b0bf2701969b6d",
  measurementId: "G-W4EEDTYHWW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function TaekwondoApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthForm, setShowAuthForm] = useState('login');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    // Trim whitespace
    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      Alert.alert('Success', 'Logged in successfully!');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      if (error.code === 'auth/user-not-found') {
        Alert.alert(
          'Account Not Found',
          'No account exists with this email. Would you like to create one?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Up', onPress: () => setShowAuthForm('signup') }
          ]
        );
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/invalid-credential') {
        Alert.alert('Login Failed', 'Invalid email or password. Please check your credentials and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Too Many Attempts', 'Account temporarily disabled due to many failed login attempts. Try again later.');
      } else {
        Alert.alert('Login Error', error.message);
      }
    }
  };

  const handleSignup = async () => {
    // Trim whitespace
    const name = signupName.trim();
    const email = signupEmail.trim();
    const password = signupPassword.trim();

    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (name.length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      console.log('Signup successful:', userCredential.user.email);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      Alert.alert('Success', `Welcome ${name}! Your account has been created.`);
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
    } catch (error) {
      console.error('Signup error:', error.code, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Would you like to login instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Login', 
              onPress: () => {
                setShowAuthForm('login');
                setLoginEmail(email);
              }
            }
          ]
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Please use a stronger password with at least 6 characters.');
      } else if (error.code === 'auth/operation-not-allowed') {
        Alert.alert('Error', 'Email/password accounts are not enabled. Please contact support.');
      } else {
        Alert.alert('Signup Error', error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('home');
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Auth Page
  if (!user) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authHeader}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🥋</Text>
            </View>
            <Text style={styles.authTitle}>Dragon Taekwondo</Text>
            <Text style={styles.authSubtitle}>Master Your Mind, Body & Spirit</Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => setShowAuthForm('login')}
                style={[
                  styles.tab,
                  showAuthForm === 'login' && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    showAuthForm === 'login' && styles.tabTextActive,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAuthForm('signup')}
                style={[
                  styles.tab,
                  showAuthForm === 'signup' && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    showAuthForm === 'signup' && styles.tabTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {showAuthForm === 'login' ? (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
                <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
                  <Text style={styles.authButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={signupName}
                  onChangeText={setSignupName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  placeholder="Create a password (min 6 characters)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
                <TouchableOpacity style={styles.authButton} onPress={handleSignup}>
                  <Text style={styles.authButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const userName = user.displayName || user.email.split('@')[0];

  // Render different pages
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <ScrollView style={styles.pageContainer}>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome back, {userName}!</Text>
              <Text style={styles.welcomeSubtitle}>
                Your next class: Kids Sparring - Today at 5:00 PM
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Classes This Month</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>3rd</Text>
                <Text style={styles.statLabel}>Current Belt</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Upcoming Classes</Text>
              {[
                { name: 'Kids Sparring', time: 'Today, 5:00 PM', instructor: 'Master Kim' },
                { name: 'Forms Practice', time: 'Tomorrow, 6:00 PM', instructor: 'Master Lee' },
                { name: 'Advanced Techniques', time: 'Wed, 7:00 PM', instructor: 'Master Park' },
              ].map((cls, i) => (
                <View key={i} style={styles.classItem}>
                  <View>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.classTime}>{cls.time}</Text>
                  </View>
                  <Text style={styles.classInstructor}>{cls.instructor}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'classes':
        return (
          <ScrollView style={styles.pageContainer}>
            <Text style={styles.pageTitle}>Class Schedule</Text>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
              (day) => (
                <View key={day} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  <View style={styles.scheduleItem}>
                    <View>
                      <Text style={styles.scheduleName}>Kids Beginners</Text>
                      <Text style={styles.scheduleAge}>Ages 6-10</Text>
                    </View>
                    <Text style={styles.scheduleTime}>4:00 PM</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <View>
                      <Text style={styles.scheduleName}>Teen Advanced</Text>
                      <Text style={styles.scheduleAge}>Ages 11-17</Text>
                    </View>
                    <Text style={styles.scheduleTime}>5:30 PM</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <View>
                      <Text style={styles.scheduleName}>Adult Classes</Text>
                      <Text style={styles.scheduleAge}>18+</Text>
                    </View>
                    <Text style={styles.scheduleTime}>7:00 PM</Text>
                  </View>
                </View>
              )
            )}
          </ScrollView>
        );

      case 'instructors':
        return (
          <ScrollView style={styles.pageContainer}>
            <Text style={styles.pageTitle}>Our Instructors</Text>
            {[
              {
                name: 'Master Kim',
                belt: '6th Dan Black Belt',
                specialty: 'Olympic Sparring',
                experience: '25 years',
              },
              {
                name: 'Master Lee',
                belt: '5th Dan Black Belt',
                specialty: 'Forms & Poomsae',
                experience: '20 years',
              },
              {
                name: 'Master Park',
                belt: '4th Dan Black Belt',
                specialty: 'Self Defense',
                experience: '15 years',
              },
              {
                name: 'Instructor Chen',
                belt: '3rd Dan Black Belt',
                specialty: 'Kids Training',
                experience: '10 years',
              },
            ].map((instructor, i) => (
              <View key={i} style={styles.instructorCard}>
                <View style={styles.instructorAvatar}>
                  <Text style={styles.instructorAvatarText}>
                    {instructor.name.split(' ')[1][0]}
                  </Text>
                </View>
                <View style={styles.instructorInfo}>
                  <Text style={styles.instructorName}>{instructor.name}</Text>
                  <Text style={styles.instructorBelt}>{instructor.belt}</Text>
                  <Text style={styles.instructorDetail}>
                    Specialty: {instructor.specialty}
                  </Text>
                  <Text style={styles.instructorDetail}>
                    Experience: {instructor.experience}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'profile':
        return (
          <ScrollView style={styles.pageContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{userName[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.profileBelt}>Yellow Belt (3rd Gup)</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Next Belt Test</Text>
                  <Text style={styles.progressPercent}>75%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
              </View>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Classes This Month</Text>
                  <Text style={styles.progressPercent}>24/30</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '80%' }]} />
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.achievementGrid}>
                {['🥋', '🏆', '⭐', '🔥', '💪', '🎯'].map((emoji, i) => (
                  <View key={i} style={styles.achievementItem}>
                    <Text style={styles.achievementEmoji}>{emoji}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🥋 Dragon Taekwondo</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>{renderPage()}</View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'classes', icon: '📅', label: 'Classes' },
          { id: 'instructors', icon: '👥', label: 'Instructors' },
          { id: 'profile', icon: '👤', label: 'Profile' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              currentPage === item.id && styles.navItemActive,
            ]}
            onPress={() => setCurrentPage(item.id)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                currentPage === item.id && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#DC2626',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
  },
  authScroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 50,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#FEE2E2',
  },
  authCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#DC2626',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFF',
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#DC2626',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#FEE2E2',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  classTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  classInstructor: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 8,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleAge: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructorAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructorBelt: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  instructorDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileHeader: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#FEE2E2',
    marginBottom: 8,
  },
  profileBelt: {
    fontSize: 14,
    color: '#FEE2E2',
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#DC2626',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 32,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#DC2626',
  },
});