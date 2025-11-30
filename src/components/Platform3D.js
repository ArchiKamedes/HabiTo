import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';

const Platform3D = ({ position, color }) => {
  // 1. Zamieniamy require na obiekt Asset (rozwiązuje błąd "lastIndexOf")
  const asset = Asset.fromModule(require('../../assets/models/platform.glb'));
  
  // 2. Pobieramy 'scene' bezpośrednio z loadera
  // Używamy adresu URI z assetu
  const { scene } = useGLTF(asset.uri || asset.localUri);

  const clone = useMemo(() => {
    // 3. Używamy zmiennej 'scene' (a nie 'gltf.scene')
    const clonedScene = scene.clone();
    
    return clonedScene;
  }, [scene, color]); // W zależnościach też 'scene'

  return (
    <primitive 
      object={clone} 
      position={position} 
      // Opcjonalnie: skalowanie, jeśli model jest za duży/za mały
      // scale={[0.5, 0.5, 0.5]} 
    />
  );
};

export default Platform3D;