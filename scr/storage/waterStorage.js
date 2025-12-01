// Import de la bibliothèque de stockage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définition d'une clé de stockage unique pour éviter les conflits
const STORAGE_KEY = '@wend_kuuni_eau:water_points';

/**
 * Récupère tous les points d'eau depuis le stockage local.
 */
export const getWaterPoints = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Erreur lors de la récupération des points d'eau:", e);
    return [];
  }
};

/**
 * Sauvegarde un tableau complet de points d'eau dans le stockage.
 */
export const saveWaterPoints = async (waterPoints) => {
  try {
    const jsonValue = JSON.stringify(waterPoints);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (e) {
    console.error("Erreur lors de la sauvegarde des points d'eau:", e);
    return false;
  }
};

/**
 * Ajoute un nouveau point d'eau à la liste existante.
 */
export const addWaterPoint = async (waterPoint) => {
  try {
    const waterPoints = await getWaterPoints();
    waterPoints.push(waterPoint);
    await saveWaterPoints(waterPoints);
    return true;
  } catch (e) {
    console.error("Erreur lors de l'ajout du point d'eau:", e);
    return false;
  }
};

/**
 * Met à jour un point d'eau spécifique par son ID.
 */
export const updateWaterPoint = async (id, updatedData) => {
  try {
    const waterPoints = await getWaterPoints();
    const index = waterPoints.findIndex(wp => wp.id === id);

    if (index !== -1) {
      waterPoints[index] = {
        ...waterPoints[index],
        ...updatedData,
        lastUpdate: new Date().toISOString()
      };
      await saveWaterPoints(waterPoints);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Erreur lors de la mise à jour du point d'eau:", e);
    return false;
  }
};

/**
 * Supprime un point d'eau par son ID.
 */
// Ajoutez dans waterStorage.js
export const deleteWaterPoint = async (id) => {
  try {
    const waterPoints = await getWaterPoints();
    const updatedPoints = waterPoints.filter(wp => wp.id !== id);
    await saveWaterPoints(updatedPoints);
    return true;
  } catch (e) {
    console.error('Erreur suppression:', e);
    return false;
  }
};


/**
 * Ajoute un rapport à un point d'eau.
 */
export const addReport = async (id, report) => {
  try {
    const waterPoints = await getWaterPoints();
    const index = waterPoints.findIndex(wp => wp.id === id);

    if (index !== -1) {
      waterPoints[index].reports = waterPoints[index].reports || [];
      waterPoints[index].reports.push({
        ...report,
        date: new Date().toISOString()
      });
      await saveWaterPoints(waterPoints);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Erreur lors de l'ajout d'un rapport:", e);
    return false;
  }
};

/**
 * Met à jour la note d'un point d'eau.
 */
export const updateRating = async (id, rating) => {
  try {
    const waterPoints = await getWaterPoints();
    const index = waterPoints.findIndex(wp => wp.id === id);

    if (index !== -1) {
      waterPoints[index].ratings = waterPoints[index].ratings || [];
      waterPoints[index].ratings.push(rating);

      // Calcul de la moyenne
      const total = waterPoints[index].ratings.reduce((acc, val) => acc + val, 0);
      waterPoints[index].rating = total / waterPoints[index].ratings.length;

      await saveWaterPoints(waterPoints);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Erreur lors de la mise à jour de la note:", e);
    return false;
  }
};
