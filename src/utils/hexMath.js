// src/utils/hexMath.js

// Rozmiar Twojej platformy (promień od środka do rogu)
// Musisz to dostosować eksperymentalnie do wielkości swojego modelu .glb
const HEX_RADIUS = 1.2; 

export const calculateHexPosition = (index) => {
  // Ile platform chcemy w jednym rzędzie (np. spiralnie lub wierszami)
  // Tutaj robimy prosty układ "wiersz po wierszu" dla ułatwienia
  const width = Math.sqrt(3) * HEX_RADIUS;
  const height = 2 * HEX_RADIUS;
  
  // Ustawienia siatki (np. 5 platform w rzędzie)
  const itemsPerRow = 4; 
  
  const row = Math.floor(index / itemsPerRow);
  const col = index % itemsPerRow;

  // Przesunięcie co drugiego rzędu
  const xOffset = (row % 2) * (width / 2);
  
  // Obliczenie pozycji
  const x = (col * width) + xOffset - (itemsPerRow * width) / 2; // Centrujemy całość
  const z = row * (height * 0.75) - 5; // 0.75 to "zgniatanie" w pionie dla heksagonów
  
  return [x, 0, z]; // [x, y, z] - y jest 0, bo ta sama wysokość
};