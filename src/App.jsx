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

const AppContent = () => {
  const { currentView, theme } = useContext(AppContext);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Controlla se l'onboarding è stato completato
  useEffect(() => {
    const checkOnboarding = () => {
      const completed = localStorage.getItem('onboardingCompleted') === 'true';
      setIsOnboardingCompleted(completed);
      setIsLoading(false);
    };

    // Simula un breve caricamento per una transizione fluida
    setTimeout(checkOnboarding, 500);
  }, []);

  // Funzione per gestire il completamento dell'onboarding
  const handleOnboardingComplete = () => {
    setIsOnboardingCompleted(true);
  };

  // Se sta caricando, mostra lo schermo di caricamento
  if (isLoading) {
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