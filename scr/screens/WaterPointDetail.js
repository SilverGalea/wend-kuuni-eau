// WaterPointDetail.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform, Appearance, Alert
} from 'react-native';
import { getWaterPoints, deleteWaterPoint } from '../storage/waterStorage';
import {
  getStatusColor, getStatusText, getRatingStars, formatDate
} from '../utils/ratingUtils';

const WaterPointDetail = ({ route, navigation }) => {
  const { waterPoint: initialWaterPoint } = route.params;
  const [waterPoint, setWaterPoint] = useState(initialWaterPoint);
  const colorScheme = Appearance.getColorScheme();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const points = await getWaterPoints();
      const updatedPoint = points.find(p => p.id === waterPoint.id);
      if (updatedPoint) setWaterPoint(updatedPoint);
    });
    return unsubscribe;
  }, [navigation, waterPoint.id]);

  const openInGoogleMaps = () => {
    const { latitude, longitude } = waterPoint.location;
    const label = encodeURIComponent(waterPoint.name);
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&q=${label}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`
    });
    Linking.openURL(url).catch(() => {
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(webUrl);
    });
  };

  const handleReport = () => {
    navigation.navigate('ReportScreen', { waterPoint, type: 'report' });
  };

  const handleRate = () => {
    navigation.navigate('ReportScreen', { waterPoint, type: 'rating' });
  };

  // --- SUPPRESSION ---
const handleDelete = async () => {
  try {
    const success = await deleteWaterPoint(waterPoint.id);
    if (success) {
      navigation.replace('Home'); // remplace l'écran actuel par Home
    } else {
      console.error("Impossible de supprimer le point d'eau.");
    }
  } catch (e) {
    console.error("Erreur lors de la suppression:", e);
  }
};


  const statusColor = getStatusColor(waterPoint.status);
  const statusText = getStatusText(waterPoint.status);
  const stars = getRatingStars(waterPoint.rating || 0);

  // Couleurs dynamiques
  const colors = {
    background: colorScheme === 'dark' ? '#121212' : '#fefefe',
    text: colorScheme === 'dark' ? '#f0f0f0' : '#111',
    subText: colorScheme === 'dark' ? '#bbb' : '#555',
    primary: '#2196F3',
    danger: '#ff3b30',
    sectionBg: colorScheme === 'dark' ? '#1e1e1e' : '#fff',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{waterPoint.name}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>{statusText}</Text>
          </View>
          <Text style={[styles.lastUpdate, { color: colors.subText }]}>
            Dernière mise à jour : {formatDate(waterPoint.lastUpdate)}
          </Text>
        </View>
      </View>

      {/* Informations principales */}
      <View style={[styles.section, { backgroundColor: colors.sectionBg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.subText }]}>Prix du bidon (20L)</Text>
          <Text style={[styles.value, { color: colors.text }]}>{waterPoint.price} FCFA</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.subText }]}>Quartier</Text>
          <Text style={[styles.value, { color: colors.text }]}>{waterPoint.district}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.subText }]}>Évaluation</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stars}</Text>
        </View>
      </View>

      {/* Bouton carte */}
      <TouchableOpacity 
        style={[styles.mapButton, { backgroundColor: colors.primary }]} 
        onPress={openInGoogleMaps}
      >
        <Text style={styles.mapButtonText}>📍 Ouvrir sur la carte</Text>
      </TouchableOpacity>

      {/* Rapports récents */}
      {waterPoint.reports && waterPoint.reports.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.sectionBg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rapports récents</Text>
          {waterPoint.reports.slice(-3).reverse().map((report, index) => (
            <View key={index} style={[styles.reportItem, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0' }]}>
              <Text style={{ color: colors.text }}>{report.description || report.comment}</Text>
              <Text style={{ color: colors.subText, fontSize: 12, marginTop: 4 }}>
                {formatDate(report.date)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]} 
          onPress={handleReport}
        >
          <Text style={styles.actionButtonText}>🚨 Signaler un problème</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]} 
          onPress={handleRate}
        >
          <Text style={styles.actionButtonText}>⭐ Noter ce point</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.danger }]} 
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>🗑 Supprimer ce point d'eau</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  header: { 
    marginBottom: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700',
    marginBottom: 8 
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  lastUpdate: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4
  },
  section: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 16 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 14 
  },
  label: { 
    fontSize: 15,
    flex: 1 
  },
  value: { 
    fontSize: 16, 
    fontWeight: '600',
    flex: 1,
    textAlign: 'right'
  },
  reportItem: { 
    marginBottom: 12, 
    padding: 12, 
    borderRadius: 8 
  },
  mapButton: { 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    marginBottom: 20 
  },
  mapButtonText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  actionsContainer: { 
    marginTop: 10,
    marginBottom: 30 
  },
  actionButton: { 
    paddingVertical: 16, 
    borderRadius: 10, 
    alignItems: 'center',
    marginBottom: 12 
  },
  actionButtonText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
});

export default WaterPointDetail;