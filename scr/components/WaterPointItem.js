import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// On importe nos fonctions utilitaires !
import { getStatusColor, getStatusText, getRatingStars, formatDistance } from '../utils/ratingUtils';
 
/**
 * @param {object} waterPoint - L'objet complet du point d'eau à afficher.
 * @param {function} onPress - La fonction à appeler quand on clique sur l'item.
 * @param {object} userLocation - La localisation de l'utilisateur pour calculer la distance.
 */
const WaterPointItem = ({ waterPoint, onPress, userLocation }) => {
  // On utilise les fonctions de notre fichier utils
  const statusColor = getStatusColor(waterPoint.status);
  const statusText = getStatusText(waterPoint.status);
  const stars = getRatingStars(waterPoint.rating || 0);
  
  // Calcul de la distance (uniquement si on a la localisation de l'utilisateur)
  let distanceText = '';
  if (userLocation && waterPoint.location) {
    const { calculateDistance } = require('../utils/ratingUtils');
    const distance = calculateDistance(/* ... */);
    distanceText = formatDistance(distance);
  }
  
  // Le JSX qui définit la structure visuelle du composant
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{waterPoint.name}</Text>
        {distanceText ? <Text style={styles.distance}>{distanceText}</Text> : null}
      </View>
      
      {/* ... autres informations ... */}
      
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
        {waterPoint.rating > 0 && <Text style={styles.rating}>{stars}</Text>}
      </View>
    </TouchableOpacity>
  );
};
 
// Le StyleSheet qui sépare le style de la structure
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    // ... ombre portée pour un effet de profondeur
  },
  // ... autres styles
});
 
export default WaterPointItem;