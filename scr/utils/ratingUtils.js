/**
 * Convertit une note (ex: 4.2) en une chaîne d'étoiles (ex: ⭐⭐⭐⭐☆).
 */
export const getRatingStars = (rating) => { /* ... */ };
 
/**
 * Retourne un code couleur hexadécimal en fonction du statut.
 * Permet de centraliser la logique des couleurs.
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'functional': return '#4CAF50'; // Vert
    case 'broken': return '#F44336';     // Rouge
    case 'crowded': return '#FF9800';    // Orange
    default: return '#9E9E9E';          // Gris
  }
};
 
/**
 * Traduit le statut (ex: 'functional') en texte lisible (ex: 'Fonctionnel').
 */
export const getStatusText = (status) => { /* ... */ };
 
/**
 * Calcule la distance en km entre deux coordonnées GPS en utilisant la formule de Haversine.
 * C'est une fonction mathématique pure.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => { /* ... */ };
 
/**
 * Formate une distance (ex: 0.54 km) en une chaîne lisible (ex: '540 m').
 */
export const formatDistance = (distance) => { /* ... */ };
 
/**
 * Formate une date ISO (ex: '2025-12-01T14:10:00.000Z') en une chaîne relative (ex: 'Il y a 2h').
 */
export const formatDate = (dateString) => { /* ... */ };