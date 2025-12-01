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

  // Hooks pour styles dynamiques
  const { width } = useWindowDimensions();
  const colorScheme = Appearance.getColorScheme(); // 'light' | 'dark'

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
        // permission refusée : pas bloquant mais on le note
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

  // --- Styles dynamiques selon état, thème et largeur écran ---
  const dynamicStyles = getDynamicStyles({ activeFilter, hasPoints: filteredPoints.length > 0, userLocation, width, colorScheme });

  if (loading) {
    return (
      <View style={[styles.centerContainer, dynamicStyles.centerContainer]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Points d'eau</Text>

        {/* Barre de filtres (exemples de boutons) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'nearby', 'cheap', 'functional'].map((f) => {
            const active = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => applyFilter(waterPoints, f)}
                style={[styles.filterButton, dynamicStyles.filterButton, active && dynamicStyles.filterButtonActive]}
              >
                <Text style={[styles.filterButtonText, dynamicStyles.filterButtonText, active && dynamicStyles.filterButtonTextActive]}>
                  {f === 'all' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Liste ou message vide */}
      {filteredPoints.length === 0 ? (
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>Aucun point d'eau trouvé.</Text>
          <Text style={[styles.hintText, dynamicStyles.hintText]}>Appuie sur + pour en ajouter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPoints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            // Exemple d'application : si le point est < 200m on le marque comme "proche"
            const isNear = userLocation ? calculateDistance(item.location, userLocation) <= 0.2 /*km*/ : false;
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
        />
      )}

      {/* Bouton flottant dynamique */}
      <TouchableOpacity
        style={[styles.addButton, dynamicStyles.addButton]}
        onPress={() => navigation.navigate('AddWaterPoint', { userLocation })}
      >
        <Text style={[styles.addButtonText, dynamicStyles.addButtonText]}>+ Ajouter un point d'eau</Text>
      </TouchableOpacity>
    </View>
  );
};

// Fonction qui retourne un objet de styles dynamiques
function getDynamicStyles({ activeFilter, hasPoints, userLocation, width, colorScheme }) {
  // Couleurs selon thème
  const dark = colorScheme === 'dark';
  const colors = {
    background: dark ? '#0b0f14' : '#ffffff',
    surface: dark ? '#0f1720' : '#f8fafc',
    primary: '#2196F3',
    nearAccent: '#4CAF50',
    text: dark ? '#e6eef6' : '#0b2447',
    muted: dark ? '#93A1B0' : '#6b7280',
  };

  // Taille responsive
  const base = width >= 420 ? 18 : 16;
  const headerHeight = width >= 420 ? 120 : 100;

  // Couleur de header selon filtre actif
  const headerBackgroundMap = {
    all: colors.primary,
    nearby: colors.nearAccent,
    cheap: '#FFB300',
    functional: '#7C4DFF',
  };
  const headerBg = headerBackgroundMap[activeFilter] || colors.primary;

  return {
    container: {
      backgroundColor: colors.background,
    },
    centerContainer: {
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.text,
      marginTop: 12,
    },
    header: {
      backgroundColor: headerBg,
      height: headerHeight,
      paddingHorizontal: 14,
      paddingTop: 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    headerTitle: {
      color: '#fff',
      fontSize: base + 6,
      fontWeight: '700',
      marginBottom: 10,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    filterButtonActive: {
      backgroundColor: 'rgba(255,255,255,0.28)',
      transform: [{ scale: 1.03 }],
    },
    filterButtonText: {
      color: '#fff',
      fontSize: base - 2,
    },
    filterButtonTextActive: {
      fontWeight: '700',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: base + 2,
      color: colors.muted,
      marginBottom: 8,
    },
    hintText: {
      color: colors.muted,
      fontSize: base - 2,
    },
    addButton: {
      position: 'absolute',
      right: 16,
      bottom: 26,
      backgroundColor: hasPoints ? '#ff6b00' : '#00aaff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 28,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: base,
    },
    nearItemOverride: {
      borderLeftWidth: 4,
      borderLeftColor: colors.nearAccent,
      paddingLeft: 10,
    },
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  header: {
    // propriétés de base, overridées par dynamicStyles.header
  },
  headerTitle: {},
  filterScroll: {
    marginTop: 6,
  },
  filterButton: {},
  filterButtonText: {},
  emptyContainer: {
    flex: 1,
  },
  emptyText: {},
  hintText: {
    marginTop: 6,
  },
  addButton: {
    // styles de base, overridés par dynamicStyles.addButton
  },
  addButtonText: {},
});

export default HomeScreen;
