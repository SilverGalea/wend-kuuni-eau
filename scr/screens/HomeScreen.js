// HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  useWindowDimensions,
  Appearance,
} from 'react-native';
import * as Location from 'expo-location';
import { getWaterPoints } from '../storage/waterStorage';
import WaterPointItem from '../components/WaterPointItem';
import { calculateDistance } from '../utils/ratingUtils';

const HomeScreen = ({ navigation }) => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const { width } = useWindowDimensions();
  const colorScheme = Appearance.getColorScheme();

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        setUserLocation(null);
      }
    } catch (e) {
      console.warn('Erreur permission location', e);
      setUserLocation(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const points = await getWaterPoints();
      setWaterPoints(points || []);
      applyFilter(points || [], activeFilter);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger les points d'eau");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (points, filter) => {
    let filtered = [...points];

    switch (filter) {
      case 'nearby':
        if (userLocation) {
          filtered.sort((a, b) => calculateDistance(a.location, userLocation) - calculateDistance(b.location, userLocation));
        }
        break;
      case 'cheap':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'functional':
        filtered = filtered.filter(point => point.status === 'functional');
        break;
      default:
        break;
    }

    setFilteredPoints(filtered);
    setActiveFilter(filter);
  };

  const dynamicStyles = getDynamicStyles({ 
    activeFilter, 
    hasPoints: filteredPoints.length > 0, 
    userLocation, 
    width, 
    colorScheme 
  });

  if (loading) {
    return (
      <View style={[styles.centerContainer, dynamicStyles.centerContainer]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#60A5FA' : '#3B82F6'} />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Points d'eau</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'nearby', 'cheap', 'functional'].map((f) => {
            const active = f === activeFilter;
            const filterLabels = {
              all: 'Tous',
              nearby: 'Proximité',
              cheap: 'Prix',
              functional: 'Fonctionnel'
            };
            
            return (
              <TouchableOpacity
                key={f}
                onPress={() => applyFilter(waterPoints, f)}
                style={[
                  styles.filterButton, 
                  dynamicStyles.filterButton, 
                  active && dynamicStyles.filterButtonActive
                ]}
              >
                <Text style={[
                  styles.filterButtonText, 
                  dynamicStyles.filterButtonText, 
                  active && dynamicStyles.filterButtonTextActive
                ]}>
                  {filterLabels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filteredPoints.length === 0 ? (
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            Aucun point d'eau trouvé.
          </Text>
          <Text style={[styles.hintText, dynamicStyles.hintText]}>
            Appuie sur + pour en ajouter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPoints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isNear = userLocation ? calculateDistance(item.location, userLocation) <= 0.2 : false;
            return (
              <WaterPointItem
                waterPoint={item}
                userLocation={userLocation}
                isNear={isNear}
                onPress={() => navigation.navigate('WaterPointDetail', { waterPoint: item })}
                style={isNear ? dynamicStyles.nearItemOverride : null}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, dynamicStyles.addButton]}
        onPress={() => navigation.navigate('AddWaterPoint', { userLocation })}
      >
        <Text style={[styles.addButtonText, dynamicStyles.addButtonText]}>
          + Ajouter un point d'eau
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// STATIC STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // Filter Styles
  filterScroll: {
    maxHeight: 50,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // List Styles
  listContent: {
    paddingBottom: 100,
  },

  // Empty State Styles
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Loading Styles
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },

  // Add Button Styles
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    left: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

// ============================================================================
// DYNAMIC STYLES FUNCTION
// ============================================================================
const getDynamicStyles = ({ activeFilter, hasPoints, userLocation, width, colorScheme }) => {
  const isDark = colorScheme === 'dark';
  const isTablet = width >= 768;

  return StyleSheet.create({
    // Container Styles
    container: {
      backgroundColor: isDark ? '#111827' : '#F3F4F6',
    },
    centerContainer: {
      backgroundColor: isDark ? '#111827' : '#F3F4F6',
    },
    emptyContainer: {
      backgroundColor: isDark ? '#1F2937' : 'transparent',
      borderRadius: isTablet ? 16 : 0,
      marginHorizontal: isTablet ? 32 : 0,
    },

    // Header Styles
    header: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      paddingHorizontal: isTablet ? 32 : 16,
    },
    headerTitle: {
      fontSize: isTablet ? 32 : 28,
      color: isDark ? '#F9FAFB' : '#111827',
    },

    // Filter Styles
    filterButton: {
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    filterButtonActive: {
      backgroundColor: isDark ? '#3B82F6' : '#3B82F6',
      borderColor: isDark ? '#3B82F6' : '#3B82F6',
    },
    filterButtonText: {
      color: isDark ? '#D1D5DB' : '#6B7280',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },

    // Empty State Styles
    emptyText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontSize: isTablet ? 20 : 18,
    },
    hintText: {
      color: isDark ? '#6B7280' : '#9CA3AF',
      fontSize: isTablet ? 16 : 14,
    },

    // Loading Styles
    loadingText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },

    // Add Button Styles
    addButton: {
      backgroundColor: isDark ? '#2563EB' : '#3B82F6',
      bottom: isTablet ? 32 : 24,
      left: isTablet ? 32 : 16,
      right: isTablet ? 32 : 16,
    },
    addButtonText: {
      fontSize: isTablet ? 18 : 16,
    },

    // Near Item Override (for WaterPointItem)
    nearItemOverride: {
      borderColor: '#10B981',
      borderWidth: 2,
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
    },
  });
};

export default HomeScreen;