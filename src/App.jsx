import { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext, AppProvider } from './context/AppContext';
import './styles/globals.css';

// Import di tutti i componenti
import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import FutureExpensesPage from './components/FutureExpensesPage';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';
import IncomeSetup from './components/IncomeSetup';
import ExpensesSetup from './components/ExpensesSetup';
import SavingsSetup from './components/SavingsSetup';
import Navigation from './components/Navigation';
import OnboardingPage from './components/OnboardingPage';
import LoadingScreen from './components/LoadingScreen';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Definizione delle animazioni per le transizioni tra pagine
const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: '100%' },
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Componente per mostrare lo stato offline
const OfflineIndicator = ({ theme }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: theme?.warning || '#FFB74D',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      Modalità Offline - I dati vengono salvati localmente
    </motion.div>
  );
};

const AppContent = () => {
  const { currentView, theme, isLoading } = useContext(AppContext);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Controlla se l'onboarding è stato completato
  useEffect(() => {
    const checkOnboarding = () => {
      const completed = localStorage.getItem('onboardingCompleted') === 'true';
      setIsOnboardingCompleted(completed);
      setCheckingOnboarding(false);
    };

    // Piccolo delay per una transizione fluida
    setTimeout(checkOnboarding, 100);
  }, []);

  // Registra il service worker e gestisce i messaggi
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/pwabuilder-sw.js')
        .then(registration => {
          console.log('Service Worker registrato con successo:', registration);
          
          // Gestisci gli aggiornamenti del service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuovo service worker disponibile
                console.log('Nuovo contenuto disponibile, ricarica per aggiornare');
              }
            });
          });
        })
        .catch(error => {
          console.error('Errore durante la registrazione del Service Worker:', error);
        });

      // Ascolta i messaggi dal service worker
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('Messaggio dal service worker:', event.data);
        
        if (event.data && event.data.type === 'NEW_DAY') {
          console.log('Nuovo giorno rilevato, ricarico la pagina...');
          // Ricarica la pagina per aggiornare tutti i dati
          window.location.reload();
        }
      });
    }
  }, []);

  // Gestisce gli eventi di visibilità della pagina per PWA
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('App tornata in primo piano, controllo aggiornamenti...');
        
        // Controlla se è un nuovo giorno
        const lastCheck = localStorage.getItem('lastDayCheck');
        const today = new Date().toDateString();
        
        if (lastCheck !== today) {
          console.log('Nuovo giorno rilevato, aggiorno...');
          localStorage.setItem('lastDayCheck', today);
          
          // Forza un aggiornamento dell'app
          window.location.reload();
        }
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        console.log('Pagina ripristinata dalla cache, controllo aggiornamenti...');
        handleVisibilityChange();
      }
    };

    // Aggiungi listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    // Salva il giorno corrente al primo caricamento
    localStorage.setItem('lastDayCheck', new Date().toDateString());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Funzione per gestire il completamento dell'onboarding
  const handleOnboardingComplete = () => {
    setIsOnboardingCompleted(true);
  };

  // Se sta caricando i dati dal database o controllando l'onboarding
  if (isLoading || checkingOnboarding) {
    return <LoadingScreen theme={theme} />;
  }

  // Se l'onboarding non è completato, mostra OnboardingPage
  if (!isOnboardingCompleted) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  // Funzione per renderizzare la vista corrente
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <TransactionHistory />;
      case 'future-expenses':
        return <FutureExpensesPage />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'income':
        return <IncomeSetup />;
      case 'expenses':
        return <ExpensesSetup />;
      case 'savings':
        return <SavingsSetup />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className="app-container"
      style={{
        backgroundColor: theme?.background || '#F8FAFF',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Indicatore offline */}
      <AnimatePresence>
        <OfflineIndicator theme={theme} />
      </AnimatePresence>

      {/* Contenitore principale con animazioni per le transizioni tra pagine */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          style={{
            height: '100%',
            paddingBottom: '80px', // Spazio per la navigation bar
          }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation bar fissa in basso */}
      <Navigation />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

// Componente principale che wrappa tutto con il Provider del context
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;