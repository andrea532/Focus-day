import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  ChevronRight,
  Wallet,
  PiggyBank,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const SettingsPage = () => {
  const { theme, userSettings, setUserSettings, setCurrentView } =
    useContext(AppContext);

  // Animazioni
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const toggleDarkMode = () => {
    setUserSettings((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  const resetOnboarding = () => {
    if (confirm('Sei sicuro di voler riconfigurare tutto da capo? Tutti i dati attuali verranno persi.')) {
      // Rimuovi il flag di onboarding completato
      localStorage.removeItem('onboardingCompleted');
      // Ricarica la pagina per mostrare l'onboarding
      window.location.reload();
    }
  };

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    action,
    toggle = false,
    toggleValue = false,
    color = theme.primary,
  }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 10 }}
      whileTap={{ scale: 0.98 }}
      onClick={action}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hover effect background */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 2, opacity: 0.1 }}
        style={{
          position: 'absolute',
          left: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>
        <div>
          <p style={{ fontWeight: '500', color: theme.text }}>{title}</p>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            {description}
          </p>
        </div>
      </div>

      {toggle ? (
        <motion.div
          initial={false}
          animate={{ backgroundColor: toggleValue ? color : theme.border }}
          style={{
            width: '48px',
            height: '28px',
            borderRadius: '14px',
            padding: '4px',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div
            initial={false}
            animate={{
              x: toggleValue ? 20 : 0,
              backgroundColor: toggleValue ? 'white' : '#f1f1f1',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '10px',
            }}
          />
        </motion.div>
      ) : (
        <ChevronRight size={20} style={{ color: theme.textSecondary }} />
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="settings-page"
      style={{ paddingBottom: '100px' }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          textAlign: 'center',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
          Impostazioni
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: theme.textSecondary,
            marginTop: '4px',
          }}
        >
          Personalizza la tua esperienza
        </p>
      </motion.div>

      {/* Account e Preferenze */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          margin: '0 16px 24px',
          padding: '20px',
          borderRadius: '24px',
          backgroundColor: theme.card,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <motion.h3
          variants={itemVariants}
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '16px',
          }}
        >
          Preferenze
        </motion.h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SettingItem
            icon={userSettings.darkMode ? Moon : Sun}
            title="Tema"
            description={
              userSettings.darkMode ? 'Tema scuro attivo' : 'Tema chiaro attivo'
            }
            action={toggleDarkMode}
            toggle={true}
            toggleValue={userSettings.darkMode}
            color="#6366F1"
          />

          <SettingItem
            icon={Globe}
            title="Lingua"
            description="Italiano"
            action={() => {}}
            color="#10B981"
          />
        </div>
      </motion.div>

      {/* Configurazione Budget */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          margin: '0 16px 24px',
          padding: '20px',
          borderRadius: '24px',
          backgroundColor: theme.card,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <motion.h3
          variants={itemVariants}
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '16px',
          }}
        >
          Configurazione Budget
        </motion.h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('income')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: `${theme.secondary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={20} style={{ color: theme.secondary }} />
              </motion.div>
              <div>
                <p style={{ fontWeight: '500', color: theme.text }}>Entrate</p>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Modifica il tuo periodo di pagamento
                </p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: theme.textSecondary }} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('expenses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: `${theme.danger}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calculator size={20} style={{ color: theme.danger }} />
              </motion.div>
              <div>
                <p style={{ fontWeight: '500', color: theme.text }}>
                  Spese Fisse
                </p>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Gestisci le spese ricorrenti
                </p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: theme.textSecondary }} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('savings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: `${theme.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PiggyBank size={20} style={{ color: theme.primary }} />
              </motion.div>
              <div>
                <p style={{ fontWeight: '500', color: theme.text }}>Risparmi</p>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Configura i tuoi obiettivi
                </p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: theme.textSecondary }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Gestione Dati */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          margin: '0 16px 24px',
          padding: '20px',
          borderRadius: '24px',
          backgroundColor: theme.card,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <motion.h3
          variants={itemVariants}
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '16px',
          }}
        >
          Gestione Dati
        </motion.h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetOnboarding}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: theme.background,
              border: `1px solid ${theme.danger}`,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: `${theme.danger}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RefreshCw size={20} style={{ color: theme.danger }} />
              </motion.div>
              <div>
                <p style={{ fontWeight: '500', color: theme.text }}>
                  Riconfigura Budget
                </p>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Ricomincia da capo la configurazione
                </p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: theme.textSecondary }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Developer Credits */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        style={{
          margin: '32px 16px 16px',
          textAlign: 'center',
        }}
      >
        <motion.p
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: '12px', color: theme.textSecondary }}
        >
          Sviluppato con ❤️ per aiutarti a gestire le tue finanze
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;