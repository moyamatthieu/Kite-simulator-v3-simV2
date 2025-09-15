/**
 * main.ts - Point d'entrée principal optimisé
 * 
 * Chargement progressif pour éviter les violations DOM
 * et améliorer les performances de démarrage
 */

import { SimulationApp } from './SimulationApp';
import { CaoApp } from './CaoApp';

// Types pour améliorer la sécurité
interface KiteApp {
  dispose?(): void;
  [key: string]: any; // Pour compatibilité avec les classes existantes
}

function getAppMode(): 'simulation' | 'cao' {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'cao' ? 'cao' : 'simulation';
}

/**
 * Crée l'indicateur de mode de manière asynchrone
 */
function createModeIndicator(mode: 'simulation' | 'cao'): HTMLElement {
  const modeIndicator = document.createElement('div');
  modeIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: ${mode === 'cao' ? '#4a90e2' : '#5cb85c'};
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1001;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  modeIndicator.innerHTML = `
    Mode: ${mode === 'cao' ? '🔧 CAO' : '🪁 Simulation'}<br>
    <small>URL: ?mode=${mode === 'cao' ? 'simulation' : 'cao'} pour changer</small>
  `;
  
  // Animation d'apparition
  requestAnimationFrame(() => {
    modeIndicator.style.opacity = '1';
  });
  
  return modeIndicator;
}

/**
 * Initialisation progressive pour éviter les violations DOM
 */
async function initializeApp(): Promise<void> {
  try {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('#app container not found');
    }

    const mode = getAppMode();
    
    // Étape 1: Créer l'indicateur de mode (léger)
    const modeIndicator = createModeIndicator(mode);
    document.body.appendChild(modeIndicator);
    
    // Étape 2: Petit délai pour permettre au DOM de se stabiliser
    await new Promise(resolve => setTimeout(resolve, 16)); // 1 frame à 60fps
    
    // Étape 3: Initialiser l'application principale
    let app: KiteApp;
    
    if (mode === 'cao') {
      console.log('🔧 Démarrage en mode CAO');
      app = new CaoApp(appContainer);
    } else {
      console.log('🪁 Démarrage en mode Simulation');
      app = new SimulationApp(appContainer);
    }

    // Étape 4: Attacher à window pour les dev tools
    (window as any).kiteApp = app;
    (window as any).kiteSim = app; // compatibility
    
    console.log('✅ Application initialisée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    
    // Affichage d'erreur user-friendly
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      text-align: center;
      z-index: 2000;
    `;
    errorDiv.innerHTML = `
      <h3>🚫 Erreur de chargement</h3>
      <p>${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
      <small>Vérifiez la console pour plus de détails</small>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Démarrage optimisé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM déjà chargé
  initializeApp();
}

