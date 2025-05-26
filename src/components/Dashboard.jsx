import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Calendar, PiggyBank, ArrowLeft, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import SavingsOverlay from './SavingsOverlay';

// Componente per visualizzare il budget giornaliero in modo molto semplice
const BudgetIndicator = ({ day, amount }) => {
  const { theme } = useContext(AppContext);
  const isPositive = amount >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <span style={{ fontWeight: '500', color: theme.textSecondary, fontSize: '14px' }}>{day}</span>
      <span style={{ 
        fontWeight: '700', 
        fontSize: '20px',
        color: isPositive ? theme.secondary : theme.danger 
      }}>
        € {Math.abs(amount).toFixed(2)}
      </span>
    </motion.div>
  );
};

// Componente per il form a schermo intero
const TransactionFormFullscreen = ({ isOpen, onClose, initialType, onSave }) => {
  const { theme, categories } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(1); // 1: Seleziona categoria, 2: Inserisci dettagli
  const [transactionType, setTransactionType] = useState(initialType || 'expense');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Controlla la dimensione dello schermo
  useEffect(() => {
    const checkScreenSize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Determinare il layout in base alla dimensione dello schermo
  const isDesktop = screenWidth > 768;
  const isMobile = screenWidth <= 480;
  const isVerySmall = screenWidth <= 360;

  // Reset del form quando si apre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedCategory(null);
      setAmount('');
      setDescription('');
      setTransactionType(initialType || 'expense');
    }
  }, [isOpen, initialType]);

  // Se non è aperto, non renderizziamo nulla
  if (!isOpen) return null;
  
  // Formattazione stile bancario - numeri inseriti da destra e decimali automatici
  const formatAmount = (value) => {
    if (!value) return '';
    
    // Rimuovi tutti i caratteri non numerici
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Converti in centesimi (sempre con 2 decimali)
    const cents = parseInt(numericValue, 10);
    
    // Converti in formato euro con virgola
    const euros = (cents / 100).toFixed(2).replace('.', ',');
    
    // Aggiungi separatore delle migliaia
    return euros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Gestione categoria selezionata
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentStep(2); // Passa al secondo step
  };
  
  // Torna al primo step
  const handleBack = () => {
    setCurrentStep(1);
  };
  
  // Gestione salvataggio - Per stile bancario
  const handleSave = () => {
    if (!amount) return;
    
    // Converti i centesimi in euro
    const numericAmount = parseInt(amount, 10) / 100;
    
    // Chiamare la funzione onSave passata come prop
    onSave({
      type: transactionType,
      categoryId: selectedCategory.id,
      amount: numericAmount,
      description: description || ''
    });

    // Chiudi il form
    onClose();
  };

  // Filtro le categorie in base al tipo di transazione
  const filteredCategories = categories.filter(cat => 
    transactionType === 'expense' ? cat.id <= 20 : cat.id >= 21
  );

  // Calcola il numero di colonne in base alla dimensione dello schermo
  const getGridColumns = () => {
    if (isDesktop) return 'repeat(5, 1fr)';
    if (isVerySmall) return 'repeat(3, 1fr)';
    return 'repeat(4, 1fr)';
  };

  // Gestiamo anche l'input per prevenire divisioni automatiche
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.background,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      maxWidth: isDesktop ? '100%' : '428px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{ 
        padding: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.card,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        flexShrink: 0
      }}>
        {currentStep === 1 ? (
          <button
            onClick={onClose}
            style={{
              padding: isVerySmall ? '2px 4px' : isMobile ? '4px 8px' : '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: theme.textSecondary,
              fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Annulla
          </button>
        ) : (
          <button
            onClick={handleBack}
            style={{
              padding: isVerySmall ? '2px 4px' : isMobile ? '4px 8px' : '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: theme.primary,
              fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: isVerySmall ? '2px' : '4px'
            }}
          >
            <ArrowLeft size={isVerySmall ? 14 : isMobile ? 16 : 18} />
            {!isVerySmall && "Indietro"}
          </button>
        )}

        <h2 style={{
          fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
          fontWeight: '600',
          color: theme.text,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isVerySmall ? '150px' : isMobile ? '200px' : '300px'
        }}>
          {currentStep === 1 
            ? (transactionType === 'expense' ? 'Nuova Spesa' : 'Nuova Entrata')
            : selectedCategory?.name
          }
        </h2>

        {currentStep === 2 ? (
          <button
            onClick={handleSave}
            disabled={!amount}
            style={{
              padding: isVerySmall ? '2px 4px' : isMobile ? '4px 8px' : '8px 16px',
              backgroundColor: amount 
                ? (transactionType === 'expense' ? theme.danger : theme.secondary)
                : theme.border,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: amount ? 'pointer' : 'not-allowed',
              opacity: amount ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: isVerySmall ? '2px' : '4px'
            }}
          >
            <Check size={isVerySmall ? 14 : isMobile ? 16 : 18} />
            Salva
          </button>
        ) : (
          <div style={{ width: isVerySmall ? '50px' : isMobile ? '60px' : '80px' }} />
        )}
      </header>

      {/* Tipo di transazione (solo nel primo step) */}
      {currentStep === 1 && (
        <div style={{
          display: 'flex',
          padding: isVerySmall ? '6px 8px' : isMobile ? '8px 12px' : '12px 16px',
          backgroundColor: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: theme.background,
            borderRadius: '8px',
            padding: '4px',
            width: '100%'
          }}>
            <button
              onClick={() => setTransactionType('expense')}
              style={{
                flex: 1,
                padding: isVerySmall ? '6px 2px' : isMobile ? '8px 4px' : '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: transactionType === 'expense' ? theme.card : 'transparent',
                color: transactionType === 'expense' ? theme.danger : theme.textSecondary,
                fontWeight: '600',
                fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isVerySmall ? '2px' : isMobile ? '4px' : '8px'
              }}
            >
              <Minus size={isVerySmall ? 14 : isMobile ? 16 : 18} />
              Spesa
            </button>
            <button
              onClick={() => setTransactionType('income')}
              style={{
                flex: 1,
                padding: isVerySmall ? '6px 2px' : isMobile ? '8px 4px' : '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: transactionType === 'income' ? theme.card : 'transparent',
                color: transactionType === 'income' ? theme.secondary : theme.textSecondary,
                fontWeight: '600',
                fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isVerySmall ? '2px' : isMobile ? '4px' : '8px'
              }}
            >
              <Plus size={isVerySmall ? 14 : isMobile ? 16 : 18} />
              Entrata
            </button>
          </div>
        </div>
      )}

      {/* Contenuto dinamico in base allo step */}
      <AnimatePresence mode="wait">
        {/* Step 1: Seleziona categoria */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              position: 'relative'
            }}
          >
            <div style={{
              padding: isVerySmall ? '8px 6px' : isMobile ? '12px 10px' : '16px 14px',
              paddingBottom: isVerySmall ? '40px' : isMobile ? '60px' : '80px'
            }}>
              <h3 style={{ 
                fontSize: isVerySmall ? '13px' : isMobile ? '15px' : '17px', 
                fontWeight: '600', 
                color: theme.text,
                marginBottom: isVerySmall ? '6px' : isMobile ? '10px' : '16px' 
              }}>
                Seleziona una categoria
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: getGridColumns(),
                gap: isVerySmall ? '4px' : isMobile ? '6px' : isDesktop ? '14px' : '10px',
                width: '100%'
              }}>
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectCategory(category)}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: isVerySmall ? '6px' : isMobile ? '8px' : '12px',
                      padding: isVerySmall ? '6px 2px' : isMobile ? '8px 3px' : '12px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: isVerySmall ? '2px' : isMobile ? '4px' : '6px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                      border: `1px solid ${theme.border}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ 
                      fontSize: isVerySmall ? '16px' : isMobile ? '20px' : '24px',
                      width: isVerySmall ? '22px' : isMobile ? '28px' : '36px',
                      height: isVerySmall ? '22px' : isMobile ? '28px' : '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${category.color}15`,
                      borderRadius: '50%'
                    }}>
                      {category.icon}
                    </div>
                    <span style={{ 
                      fontSize: isVerySmall ? '9px' : isMobile ? '10px' : '12px', 
                      fontWeight: '500',
                      color: theme.text,
                      textAlign: 'center',
                      lineHeight: '1.1',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {category.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Step 2: Inserisci importo e descrizione */}
        {currentStep === 2 && selectedCategory && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div style={{
              padding: isVerySmall ? '12px 8px' : isMobile ? '16px 12px' : isDesktop ? '32px 24px' : '24px 16px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: isVerySmall ? '16px' : isMobile ? '24px' : '32px',
              maxWidth: isDesktop ? '800px' : '100%',
              margin: isDesktop ? '0 auto' : '0',
              width: '100%'
            }}>
              {/* Categoria selezionata */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                padding: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                backgroundColor: `${selectedCategory.color}10`,
                borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                border: `1px solid ${selectedCategory.color}30`
              }}>
                <div style={{
                  fontSize: isVerySmall ? '20px' : isMobile ? '28px' : '36px',
                  width: isVerySmall ? '36px' : isMobile ? '48px' : '64px',
                  height: isVerySmall ? '36px' : isMobile ? '48px' : '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${selectedCategory.color}20`,
                  borderRadius: '50%'
                }}>
                  {selectedCategory.icon}
                </div>
                <div>
                  <p style={{ 
                    fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px', 
                    color: theme.textSecondary 
                  }}>
                    Categoria selezionata
                  </p>
                  <p style={{ 
                    fontSize: isVerySmall ? '16px' : isMobile ? '18px' : '20px', 
                    fontWeight: '600',
                    color: theme.text
                  }}>
                    {selectedCategory.name}
                  </p>
                </div>
              </div>
              
              {/* Importo */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: isVerySmall ? '6px' : isMobile ? '8px' : '12px'
                }}>
                  Importo
                </label>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.card,
                  borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                  padding: isVerySmall ? '12px 8px' : isMobile ? '16px 12px' : '24px 20px',
                  gap: isVerySmall ? '6px' : isMobile ? '8px' : '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <span style={{
                    fontSize: isVerySmall ? '28px' : isMobile ? '32px' : '40px',
                    fontWeight: '700',
                    color: transactionType === 'expense' ? theme.danger : theme.secondary
                  }}>
                    €
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatAmount(amount)}
                    onChange={(e) => {
                      // Estrai solo i numeri e gestisci l'input come centesimi
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      setAmount(numericValue);
                    }}
                    placeholder="0,00"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: isVerySmall ? '28px' : isMobile ? '32px' : '40px',
                      fontWeight: '700',
                      color: theme.text,
                      width: '100%'
                    }}
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Descrizione */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: isVerySmall ? '6px' : isMobile ? '8px' : '12px'
                }}>
                  Descrizione
                </label>
                
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={transactionType === 'expense' ? "Cosa hai comprato?" : "Da dove arriva?"}
                  style={{
                    width: '100%',
                    padding: isVerySmall ? '12px' : isMobile ? '16px' : '20px',
                    borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                    backgroundColor: theme.card,
                    border: 'none',
                    outline: 'none',
                    fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                    color: theme.text,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = () => {
  const { 
    theme, 
    categories, 
    calculateDailyBudget, 
    getBudgetSurplus,
    addTransaction,
    getDaysUntilPayday,
    nextPaydayDate,
    getMonthlyAvailability,
    streak,
    transactions,
    monthlyIncome,
    fixedExpenses,
    savingsPercentage,
    paymentType,
    customStartDate,
    customEndDate,
  } = useContext(AppContext);

  // Stati per il budget e animazioni
  const dailyBudget = calculateDailyBudget();
  const [budgetSurplus, setBudgetSurplus] = useState(getBudgetSurplus());
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  
  // Stato per l'animazione delle transazioni
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showTransactionEffect, setShowTransactionEffect] = useState(false);
  const [showSavingsOverlay, setShowSavingsOverlay] = useState(false);
  
  // Stato per il form di transazione
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Aggiungi un useEffect per controllare il cambio di data e aggiornare il budget
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date().toDateString();
      if (now !== currentDate) {
        // La data è cambiata, aggiorna il budget
        setCurrentDate(now);
        setBudgetSurplus(getBudgetSurplus());
      }
    };

    // Controlla ogni minuto se la data è cambiata
    const interval = setInterval(checkDateChange, 60000);

    // Controlla anche al focus della finestra
    const handleFocus = () => {
      checkDateChange();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentDate, getBudgetSurplus]);

  // Aggiorna il budget quando cambiano le dipendenze principali
  useEffect(() => {
    setBudgetSurplus(getBudgetSurplus());
  }, [
    transactions, 
    calculateDailyBudget, 
    monthlyIncome, 
    fixedExpenses, 
    savingsPercentage,
    customStartDate,
    customEndDate,
    paymentType
  ]);

  // Impedisci lo scorrimento quando la pagina è attiva
  useEffect(() => {
    // Salva lo stile originale per ripristinarlo in seguito
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Funzione per prevenire lo scorrimento
    const preventDefault = (e) => {
      e.preventDefault();
    };
    
    // Applica stile per impedire lo scorrimento
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Aggiungi listener per prevenire eventi di scorrimento
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    // Cleanup quando il componente viene smontato
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.removeEventListener('wheel', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);
  
  // Calcolo budget per i prossimi giorni
  const tomorrowBudget = dailyBudget + budgetSurplus;
  const afterTomorrowBudget = tomorrowBudget + dailyBudget;

  // Dati per gli indicatori
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);

  const budgetData = [
    {
      day: 'Oggi',
      amount: budgetSurplus,
    },
    {
      day: tomorrow.toLocaleDateString('it-IT', { weekday: 'short' }).charAt(0).toUpperCase() + 
           tomorrow.toLocaleDateString('it-IT', { weekday: 'short' }).slice(1),
      amount: tomorrowBudget,
    },
    {
      day: afterTomorrow.toLocaleDateString('it-IT', { weekday: 'short' }).charAt(0).toUpperCase() + 
           afterTomorrow.toLocaleDateString('it-IT', { weekday: 'short' }).slice(1),
      amount: afterTomorrowBudget,
    }
  ];

  // Calcolo saldo mensile
  const calculateMonthlyBalance = () => {
    const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const savingsAmount = (monthlyIncome * savingsPercentage) / 100;
    
    // Se abbiamo un periodo personalizzato, calcola in base a quello
    const isRepeating = localStorage.getItem('incomeRepeating') === 'true';
    
    if (paymentType === 'custom' && customStartDate && customEndDate) {
      const today = new Date();
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      
      // Calcola il periodo corrente se c'è ripetizione
      let currentPeriodStart = start;
      let currentPeriodEnd = end;
      
      if (isRepeating && today > end) {
        const periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const daysPassed = Math.ceil((today - end) / (1000 * 60 * 60 * 24));
        const periodsToAdd = Math.ceil(daysPassed / periodDays);
        
        currentPeriodStart = new Date(start);
        currentPeriodStart.setDate(currentPeriodStart.getDate() + (periodDays * periodsToAdd));
        currentPeriodEnd = new Date(end);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (periodDays * periodsToAdd));
      }
      
      // Filtra le transazioni del periodo corrente
      const periodExpenses = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && 
                 tDate >= currentPeriodStart && 
                 tDate <= currentPeriodEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const periodIncome = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'income' && 
                 tDate >= currentPeriodStart && 
                 tDate <= currentPeriodEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return monthlyIncome + periodIncome - totalFixedExpenses - savingsAmount - periodExpenses;
    }
    
    // Comportamento normale per periodi mensili
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === currentMonth && 
               tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome_ = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'income' && 
               tDate.getMonth() === currentMonth && 
               tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return monthlyIncome + monthlyIncome_ - totalFixedExpenses - savingsAmount - monthlyExpenses;
  };

  const monthlyBalance = calculateMonthlyBalance();
  const daysUntilPayday = getDaysUntilPayday();

  // Gestione transazioni
  const handleAddTransaction = (transaction) => {
    // Crea la transazione da aggiungere
    const finalTransaction = {
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      description: transaction.description || '',
      date: new Date().toISOString().split('T')[0],
      type: transaction.type
    };
    
    // Aggiorna il budget surplus in base alla transazione
    const updatedBudget = transaction.type === 'expense' 
      ? budgetSurplus - transaction.amount 
      : budgetSurplus + transaction.amount;
    
    // Salva la transazione corrente per l'animazione
    setLastTransaction({
      amount: transaction.amount,
      type: transaction.type,
      category: categories.find(c => c.id === transaction.categoryId)
    });
    
    // Mostra l'effetto della transazione
    setShowTransactionEffect(true);
    
    // Aggiorna il budget dopo un breve ritardo
    setTimeout(() => {
      // Aggiungi la transazione effettiva
      addTransaction(finalTransaction);
      
      // Aggiorna il budget nella UI
      setBudgetSurplus(updatedBudget);
      
      // Nascondi l'effetto dopo l'aggiornamento
      setTimeout(() => {
        setShowTransactionEffect(false);
      }, 1500);
    }, 300);

    // Chiudi il form
    setShowTransactionForm(false);
    setShowQuickActions(false);
  };

  // Gestione del click sul pulsante per aprire il form
  const handleOpenForm = (type) => {
    setTransactionType(type);
    setShowTransactionForm(true);
    setShowQuickActions(false);
  };

  return (
    <motion.div 
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        padding: '16px 16px 80px 16px',
        backgroundColor: theme.background,
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Savings Overlay */}
      <SavingsOverlay isOpen={showSavingsOverlay} onClose={() => setShowSavingsOverlay(false)} />
      
      {/* Form a schermo intero */}
      <AnimatePresence>
        {showTransactionForm && (
          <TransactionFormFullscreen 
            isOpen={showTransactionForm}
            onClose={() => setShowTransactionForm(false)}
            initialType={transactionType}
            onSave={handleAddTransaction}
          />
        )}
      </AnimatePresence>
      
      {/* Header con stipendio e saldo mensile */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: theme.primary }} />
          <span style={{ fontSize: '14px', color: theme.textSecondary }}>
            {paymentType === 'custom' ? 'Fine periodo' : 'Stipendio'} tra {daysUntilPayday} giorni
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '14px', color: theme.textSecondary }}>
              Saldo {paymentType === 'custom' ? 'periodo' : 'mensile'}
            </span>
            <p style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: monthlyBalance >= 0 ? theme.secondary : theme.danger 
            }}>
              € {monthlyBalance.toFixed(2)}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSavingsOverlay(true)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: theme.primary,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <PiggyBank size={20} color="white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Saldo di oggi (grande) - senza bordi, posizionato più in basso */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          textAlign: 'center',
          marginTop: '100px',
          marginBottom: '36px',
          position: 'relative'
        }}
      >
        <p style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: theme.textSecondary,
          marginBottom: '8px'
        }}>
          Budget di Oggi
        </p>
        
        <div style={{ 
          fontSize: '48px',
          fontWeight: '700',
          color: budgetSurplus >= 0 ? theme.secondary : theme.danger,
          marginBottom: '8px',
          position: 'relative'
        }}>
          {budgetSurplus >= 0 ? '' : '-'}€ {Math.abs(budgetSurplus).toFixed(2)}
          
          {/* Animazione di transazione */}
          <AnimatePresence>
            {showTransactionEffect && lastTransaction && (
              <motion.div
                initial={{ 
                  opacity: 0, 
                  y: lastTransaction.type === 'expense' ? -30 : 30,
                  scale: 0.5 
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1 
                }}
                exit={{ 
                  opacity: 0,
                  y: lastTransaction.type === 'expense' ? 30 : -30,
                  scale: 0.5 
                }}
                transition={{ 
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200 
                }}
                style={{
                  position: 'absolute',
                  top: lastTransaction.type === 'expense' ? '100%' : '-30%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: lastTransaction.type === 'expense' ? `${theme.danger}20` : `${theme.secondary}20`,
                  color: lastTransaction.type === 'expense' ? theme.danger : theme.secondary,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                {lastTransaction.type === 'expense' ? <Minus size={16} /> : <Plus size={16} />}
                € {lastTransaction.amount.toFixed(2)}
                {lastTransaction.category && (
                  <span style={{ fontSize: '16px' }}>{lastTransaction.category.icon}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Budget Indicators - in orizzontale senza bordi, posizionati in basso */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          bottom: '280px',
          left: '16px',
          right: '16px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
        }}>
          {budgetData.map((budget) => (
            <BudgetIndicator
              key={budget.day}
              day={budget.day}
              amount={budget.amount}
            />
          ))}
        </div>
      </motion.div>

      {/* Fixed Action Button - pulsante + che apre altri due pulsanti a sinistra */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '24px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '16px'
        }}
      >
        <AnimatePresence>
          {showQuickActions && (
            <>
              {/* Pulsante per Spesa (-) */}
              <motion.button
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOpenForm('expense')}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: theme.danger,
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 82, 82, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <Minus size={22} />
              </motion.button>
              
              {/* Pulsante per Entrata (+) */}
              <motion.button
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOpenForm('income')}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: theme.secondary,
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={22} />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Pulsante principale */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowQuickActions(!showQuickActions)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: theme.primary,
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(76, 111, 255, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            transform: showQuickActions ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;