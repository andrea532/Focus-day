// src/components/PWAInstallPrompt.jsx
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const PWAInstallPrompt = () => {
  const { theme } = useContext(AppContext);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Verifica se l'app è già installata
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verifica se l'utente ha già rifiutato l'installazione
    const installDismissed = localStorage.getItem('pwaInstallDismissed');
    const dismissedDate = localStorage.getItem('pwaInstallDismissedDate');
    
    if (installDismissed === 'true' && dismissedDate) {
      // Mostra di nuovo dopo 7 giorni
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Gestisci l'evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostra il prompt dopo 2 secondi se l'utente ha già usato l'app
      const hasUsedApp = localStorage.getItem('onboardingCompleted') === 'true';
      if (hasUsedApp) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    // Gestisci l'evento appinstalled
    const handleAppInstalled = () => {
      console.log('PWA installata con successo');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Mostra il prompt di installazione nativo
      deferredPrompt.prompt();
      
      // Attendi la scelta dell'utente
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Utente ha accettato l\'installazione');
      } else {
        console.log('Utente ha rifiutato l\'installazione');
        // Salva che l'utente ha rifiutato
        localStorage.setItem('pwaInstallDismissed', 'true');
        localStorage.setItem('pwaInstallDismissedDate', Date.now().toString());
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Errore durante l\'installazione:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
    localStorage.setItem('pwaInstallDismissedDate', Date.now().toString());
  };

  // Non mostrare nulla se l'app è già installata o non c'è il prompt
  if (isInstalled || !deferredPrompt) {
    return (
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: theme.secondary,
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              zIndex: 100
            }}
          >
            <Check size={24} />
            <span style={{ fontWeight: '600' }}>App installata con successo!</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 90
            }}
          />
          
          {/* Prompt di installazione */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.card,
              borderRadius: '24px 24px 0 0',
              padding: '24px',
              zIndex: 95,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            {/* Pulsante chiudi */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
            
            {/* Contenuto */}
            <div style={{ textAlign: 'center' }}>
              {/* Icona */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${theme.primary} 0%, #5A85FF 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px rgba(76, 111, 255, 0.3)'
                }}
              >
                <Smartphone size={40} color="white" />
              </motion.div>
              
              {/* Titolo */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.text,
                  marginBottom: '12px'
                }}
              >
                Installa Budget App
              </motion.h3>
              
              {/* Descrizione */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: '16px',
                  color: theme.textSecondary,
                  marginBottom: '32px',
                  lineHeight: '1.5'
                }}
              >
                Accedi rapidamente all'app dalla schermata home. 
                Funziona anche offline e ricevi notifiche per i tuoi obiettivi.
              </motion.p>
              
              {/* Vantaggi */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginBottom: '32px',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                {[
                  { icon: '🚀', text: 'Accesso rapido' },
                  { icon: '📱', text: 'Come un\'app nativa' },
                  { icon: '🔔', text: 'Notifiche' },
                  { icon: '🌐', text: 'Funziona offline' }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      flex: '1 1 100px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{feature.icon}</span>
                    <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Pulsanti azione */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <button
                  onClick={handleDismiss}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: theme.background,
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Più tardi
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstall}
                  style={{
                    flex: 2,
                    padding: '16px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.primary} 0%, #5A85FF 100%)`,
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={20} />
                  Installa ora
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;