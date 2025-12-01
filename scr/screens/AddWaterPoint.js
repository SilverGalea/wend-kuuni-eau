// AddWaterPoint.js
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
  useWindowDimensions,
  Appearance,
} from 'react-native';
import * as Location from 'expo-location';
import { addWaterPoint } from '../storage/waterStorage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const AddWaterPoint = ({ route, navigation }) => {
  const { userLocation } = route.params || {};

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('25');
  const [status, setStatus] = useState('functional');
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { width } = useWindowDimensions();
  const colorScheme = Appearance.getColorScheme();

  useEffect(() => {
    if (userLocation) {
      setLocation(userLocation);
    } else {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        Alert.alert('Permission refusée', 'Impossible de récupérer la localisation.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de récupérer la localisation.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !district.trim() || !price.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const priceValue = parseInt(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Prix invalide', 'Veuillez entrer un prix numérique valide.');
      return;
    }
    if (!location) {
      Alert.alert('Localisation requise', 'La localisation GPS est nécessaire.');
      return;
    }

    const newWaterPoint = {
      id: uuidv4(),
      name: name.trim(),
      district: district.trim(),
      price: priceValue,
      status,
      rating: 0,
      ratings: [],
      reports: [],
      location,
      lastUpdate: new Date().toISOString(),
    };

    const success = await addWaterPoint(newWaterPoint);

    if (success) {
      Alert.alert('Succès', "Le point d'eau a été ajouté.", [
        { 
          text: 'OK', 
          onPress: () => {
            // Retour vers HomeScreen et rafraîchissement
            navigation.navigate('HomeScreen', { refresh: true });
          } 
        },
      ]);
    } else {
      Alert.alert('Erreur', "Une erreur est survenue lors de la sauvegarde.");
    }
  };

  const dynamicStyles = getDynamicStyles({ width, colorScheme, loadingLocation });

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.title, dynamicStyles.title]}>Ajouter un point d'eau</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, dynamicStyles.label]}>Nom du point d'eau *</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Ex: Borne Fontaine Dassasgo"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, dynamicStyles.label]}>Quartier *</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Ex: Dassasgo"
          value={district}
          onChangeText={setDistrict}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, dynamicStyles.label]}>Prix (FCFA) *</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Ex: 25"
          value={price}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, dynamicStyles.label]}>Statut</Text>
        <View style={dynamicStyles.statusWrapper}>
          {['functional', 'broken'].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[dynamicStyles.statusButton, status === s && dynamicStyles.statusButtonActive]}
            >
              <Text style={[dynamicStyles.statusText, status === s && dynamicStyles.statusTextActive]}>
                {s === 'functional' ? 'Fonctionnel' : 'En panne'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, dynamicStyles.label]}>Localisation</Text>
        {loadingLocation ? (
          <ActivityIndicator size="small" color={dynamicStyles.activityIndicator.color} />
        ) : location ? (
          <Text style={dynamicStyles.locationText}>
            Latitude: {location.latitude.toFixed(5)}, Longitude: {location.longitude.toFixed(5)}
          </Text>
        ) : (
          <TouchableOpacity onPress={getCurrentLocation} style={dynamicStyles.locationButton}>
            <Text style={dynamicStyles.locationButtonText}>Récupérer ma position</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.cancelButton, dynamicStyles.cancelButton]} onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, dynamicStyles.saveButton]} onPress={handleSave}>
          <Text style={dynamicStyles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16 },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, marginRight: 10, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  saveButton: { flex: 1, marginLeft: 10, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
});

const getDynamicStyles = ({ width, colorScheme, loadingLocation }) => {
  const dark = colorScheme === 'dark';
  const colors = {
    background: dark ? '#121212' : '#fefefe',
    text: dark ? '#f0f0f0' : '#111',
    placeholder: dark ? '#888' : '#aaa',
    primary: '#2196F3',
    danger: '#ff3b30',
    statusActive: '#4CAF50',
    statusInactive: '#aaa',
  };

  return StyleSheet.create({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    label: { color: colors.text },
    input: { borderColor: colors.placeholder, color: colors.text },
    statusWrapper: { flexDirection: 'row', justifyContent: 'flex-start' },
    statusButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.statusInactive, marginRight: 10 },
    statusButtonActive: { backgroundColor: colors.statusActive, borderColor: colors.statusActive },
    statusText: { color: colors.statusInactive, fontWeight: '500' },
    statusTextActive: { color: '#fff', fontWeight: '700' },
    locationText: { color: colors.text, fontSize: 14 },
    locationButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
    locationButtonText: { color: '#fff', fontWeight: '600' },
    activityIndicator: { color: colors.primary },
    cancelButton: { backgroundColor: colors.danger },
    cancelButtonText: { color: '#fff', fontWeight: '700' },
    saveButton: { backgroundColor: colors.primary },
    saveButtonText: { color: '#fff', fontWeight: '700' },
  });
};

export default AddWaterPoint;
