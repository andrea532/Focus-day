import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Calculator,
  PiggyBank,
  ArrowRight,
  ArrowLeft,
  Check,
  DollarSign,
  CalendarRange,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Plus,
  Minus,
  Trash2,
  Edit2,
  X,
  Percent,
  Target
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const OnboardingPage = ({ onComplete }) => {
  const {
    theme,
    setMonthlyIncome,
    setLastPaydayDate,
    setNextPaydayDate,
    setPaymentType: setSavedPaymentType,
    setCustomStartDate: setSavedStartDate,
    setCustomEndDate: setSavedEndDate,
    fixedExpenses,
    setFixedExpenses,
    setSavingsPercentage,
    setSavingsMode,
    setSavingsPeriod,
    setSavingsFixedAmount,
    setSavingsStartDate,
    setSavingsEndDate,
    setCurrentView,
    categories,
    addToSavings,
  } = useContext(AppContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  // Stati per Income
  const [income, setIncome] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRepeating, setIsRepeating] = useState(true);

  // Stati per Expenses
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    categoryId: 1,
    customStartDate: '',
    customEndDate: '',
    isRepeating: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [localFixedExpenses, setLocalFixedExpenses] = useState([]);

  // Stati per Savings
  const [savingsModeLocal, setSavingsModeLocal] = useState('percentage');
  const [percentage, setPercentage] = useState(20);
  const [fixedAmount, setFixedAmount] = useState('');
  const [savingsStartDateLocal, setSavingsStartDateLocal] = useState('');
  const [savingsEndDateLocal, setSavingsEndDateLocal] = useState('');
  const [savingsIsRepeating, setSavingsIsRepeating] = useState(true);

  // Calcola i giorni del periodo
  const calculatePeriodDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      count++;
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Calcola il prossimo periodo
  const calculateNextPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    
    const periodDays = calculatePeriodDays(startDate, endDate);
    const end = new Date(endDate + 'T00:00:00');
    
    const nextStart = new Date(end);
    nextStart.setDate(nextStart.getDate() + 1);
    
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextEnd.getDate() + periodDays - 1);
    
    return {
      start: nextStart.toISOString().split('T')[0],
      end: nextEnd.toISOString().split('T')[0]
    };
  };

  // Validazioni per ogni step
  const isStep1Valid = () => {
    return income && parseFloat(income) > 0 && startDate && endDate && 
           new Date(startDate) <= new Date(endDate);
  };

  const isStep2Valid = () => {
    return true; // Le spese fisse sono opzionali
  };

  const isStep3Valid = () => {
    if (!savingsStartDateLocal || !savingsEndDateLocal) return false;
    
    const savingsAmount = savingsModeLocal === 'percentage' 
      ? (parseFloat(income || 0) * percentage) / 100
      : parseFloat(fixedAmount) || 0;
    
    const totalFixedExpenses = localFixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const availableForSavings = parseFloat(income || 0) - totalFixedExpenses;
    
    return savingsAmount >= 0 && savingsAmount <= availableForSavings;
  };

  // Gestione spese fisse
  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount || parseFloat(newExpense.amount) <= 0 ||
        !newExpense.customStartDate || !newExpense.customEndDate) {
      return;
    }

    const expense = {
      id: Date.now(),
      name: newExpense.name,
      amount: parseFloat(newExpense.amount),
      categoryId: newExpense.categoryId,
      period: 'custom',
      customStartDate: newExpense.customStartDate,
      customEndDate: newExpense.customEndDate,
      isRepeating: newExpense.isRepeating
    };

    setLocalFixedExpenses([...localFixedExpenses, expense]);
    
    setNewExpense({
      name: '',
      amount: '',
      categoryId: 1,
      customStartDate: '',
      customEndDate: '',
      isRepeating: true
    });
    setShowAddForm(false);
  };

  const handleEditExpense = (expense) => {
    if (editingExpense === expense.id) {
      if (!newExpense.name || !newExpense.amount || parseFloat(newExpense.amount) <= 0 ||
          !newExpense.customStartDate || !newExpense.customEndDate) {
        return;
      }
      
      setLocalFixedExpenses(localFixedExpenses.map(e => 
        e.id === expense.id ? { 
          ...e, 
          name: newExpense.name,
          amount: parseFloat(newExpense.amount),
          categoryId: newExpense.categoryId,
          customStartDate: newExpense.customStartDate,
          customEndDate: newExpense.customEndDate,
          isRepeating: newExpense.isRepeating
        } : e
      ));
      setEditingExpense(null);
      setNewExpense({
        name: '',
        amount: '',
        categoryId: 1,
        customStartDate: '',
        customEndDate: '',
        isRepeating: true
      });
    } else {
      setEditingExpense(expense.id);
      setNewExpense({
        name: expense.name,
        amount: expense.amount.toString(),
        categoryId: expense.categoryId,
        customStartDate: expense.customStartDate || '',
        customEndDate: expense.customEndDate || '',
        isRepeating: expense.isRepeating !== undefined ? expense.isRepeating : true
      });
    }
  };

  const handleDeleteExpense = (id) => {
    setLocalFixedExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Completa l'onboarding
  const completeOnboarding = async () => {
    setIsCompleting(true);

    // Salva tutti i dati
    setMonthlyIncome(parseFloat(income));
    setSavedPaymentType('custom');
    setSavedStartDate(startDate);
    setSavedEndDate(endDate);
    setLastPaydayDate(startDate);
    setNextPaydayDate(endDate);
    localStorage.setItem('incomeRepeating', isRepeating.toString());

    // Salva le spese fisse
    setFixedExpenses(localFixedExpenses);

    // Salva le impostazioni di risparmio
    setSavingsMode(savingsModeLocal);
    setSavingsPeriod('custom');
    setSavingsStartDate(savingsStartDateLocal);
    setSavingsEndDate(savingsEndDateLocal);
    
    if (savingsModeLocal === 'percentage') {
      setSavingsPercentage(percentage);
      setSavingsFixedAmount(0);
    } else {
      setSavingsFixedAmount(parseFloat(fixedAmount));
      const percentageEquivalent = parseFloat(income) > 0 
        ? (parseFloat(fixedAmount) / parseFloat(income)) * 100
        : 0;
      setSavingsPercentage(percentageEquivalent);
    }
    
    localStorage.setItem('savingsRepeating', savingsIsRepeating.toString());

    // Aggiungi il primo risparmio se siamo nel periodo attivo
    const today = new Date();
    const savingsStart = new Date(savingsStartDateLocal);
    const savingsEnd = new Date(savingsEndDateLocal);
    
    if (today >= savingsStart && today <= savingsEnd) {
      const savingsAmount = savingsModeLocal === 'percentage' 
        ? (parseFloat(income) * percentage) / 100
        : parseFloat(fixedAmount) || 0;
      
      if (savingsAmount > 0) {
        addToSavings(savingsAmount);
      }
    }

    // Marca l'onboarding come completato
    localStorage.setItem('onboardingCompleted', 'true');

    // Anima e poi vai alla dashboard
    setTimeout(() => {
      setCurrentView('dashboard');
      if (onComplete) {
        onComplete();
      }
    }, 1000);
  };

  // Progress indicator
  const renderProgressIndicator = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '32px'
      }}>
        {[1, 2, 3].map((step) => (
          <motion.div
            key={step}
            animate={{
              width: currentStep === step ? '32px' : '8px',
              backgroundColor: currentStep >= step ? theme.primary : theme.border
            }}
            style={{
              height: '8px',
              borderRadius: '4px',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderIncomeStep();
      case 2:
        return renderExpensesStep();
      case 3:
        return renderSavingsStep();
      default:
        return null;
    }
  };

  // Step 1: Income
  const renderIncomeStep = () => {
    const periodDays = calculatePeriodDays(startDate, endDate);
    const dailyAmount = periodDays > 0 && income ? 
      (parseFloat(income) / periodDays).toFixed(2) : '0.00';

    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${theme.secondary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <Wallet size={40} style={{ color: theme.secondary }} />
          </motion.div>
          
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>
            Benvenuto!
          </h2>
          <p style={{ fontSize: '16px', color: theme.textSecondary }}>
            Iniziamo configurando le tue entrate
          </p>
        </div>

        {/* Importo */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: '8px'
          }}>
            Quanto guadagni nel periodo?
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: '16px',
            padding: '20px',
            gap: '12px',
            border: `2px solid ${income ? theme.secondary : theme.border}`,
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
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
        </div>

        {/* Periodo */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: '12px'
          }}>
            Periodo di pagamento
          </label>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.card,
                  fontSize: '16px',
                  color: theme.text,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
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
                  backgroundColor: theme.card,
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
              backgroundColor: theme.card,
              borderRadius: '12px',
              cursor: 'pointer',
              border: `1px solid ${isRepeating ? theme.primary : theme.border}`,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
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
        </div>

        {/* Preview */}
        {income && periodDays > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              padding: '20px',
              backgroundColor: `${theme.secondary}10`,
              borderRadius: '16px',
              textAlign: 'center',
              border: `1px solid ${theme.secondary}30`
            }}
          >
            <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
              Budget giornaliero base
            </p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: theme.secondary }}>
              € {dailyAmount}
            </p>
            <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
              al giorno per {periodDays} giorni
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Step 2: Expenses
  const renderExpensesStep = () => {
    const totalExpenses = localFixedExpenses.reduce((total, expense) => total + expense.amount, 0);

    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${theme.danger}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <Calculator size={40} style={{ color: theme.danger }} />
          </motion.div>
          
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>
            Spese Fisse
          </h2>
          <p style={{ fontSize: '16px', color: theme.textSecondary }}>
            Aggiungi le tue spese ricorrenti (opzionale)
          </p>
        </div>

        {/* Totale spese */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: theme.card,
          marginBottom: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
            Totale spese fisse
          </p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: theme.danger }}>
            € {totalExpenses.toFixed(2)}
          </p>
        </div>

        {/* Pulsante aggiungi */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: showAddForm ? theme.border : `linear-gradient(135deg, ${theme.danger} 0%, #FF6B6B 100%)`,
            color: showAddForm ? theme.textSecondary : 'white',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: showAddForm ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          <Plus size={20} />
          Aggiungi spesa fissa
        </motion.button>

        {/* Form di aggiunta */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ 
                overflow: 'hidden', 
                marginBottom: '24px'
              }}
            >
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: theme.card,
                border: `2px solid ${theme.danger}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    placeholder="Nome spesa"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.background,
                      fontSize: '16px',
                      color: theme.text,
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="€"
                    style={{
                      width: '100px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.background,
                      fontSize: '16px',
                      color: theme.text,
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="date"
                    value={newExpense.customStartDate}
                    onChange={(e) => setNewExpense({ ...newExpense, customStartDate: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.background,
                      fontSize: '14px',
                      color: theme.text,
                      outline: 'none'
                    }}
                  />
                  <input
                    type="date"
                    value={newExpense.customEndDate}
                    onChange={(e) => setNewExpense({ ...newExpense, customEndDate: e.target.value })}
                    min={newExpense.customStartDate}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.background,
                      fontSize: '14px',
                      color: theme.text,
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddExpense}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: theme.danger,
                      color: 'white',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddForm(false);
                      setNewExpense({
                        name: '',
                        amount: '',
                        categoryId: 1,
                        customStartDate: '',
                        customEndDate: '',
                        isRepeating: true
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: theme.background,
                      color: theme.textSecondary,
                      fontWeight: '600',
                      border: `1px solid ${theme.border}`,
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista spese */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {localFixedExpenses.map((expense) => {
            const category = categories.find(c => c.id === expense.categoryId);
            const periodDays = calculatePeriodDays(expense.customStartDate, expense.customEndDate);
            const dailyAmount = periodDays > 0 ? expense.amount / periodDays : 0;
            const isEditing = editingExpense === expense.id;

            return (
              <motion.div
                key={expense.id}
                layout
                whileHover={{ scale: 1.01 }}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={newExpense.name}
                        onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.background,
                          fontSize: '14px',
                          color: theme.text,
                          outline: 'none'
                        }}
                      />
                      <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        style={{
                          width: '80px',
                          padding: '8px',
                          borderRadius: '6px',
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.background,
                          fontSize: '14px',
                          color: theme.text,
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditExpense(expense)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: theme.secondary,
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingExpense(null);
                          setNewExpense({
                            name: '',
                            amount: '',
                            categoryId: 1,
                            customStartDate: '',
                            customEndDate: '',
                            isRepeating: true
                          });
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: theme.background,
                          color: theme.textSecondary,
                          border: `1px solid ${theme.border}`,
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: `${category?.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '20px' }}>
                          {category?.icon}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: theme.text }}>
                          {expense.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: theme.textSecondary,
                        }}>
                          € {dailyAmount.toFixed(2)}/giorno
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <p style={{ fontWeight: '700', color: theme.danger, fontSize: '18px' }}>
                        € {expense.amount.toFixed(2)}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditExpense(expense)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: `${theme.primary}15`,
                            color: theme.primary,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={14} />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteExpense(expense.id)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: `${theme.danger}15`,
                            color: theme.danger,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Step 3: Savings
  const renderSavingsStep = () => {
    const totalFixedExpenses = localFixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const availableForSavings = parseFloat(income || 0) - totalFixedExpenses;
    
    const savingsAmount = savingsModeLocal === 'percentage' 
      ? (parseFloat(income || 0) * percentage) / 100
      : parseFloat(fixedAmount) || 0;
    
    const periodDays = calculatePeriodDays(savingsStartDateLocal, savingsEndDateLocal);
    const dailySavings = periodDays > 0 ? savingsAmount / periodDays : 0;
    const remainingBudget = parseFloat(income || 0) - totalFixedExpenses - savingsAmount;

    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${theme.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <PiggyBank size={40} style={{ color: theme.primary }} />
          </motion.div>
          
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>
            Obiettivi di Risparmio
          </h2>
          <p style={{ fontSize: '16px', color: theme.textSecondary }}>
            Quanto vuoi mettere da parte?
          </p>
        </div>

        {/* Periodo di risparmio */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: '12px'
          }}>
            Periodo di risparmio
          </label>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="date"
              value={savingsStartDateLocal}
              onChange={(e) => setSavingsStartDateLocal(e.target.value)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.card,
                fontSize: '16px',
                color: theme.text,
                outline: 'none'
              }}
            />
            <input
              type="date"
              value={savingsEndDateLocal}
              onChange={(e) => setSavingsEndDateLocal(e.target.value)}
              min={savingsStartDateLocal}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.card,
                fontSize: '16px',
                color: theme.text,
                outline: 'none'
              }}
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSavingsIsRepeating(!savingsIsRepeating)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: theme.card,
              borderRadius: '12px',
              cursor: 'pointer',
              border: `1px solid ${savingsIsRepeating ? theme.primary : theme.border}`,
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={20} style={{ color: savingsIsRepeating ? theme.primary : theme.textSecondary }} />
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
                  Ripeti automaticamente
                </p>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Il periodo si ripeterà per i prossimi {periodDays || '...'} giorni
                </p>
              </div>
            </div>
            
            {savingsIsRepeating ? (
              <ToggleRight size={32} style={{ color: theme.primary }} />
            ) : (
              <ToggleLeft size={32} style={{ color: theme.textSecondary }} />
            )}
          </motion.div>
        </div>

        {/* Modalità di risparmio */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSavingsModeLocal('percentage')}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${savingsModeLocal === 'percentage' ? theme.primary : theme.border}`,
              backgroundColor: savingsModeLocal === 'percentage' ? `${theme.primary}10` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <Percent size={24} style={{ color: theme.primary, marginBottom: '8px' }} />
            <p style={{ 
              fontWeight: '600', 
              color: savingsModeLocal === 'percentage' ? theme.primary : theme.text
            }}>
              Percentuale
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
              border: `2px solid ${savingsModeLocal === 'fixed' ? theme.primary : theme.border}`,
              backgroundColor: savingsModeLocal === 'fixed' ? `${theme.primary}10` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <DollarSign size={24} style={{ color: theme.primary, marginBottom: '8px' }} />
            <p style={{ 
              fontWeight: '600', 
              color: savingsModeLocal === 'fixed' ? theme.primary : theme.text
            }}>
              Importo fisso
            </p>
          </motion.button>
        </div>

        {/* Input basato sulla modalità */}
        <AnimatePresence mode="wait">
          {savingsModeLocal === 'percentage' ? (
            <motion.div
              key="percentage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: '24px' }}
            >
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
                    color: theme.primary,
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
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, ${theme.primary} 0%, ${theme.primary} ${percentage}%, ${theme.border} ${percentage}%, ${theme.border} 100%)`,
                  outline: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer'
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="fixed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: '24px' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.card,
                borderRadius: '16px',
                padding: '16px',
                gap: '12px',
                border: `2px solid ${fixedAmount ? theme.primary : theme.border}`,
                transition: 'all 0.3s ease'
              }}>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: theme.primary
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Riepilogo */}
        {savingsStartDateLocal && savingsEndDateLocal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: theme.card,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
                Risparmio per il periodo
              </p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: theme.primary }}>
                € {savingsAmount.toFixed(2)}
              </p>
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                € {dailySavings.toFixed(2)} al giorno
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: theme.background,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
                  Budget disponibile
                </p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: theme.text }}>
                  € {availableForSavings.toFixed(2)}
                </p>
              </div>
              
              <div style={{
                padding: '12px',
                backgroundColor: theme.background,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
                  Budget rimanente
                </p>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: remainingBudget >= 0 ? theme.secondary : theme.danger
                }}>
                  € {remainingBudget.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        backgroundColor: theme.background,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animazione di completamento */}
      <AnimatePresence>
        {isCompleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                backgroundColor: theme.card,
                borderRadius: '24px',
                padding: '48px',
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1 }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: theme.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}
              >
                <Check size={40} color="white" />
              </motion.div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>
                Configurazione completata!
              </h3>
              <p style={{ fontSize: '16px', color: theme.textSecondary }}>
                Il tuo budget è pronto
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        padding: '24px 16px',
        backgroundColor: theme.card,
        borderBottom: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {renderProgressIndicator()}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {currentStep > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: theme.primary,
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={20} />
              Indietro
            </motion.button>
          )}
          
          {currentStep === 1 && <div />}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
              } else {
                completeOnboarding();
              }
            }}
            disabled={
              (currentStep === 1 && !isStep1Valid()) ||
              (currentStep === 3 && !isStep3Valid())
            }
            style={{
              padding: '12px 24px',
              backgroundColor: 
                ((currentStep === 1 && !isStep1Valid()) || 
                 (currentStep === 3 && !isStep3Valid())) 
                  ? theme.border 
                  : currentStep === 3 
                    ? theme.secondary 
                    : theme.primary,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 
                ((currentStep === 1 && !isStep1Valid()) || 
                 (currentStep === 3 && !isStep3Valid())) 
                  ? 'not-allowed' 
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: 
                ((currentStep === 1 && !isStep1Valid()) || 
                 (currentStep === 3 && !isStep3Valid())) 
                  ? 0.5 
                  : 1
            }}
          >
            {currentStep === 3 ? (
              <>
                Inizia
                <Target size={20} />
              </>
            ) : (
              <>
                Continua
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '24px 16px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OnboardingPage;