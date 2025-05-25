import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  ArrowRight,
  Check,
  RefreshCw,
  CalendarRange,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const IncomeSetup = () => {
  const {
    monthlyIncome,
    setMonthlyIncome,
    setLastPaydayDate,
    setNextPaydayDate,
    setPaymentType: setSavedPaymentType,
    customStartDate: savedStartDate,
    setCustomStartDate: setSavedStartDate,
    customEndDate: savedEndDate,
    setCustomEndDate: setSavedEndDate,
    theme,
    setCurrentView,
  } = useContext(AppContext);

  // Stati del form
  const [income, setIncome] = useState(monthlyIncome ? monthlyIncome.toString() : '');
  const [startDate, setStartDate] = useState(savedStartDate || '');
  const [endDate, setEndDate] = useState(savedEndDate || '');
  const [isRepeating, setIsRepeating] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calcola i giorni del periodo - VERSIONE CORRETTA
  const calculatePeriodDays = () => {
    if (!startDate || !endDate) return 0;
    
    // Crea le date assicurandosi che siano interpretate correttamente
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    // Metodo di conteggio diretto
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
    
    // Il prossimo periodo ha la stessa durata (meno 1 perché aggiungiamo i giorni alla data di inizio)
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

  // Gestione salvataggio
  const handleSave = () => {
    const parsedIncome = parseFloat(income);
    if (!isNaN(parsedIncome) && parsedIncome > 0 && startDate && endDate) {
      // Salva i dati base
      setMonthlyIncome(parsedIncome);
      setSavedPaymentType('custom');
      setSavedStartDate(startDate);
      setSavedEndDate(endDate);
      
      // Imposta le date di pagamento per compatibilità
      setLastPaydayDate(startDate);
      setNextPaydayDate(endDate);
      
      // Salva la preferenza di ripetizione nel localStorage
      localStorage.setItem('incomeRepeating', isRepeating.toString());
      
      // Se è attiva la ripetizione, salva anche le info del prossimo periodo
      if (isRepeating) {
        const nextPeriod = calculateNextPeriod();
        if (nextPeriod) {
          localStorage.setItem('nextPeriodStart', nextPeriod.start);
          localStorage.setItem('nextPeriodEnd', nextPeriod.end);
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setCurrentView('expenses');
      }, 800);
    }
  };

  // Validazione form
  const isFormValid = () => {
    const hasIncome = income && parseFloat(income) > 0;
    const hasDates = startDate && endDate;
    const validDates = startDate && endDate && new Date(startDate) <= new Date(endDate);
    return hasIncome && hasDates && validDates;
  };

  // Carica la preferenza di ripetizione
  useEffect(() => {
    const savedRepeating = localStorage.getItem('incomeRepeating');
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
        setSavedStartDate(nextPeriod.start);
        setSavedEndDate(nextPeriod.end);
      }
    }
  }, [startDate, endDate, isRepeating]);

  const periodDays = calculatePeriodDays();
  const daysRemaining = getDaysRemaining();
  const dailyAmount = periodDays > 0 && income ? (parseFloat(income) / periodDays).toFixed(2) : '0.00';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="income-setup"
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
          Le tue entrate
        </h2>
        <p style={{
          fontSize: '16px',
          color: theme.textSecondary,
          marginTop: '8px',
        }}>
          Imposta il tuo stipendio e il periodo
        </p>
      </motion.div>

      <div style={{ padding: '0 16px' }}>
        {/* Card importo */}
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
              backgroundColor: `${theme.secondary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={24} style={{ color: theme.secondary }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
                Importo
              </h3>
              <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                Quanto guadagni nel periodo
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: '16px',
            padding: '20px',
            gap: '12px',
            border: `2px solid ${income ? theme.secondary : theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <span style={{
              fontSize: '32px',
              fontWeight: '700',
              color: theme.secondary
            }}>
              €
            </span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '32px',
                fontWeight: '600',
                color: theme.text,
              }}
              min="0"
              step="100"
            />
          </div>

          {/* Mostra importo giornaliero se i dati sono validi */}
          {income && periodDays > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: `${theme.secondary}10`,
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                € {dailyAmount} al giorno ({periodDays} giorni)
              </p>
              {/* Debug info */}
              <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                {income} ÷ {periodDays} = {dailyAmount}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Card periodo */}
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
                Periodo di pagamento
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

        {/* Riepilogo se form valido */}
        {isFormValid() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: `${theme.secondary}10`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${theme.secondary}30`,
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                Stato periodo
              </p>
              <Calendar size={20} style={{ color: theme.secondary }} />
            </div>
            
            <p style={{ fontSize: '20px', fontWeight: '700', color: theme.secondary, marginBottom: '4px' }}>
              {isInCurrentPeriod() ? 'Periodo attivo' : 'Periodo futuro'}
            </p>
            
            <p style={{ fontSize: '14px', color: theme.textSecondary }}>
              {isInCurrentPeriod() 
                ? `${daysRemaining} giorni rimanenti`
                : `Inizia ${new Date(startDate).toLocaleDateString('it-IT')}`}
            </p>
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
          Salva e continua
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
            onClick={() => setCurrentView('dashboard')}
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
            Torna alla Dashboard
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IncomeSetup;