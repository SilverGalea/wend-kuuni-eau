import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Appearance } from 'react-native';
import { addReport, updateRating } from '../storage/waterStorage';

const ReportScreen = ({ route, navigation }) => {
  const { waterPoint, type } = route.params;
  const [selectedType, setSelectedType] = useState('panne');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);

  const colorScheme = Appearance.getColorScheme();
  const colors = {
    background: colorScheme === 'dark' ? '#121212' : '#fefefe',
    text: colorScheme === 'dark' ? '#f0f0f0' : '#111',
    subText: colorScheme === 'dark' ? '#bbb' : '#555',
    primary: '#2196F3',
    danger: '#ff3b30',
    inputBg: colorScheme === 'dark' ? '#1e1e1e' : '#fff',
  };

  const handleSubmitReport = async () => {
    if (!description.trim()) {
      Alert.alert('Description requise', 'Veuillez décrire le problème.');
      return;
    }
    const report = { type: selectedType, description: description.trim() };
    const success = await addReport(waterPoint.id, report);
    if (success) {
      Alert.alert('Merci !', 'Votre rapport a bien été envoyé.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez sélectionner une note de 1 à 5.');
      return;
    }
    const success = await updateRating(waterPoint.id, rating);
    if (success) {
      Alert.alert('Merci !', 'Votre note a été enregistrée.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  if (type === 'rating') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Noter ce point d'eau</Text>
        <View style={styles.starsContainer}>
          {[1,2,3,4,5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setRating(value)}>
              <Text style={[styles.starText, { color: value <= rating ? colors.primary : colors.subText }]}>{value <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmitRating}>
          <Text style={styles.buttonText}>Enregistrer la note</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Signaler un problème</Text>
      <View style={styles.typeSelector}>
        {['panne','proprete','autre'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.typeButton,
              { 
                backgroundColor: selectedType === t ? colors.primary : colors.inputBg,
                borderColor: selectedType === t ? colors.primary : '#ccc',
              }
            ]}
            onPress={() => setSelectedType(t)}
          >
            <Text style={{ color: selectedType === t ? '#fff' : colors.text, fontWeight: '600' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder="Décrivez le problème en détail..."
        placeholderTextColor={colors.subText}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger }]} onPress={handleSubmitReport}>
        <Text style={styles.buttonText}>Envoyer le rapport</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding:16 },
  title: { fontSize:22, fontWeight:'700', marginBottom:20 },
  starsContainer: { flexDirection:'row', justifyContent:'center', marginBottom:20 },
  starText: { fontSize:36, marginHorizontal:4 },
  button: { paddingVertical:14, borderRadius:8, alignItems:'center', marginTop:20 },
  buttonText: { color:'#fff', fontWeight:'700', fontSize:16 },
  textArea: { minHeight:120, padding:12, borderRadius:8, fontSize:16, marginTop:16, textAlignVertical:'top' },
  typeSelector: { flexDirection:'row', justifyContent:'space-between', marginBottom:16 },
  typeButton: { flex:1, paddingVertical:10, marginHorizontal:4, borderRadius:8, alignItems:'center', borderWidth:1 },
});

export default ReportScreen;
