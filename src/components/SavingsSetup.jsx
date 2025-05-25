import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  ArrowRight, 
  Check,
  Percent,
  DollarSign,
  AlertCircle,
  PiggyBank,
  CalendarRange,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const SavingsSetup = () => {
  const {
    monthlyIncome,
    fixedExpenses,
    savingsPercentage,
    setSavingsPercentage,
    savingsMode: savedMode,
    setSavingsMode,
    savingsPeriod: savedPeriod,
    setSavingsPeriod,
    savingsFixedAmount: savedFixedAmount,
    setSavingsFixedAmount,
    savingsStartDate: savedStartDate,
    setSavingsStartDate,
    savingsEndDate: savedEndDate,
    setSavingsEndDate,
    theme,
    setCurrentView,
    addToSavings,
  } = useContext(AppContext);

  // Stati locali inizializzati con i valori salvati
  const [savingsMode, setSavingsModeLocal] = useState(savedMode || 'percentage');
  const [percentage, setPercentage] = useState(savingsPercentage || 20);
  const [fixedAmount, setFixedAmount] = useState(savedFixedAmount ? savedFixedAmount.toString() : '');
  const [startDate, setStartDate] = useState(savedStartDate || '');
  const [endDate, setEndDate] = useState(savedEndDate || '');
  const [isRepeating, setIsRepeating] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calcola i giorni del periodo - METODO PIÙ AFFIDABILE
  const calculatePeriodDays = () => {
    if (!startDate || !endDate) return 0;
    
    // Crea le date assicurandosi che siano interpretate come date locali
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    // Metodo di conteggio diretto - più affidabile
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      count++;
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Calcola il prossimo periodo
  const calculateNextPeriod = () => {
    if (!startDate || !endDate || !isRepeating) return null;
    
    const periodDays = calculatePeriodDays();
    const end = new Date(endDate + 'T00:00:00');
    
    // Il prossimo periodo inizia il giorno dopo la fine del periodo corrente
    const nextStart = new Date(end);
    nextStart.setDate(nextStart.getDate() + 1);
    
    // Il prossimo periodo ha la stessa durata
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextEnd.getDate() + periodDays - 1);
    
    return {
      start: nextStart.toISOString().split('T')[0],
      end: nextEnd.toISOString().split('T')[0]
    };
  };

  // Verifica se siamo nel periodo corrente
  const isInCurrentPeriod = () => {
    if (!startDate || !endDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    return today >= start && today <= end;
  };

  // Calcola i giorni rimanenti nel periodo
  const getDaysRemaining = () => {
    if (!endDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate + 'T00:00:00');
    
    if (today > end) return 0;
    
    // Conta i giorni rimanenti incluso oggi
    let count = 0;
    const current = new Date(today);
    
    while (current <= end) {
      count++;
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Carica la preferenza di ripetizione
  useEffect(() => {
    const savedRepeating = localStorage.getItem('savingsRepeating');
    if (savedRepeating !== null) {
      setIsRepeating(savedRepeating === 'true');
    }
  }, []);

  // Auto-aggiornamento del periodo quando necessario
  useEffect(() => {
    if (isRepeating && !isInCurrentPeriod() && startDate && endDate) {
      const nextPeriod = calculateNextPeriod();
      if (nextPeriod && new Date() >= new Date(nextPeriod.start)) {
        // Aggiorna automaticamente al periodo successivo
        setStartDate(nextPeriod.start);
        setEndDate(nextPeriod.end);
        setSavingsStartDate(nextPeriod.start);
        setSavingsEndDate(nextPeriod.end);
      }
    }
  }, [startDate, endDate, isRepeating]);

  // Calcoli
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const availableForSavings = monthlyIncome - totalFixedExpenses;
  const periodDays = calculatePeriodDays();
  const daysRemaining = getDaysRemaining();
  
  // Calcola l'importo del risparmio per il periodo
  const calculateSavingsAmount = () => {
    if (!startDate || !endDate) return 0;
    
    return savingsMode === 'percentage' 
      ? (monthlyIncome * percentage) / 100
      : parseFloat(fixedAmount) || 0;
  };

  const savingsAmount = calculateSavingsAmount();
  const dailySavings = periodDays > 0 ? savingsAmount / periodDays : 0;
  const remainingBudget = monthlyIncome - totalFixedExpenses - savingsAmount;
  const savingsPercentageCalculated = monthlyIncome > 0 
    ? (savingsAmount / monthlyIncome) * 100 
    : 0;

  // Validazioni - ora accetta anche 0
  const isSavingsValid = savingsAmount >= 0 && savingsAmount <= availableForSavings;
  const isWarning = savingsAmount > availableForSavings * 0.8 && savingsAmount <= availableForSavings;
  const isDanger = savingsAmount > availableForSavings;

  const handleSave = () => {
    if (isSavingsValid && startDate && endDate) {
      // Salva le impostazioni nel context
      setSavingsMode(savingsMode);
      setSavingsPeriod('custom'); // Sempre custom ora
      setSavingsStartDate(startDate);
      setSavingsEndDate(endDate);
      
      if (savingsMode === 'percentage') {
        setSavingsPercentage(percentage);
        setSavingsFixedAmount(0);
      } else {
        setSavingsFixedAmount(parseFloat(fixedAmount));
        const percentageEquivalent = monthlyIncome > 0 
          ? (parseFloat(fixedAmount) / monthlyIncome) * 100
          : 0;
        setSavingsPercentage(percentageEquivalent);
      }
      
      // Salva la preferenza di ripetizione
      localStorage.setItem('savingsRepeating', isRepeating.toString());
      
      // Se è attiva la ripetizione, salva anche le info del prossimo periodo
      if (isRepeating) {
        const nextPeriod = calculateNextPeriod();
        if (nextPeriod) {
          localStorage.setItem('savingsNextPeriodStart', nextPeriod.start);
          localStorage.setItem('savingsNextPeriodEnd', nextPeriod.end);
        }
      }
      
      // Se siamo nel periodo attivo e l'importo è maggiore di 0, aggiungi il risparmio
      if (isInCurrentPeriod() && savingsAmount > 0) {
        addToSavings(savingsAmount);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setCurrentView('dashboard');
      }, 800);
    }
  };

  // Validazione form - ora accetta anche 0
  const isFormValid = () => {
    const hasValidAmount = savingsAmount >= 0 && savingsAmount <= availableForSavings;
    const hasValidDates = startDate && endDate && new Date(startDate) <= new Date(endDate);
    return hasValidAmount && hasValidDates;
  };

  // Preset per importi fissi
  const fixedPresets = [0, 50, 100, 200, 300, 500];
  const percentagePresets = [0, 5, 10, 15, 20, 30];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="savings-setup"
      style={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        paddingBottom: '100px' 
      }}
    >
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: theme.secondary,
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <Check size={40} color="white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          backgroundColor: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          marginBottom: '24px'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text }}>
          I tuoi obiettivi di risparmio
        </h2>
        <p style={{
          fontSize: '16px',
          color: theme.textSecondary,
          marginTop: '8px',
        }}>
          Imposta il periodo e l'importo da risparmiare
        </p>
      </motion.div>

      <div style={{ padding: '0 16px' }}>
        {/* Card periodo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: theme.card,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px' 
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: `${theme.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarRange size={24} style={{ color: theme.primary }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
                Periodo di risparmio
              </h3>
              <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                Da quando a quando
              </p>
            </div>
          </div>

          {/* Date del periodo */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '14px',
                color: theme.textSecondary,
                display: 'block',
                marginBottom: '8px'
              }}>
                Data inizio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.background,
                  fontSize: '16px',
                  color: theme.text,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '14px',
                color: theme.textSecondary,
                display: 'block',
                marginBottom: '8px'
              }}>
                Data fine
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.background,
                  fontSize: '16px',
                  color: theme.text,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Toggle ripetizione */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRepeating(!isRepeating)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: theme.background,
              borderRadius: '12px',
              cursor: 'pointer',
              border: `1px solid ${isRepeating ? theme.primary : theme.border}`,
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={20} style={{ color: isRepeating ? theme.primary : theme.textSecondary }} />
              <div>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: theme.text 
                }}>
                  Ripeti automaticamente
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.textSecondary 
                }}>
                  Il periodo si ripeterà per i prossimi {periodDays || '...'} giorni
                </p>
              </div>
            </div>
            
            {isRepeating ? (
              <ToggleRight size={32} style={{ color: theme.primary }} />
            ) : (
              <ToggleLeft size={32} style={{ color: theme.textSecondary }} />
            )}
          </motion.div>

          {/* Info prossimo periodo se ripetizione attiva */}
          {isRepeating && startDate && endDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: `${theme.primary}10`,
                borderRadius: '12px',
                border: `1px solid ${theme.primary}30`
              }}
            >
              <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '4px' }}>
                Prossimo periodo
              </p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: theme.primary }}>
                {calculateNextPeriod() ? 
                  `${new Date(calculateNextPeriod().start).toLocaleDateString('it-IT')} - ${new Date(calculateNextPeriod().end).toLocaleDateString('it-IT')}` 
                  : 'Non definito'}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Selettore modalità risparmio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: theme.card,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: theme.text,
            marginBottom: '20px'
          }}>
            Quanto vuoi risparmiare?
          </h3>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSavingsModeLocal('percentage')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${savingsMode === 'percentage' ? theme.primary : theme.border}`,
                backgroundColor: savingsMode === 'percentage' ? `${theme.primary}10` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Percent size={24} style={{ color: theme.primary, marginBottom: '8px' }} />
              <p style={{ 
                fontWeight: '600', 
                color: savingsMode === 'percentage' ? theme.primary : theme.text,
                marginBottom: '4px'
              }}>
                Percentuale
              </p>
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                % dello stipendio
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSavingsModeLocal('fixed')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${savingsMode === 'fixed' ? theme.primary : theme.border}`,
                backgroundColor: savingsMode === 'fixed' ? `${theme.primary}10` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <DollarSign size={24} style={{ color: theme.primary, marginBottom: '8px' }} />
              <p style={{ 
                fontWeight: '600', 
                color: savingsMode === 'fixed' ? theme.primary : theme.text,
                marginBottom: '4px'
              }}>
                Importo fisso
              </p>
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                € per il periodo
              </p>
            </motion.button>
          </div>

          {/* Input in base alla modalità */}
          <AnimatePresence mode="wait">
            {savingsMode === 'percentage' ? (
              <motion.div
                key="percentage-input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                      0%
                    </span>
                    <motion.span
                      key={percentage}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.secondary,
                      }}
                    >
                      {percentage}%
                    </motion.span>
                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                      100%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: `linear-gradient(to right, ${theme.secondary} 0%, ${theme.secondary} ${percentage}%, ${theme.border} ${percentage}%, ${theme.border} 100%)`,
                      outline: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Preset percentuali */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {percentagePresets.map((preset) => (
                    <motion.button
                      key={preset}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPercentage(preset)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        backgroundColor: percentage === preset ? theme.secondary : theme.background,
                        color: percentage === preset ? 'white' : theme.text,
                        border: `1px solid ${percentage === preset ? theme.secondary : theme.border}`,
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      {preset}%
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="fixed-input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: theme.background,
                    borderRadius: '16px',
                    padding: '16px',
                    gap: '12px',
                    border: `2px solid ${fixedAmount ? theme.secondary : theme.border}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: theme.secondary
                    }}>
                      €
                    </span>
                    <input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      placeholder="0"
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '24px',
                        fontWeight: '600',
                        color: theme.text,
                      }}
                      min="0"
                      step="50"
                    />
                  </div>
                </div>

                {/* Preset importi fissi */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {fixedPresets.map((preset) => (
                    <motion.button
                      key={preset}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFixedAmount(preset.toString())}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        backgroundColor: parseFloat(fixedAmount) === preset ? theme.secondary : theme.background,
                        color: parseFloat(fixedAmount) === preset ? 'white' : theme.text,
                        border: `1px solid ${parseFloat(fixedAmount) === preset ? theme.secondary : theme.border}`,
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      €{preset}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Riepilogo risparmio - ora mostra anche con 0 */}
        {isFormValid() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: theme.card,
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: isDanger ? `2px solid ${theme.danger}` : isWarning ? `2px solid ${theme.warning}` : 'none'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '20px' 
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: `${theme.secondary}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PiggyBank size={24} style={{ color: theme.secondary }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
                  {savingsAmount === 0 ? 'Nessun risparmio pianificato' : 'Il tuo risparmio'}
                </h3>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {isInCurrentPeriod() ? 'Periodo attivo' : 'Periodo futuro'} • {daysRemaining} giorni rimanenti
                </p>
              </div>
            </div>

            <motion.div
              key={savingsAmount}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: theme.background,
                borderRadius: '16px',
                marginBottom: '20px'
              }}
            >
              <p style={{ 
                fontSize: '36px', 
                fontWeight: '700',
                color: isDanger ? theme.danger : savingsAmount === 0 ? theme.textSecondary : theme.secondary
              }}>
                € {savingsAmount.toFixed(2)}
              </p>
              <p style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>
                {savingsAmount === 0 
                  ? 'Nessun risparmio per questo periodo' 
                  : `€ ${dailySavings.toFixed(2)} al giorno per ${periodDays} giorni`
                }
              </p>
            </motion.div>

            {/* Alert se necessario */}
            <AnimatePresence>
              {isDanger && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    backgroundColor: `${theme.danger}10`,
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <AlertCircle size={20} style={{ color: theme.danger, flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', color: theme.danger }}>
                    Attenzione! Questo importo supera il tuo budget disponibile.
                  </p>
                </motion.div>
              )}
              
              {savingsAmount === 0 && !isDanger && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <PiggyBank size={20} style={{ color: theme.primary, flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', color: theme.primary }}>
                    Nessun problema! Puoi sempre modificare i tuoi risparmi più tardi.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: theme.background,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
                  Budget rimanente
                </p>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: remainingBudget >= 0 ? theme.text : theme.danger
                }}>
                  € {remainingBudget.toFixed(2)}
                </p>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: theme.background,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
                  In un anno
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: savingsAmount === 0 ? theme.textSecondary : theme.secondary }}>
                  € {savingsAmount === 0 ? '0.00' : (savingsAmount * (365 / periodDays)).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pulsante salva */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={!isFormValid()}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '16px',
            background: isFormValid()
              ? `linear-gradient(135deg, ${theme.primary} 0%, #5A85FF 100%)`
              : theme.border,
            color: isFormValid() ? 'white' : theme.textSecondary,
            fontSize: '18px',
            fontWeight: '600',
            border: 'none',
            cursor: isFormValid() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {savingsAmount === 0 ? 'Continua senza risparmi' : 'Salva e vai alla Dashboard'}
          <ArrowRight size={20} />
        </motion.button>

        {/* Navigation */}
        <motion.div
          style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setCurrentView('expenses')}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme.textSecondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            Indietro
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SavingsSetup;