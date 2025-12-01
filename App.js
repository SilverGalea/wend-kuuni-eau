// Import des bibliothèques nécessaires
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
 
// Import de tous les écrans de l'application
import HomeScreen from './scr/screens/HomeScreen';
import WaterPointDetail from './scr/screens/WaterPointDetail';
import AddWaterPoint from './scr/screens/AddWaterPoint';
import ReportScreen from './scr/screens/ReportScreen';
 
// Crée une instance du navigateur de type "Stack"
const Stack = createNativeStackNavigator();
 
// Le composant principal de l'application
export default function App() {
  return (
    // 1. Le conteneur de navigation qui englobe toute l'application
    <NavigationContainer>
      {/* 2. Un composant utilitaire pour styliser la barre de statut (heure, batterie...) */}
      <StatusBar style="light" />
      
      {/* 3. Le navigateur lui-même */}
      <Stack.Navigator
        // L'écran à afficher au lancement de l'app
        initialRouteName="Home"
        // Options globales pour tous les écrans de ce navigateur
        screenOptions={{
          headerShown: false, // On masque la barre de titre par défaut pour un design personnalisé
        }}
      >
        {/* 4. Déclaration de chaque écran */}
        {/* Chaque <Stack.Screen> associe un nom (utilisé pour naviguer) à un composant */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WaterPointDetail" component={WaterPointDetail} />
        <Stack.Screen name="AddWaterPoint" component={AddWaterPoint} />
        <Stack.Screen name="ReportScreen" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}