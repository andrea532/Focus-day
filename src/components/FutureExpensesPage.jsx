import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Calendar,
  Calculator,
  AlertCircle,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

// Componente Form Fullscreen per Spese Future (stile Dashboard)
const FutureExpenseFormFullscreen = ({ isOpen, onClose, onSave, editingExpense, categories, theme }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Seleziona categoria, 2: Inserisci dettagli
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    description: '',
  });
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
      if (editingExpense) {
        // Se stiamo modificando, precompila i dati
        setFormData({
          name: editingExpense.name,
          amount: (editingExpense.amount * 100).toString(), // Converti in centesimi
          dueDate: editingExpense.dueDate,
          description: editingExpense.description || '',
        });
        const category = categories.find(c => c.id === editingExpense.categoryId);
        setSelectedCategory(category);
        setCurrentStep(2); // Vai direttamente al secondo step
      } else {
        // Reset per nuova spesa
        setCurrentStep(1);
        setSelectedCategory(null);
        setFormData({
          name: '',
          amount: '',
          dueDate: '',
          description: '',
        });
      }
    }
  }, [isOpen, editingExpense, categories]);

  if (!isOpen) return null;

  // Formattazione importo stile bancario
  const formatAmount = (value) => {
    if (!value) return '';
    const numValue = value.replace(/[^0-9]/g, '');
    if (numValue === '') return '';
    const numericValue = parseInt(numValue, 10) / 100;
    return numericValue.toFixed(2).replace('.', ',');
  };

  // Gestione selezione categoria
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentStep(2);
  };

  // Torna al primo step
  const handleBack = () => {
    if (editingExpense) {
      onClose();
    } else {
      setCurrentStep(1);
    }
  };

  // Calcola i giorni rimanenti
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Validazione form
  const isFormValid = () => {
    return formData.name && 
           formData.amount && 
           formData.dueDate && 
           selectedCategory &&
           parseInt(formData.amount) > 0;
  };

  // Gestione salvataggio
  const handleSave = () => {
    if (!isFormValid()) return;

    const numericAmount = parseInt(formData.amount, 10) / 100;

    onSave({
      name: formData.name,
      amount: numericAmount,
      dueDate: formData.dueDate,
      categoryId: selectedCategory.id,
      description: formData.description,
    });

    onClose();
  };

  // Filtra solo le categorie di spesa
  const expenseCategories = categories.filter(cat => cat.id <= 20);

  // Calcola il numero di colonne in base alla dimensione dello schermo
  const getGridColumns = () => {
    if (isDesktop) return 'repeat(5, 1fr)';
    if (isVerySmall) return 'repeat(3, 1fr)';
    return 'repeat(4, 1fr)';
  };

  const daysRemaining = calculateDaysRemaining(formData.dueDate);
  const dailyAmount = daysRemaining > 0 && formData.amount ? 
    (parseInt(formData.amount, 10) / 100 / daysRemaining).toFixed(2) : '0.00';

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
        {currentStep === 1 && !editingExpense ? (
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
            ? 'Nuova Spesa Futura'
            : selectedCategory?.name
          }
        </h2>

        {currentStep === 2 ? (
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            style={{
              padding: isVerySmall ? '2px 4px' : isMobile ? '4px 8px' : '8px 16px',
              backgroundColor: isFormValid() ? theme.primary : theme.border,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: isFormValid() ? 'pointer' : 'not-allowed',
              opacity: isFormValid() ? 1 : 0.5,
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
              paddingBottom: isVerySmall ? '120px' : isMobile ? '150px' : '180px' // Aumentato significativamente
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
                {expenseCategories.map((category) => (
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
        
        {/* Step 2: Inserisci dettagli */}
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
              
              {/* Nome spesa */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: isVerySmall ? '6px' : isMobile ? '8px' : '12px'
                }}>
                  Nome della spesa
                </label>
                
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Bollo auto, Assicurazione"
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
                  autoFocus
                />
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
                    color: theme.primary
                  }}>
                    €
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatAmount(formData.amount)}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, amount: numericValue });
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
                  />
                </div>
              </div>

              {/* Data scadenza con stile mobile-friendly */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: isVerySmall ? '6px' : isMobile ? '8px' : '12px'
                }}>
                  Data di scadenza
                </label>
                
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.card,
                  borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                  padding: isVerySmall ? '12px' : isMobile ? '16px' : '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <Calendar 
                    size={isVerySmall ? 20 : isMobile ? 24 : 28} 
                    style={{ 
                      color: theme.primary,
                      marginRight: isVerySmall ? '8px' : '12px'
                    }} 
                  />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                      color: theme.text,
                      fontWeight: '600',
                      cursor: 'pointer',
                      // Stile per migliorare l'aspetto su mobile
                      WebkitAppearance: 'none',
                      position: 'relative',
                      zIndex: 1
                    }}
                  />
                </div>

                {/* Info giorni rimanenti */}
                {formData.dueDate && daysRemaining !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: daysRemaining <= 7 ? `${theme.warning}20` : `${theme.primary}20`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ 
                      fontSize: '14px', 
                      color: daysRemaining <= 7 ? theme.warning : theme.primary,
                      fontWeight: '500'
                    }}>
                      {daysRemaining === 0 
                        ? 'Scade oggi!' 
                        : `${daysRemaining} giorni rimanenti`
                      }
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Preview calcolo */}
              {formData.amount && formData.dueDate && daysRemaining > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: isVerySmall ? '16px' : isMobile ? '20px' : '24px',
                    borderRadius: isVerySmall ? '12px' : '16px',
                    background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.primary}05 100%)`,
                    border: `1px solid ${theme.primary}30`,
                    textAlign: 'center'
                  }}
                >
                  <p style={{ 
                    fontSize: isVerySmall ? '11px' : '12px', 
                    color: theme.textSecondary,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Dovrai accantonare
                  </p>
                  <p style={{ 
                    fontSize: isVerySmall ? '24px' : isMobile ? '28px' : '32px', 
                    fontWeight: '700',
                    color: theme.primary,
                    marginBottom: '4px'
                  }}>
                    € {dailyAmount}
                  </p>
                  <p style={{ 
                    fontSize: isVerySmall ? '12px' : '14px', 
                    color: theme.textSecondary
                  }}>
                    al giorno per {daysRemaining} giorni
                  </p>
                </motion.div>
              )}
              
              {/* Descrizione */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: isVerySmall ? '6px' : isMobile ? '8px' : '12px'
                }}>
                  Note (opzionale)
                </label>
                
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Aggiungi dettagli o promemoria..."
                  style={{
                    width: '100%',
                    padding: isVerySmall ? '12px' : isMobile ? '16px' : '20px',
                    borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                    backgroundColor: theme.card,
                    border: 'none',
                    outline: 'none',
                    fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                    color: theme.text,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    minHeight: '80px',
                    resize: 'none'
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

const FutureExpensesPage = () => {
  const {
    theme,
    futureExpenses,
    addFutureExpense,
    updateFutureExpense,
    deleteFutureExpense,
    categories,
  } = useContext(AppContext);

  const [showFormFullscreen, setShowFormFullscreen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Calcola i giorni rimanenti fino alla scadenza
  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calcola l'importo giornaliero da accantonare
  const calculateDailyAmount = (totalAmount, dueDate) => {
    const daysRemaining = calculateDaysRemaining(dueDate);
    if (daysRemaining <= 0) return 0;
    return (totalAmount / daysRemaining).toFixed(2);
  };

  // Calcola il totale giornaliero di tutte le spese future
  const getTotalDailyAmount = () => {
    return futureExpenses.reduce((total, expense) => {
      const dailyAmount = calculateDailyAmount(expense.amount, expense.dueDate);
      return total + parseFloat(dailyAmount);
    }, 0);
  };

  // Handlers
  const handleSaveExpense = (formData) => {
    const expense = {
      name: formData.name,
      amount: formData.amount,
      dueDate: formData.dueDate,
      categoryId: formData.categoryId,
      description: formData.description,
    };

    if (editingExpense) {
      updateFutureExpense(editingExpense.id, expense);
    } else {
      addFutureExpense(expense);
    }

    setEditingExpense(null);
    setShowFormFullscreen(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowFormFullscreen(true);
  };

  const handleDeleteExpense = (id) => {
    deleteFutureExpense(id);
  };

  const handleOpenForm = () => {
    setEditingExpense(null);
    setShowFormFullscreen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="future-expenses-page scrollable-page"
      style={{ paddingBottom: '100px' }}
    >
      {/* Form Fullscreen */}
      <AnimatePresence>
        {showFormFullscreen && (
          <FutureExpenseFormFullscreen
            isOpen={showFormFullscreen}
            onClose={() => {
              setShowFormFullscreen(false);
              setEditingExpense(null);
            }}
            onSave={handleSaveExpense}
            editingExpense={editingExpense}
            categories={categories}
            theme={theme}
          />
        )}
      </AnimatePresence>

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
          Spese Future
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: theme.textSecondary,
            marginTop: '4px',
          }}
        >
          Pianifica e accantona per le spese imminenti
        </p>
      </motion.div>

      {/* Riepilogo totale giornaliero */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          margin: '0 16px 24px',
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: theme.card,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.primary}30 0%, ${theme.primary}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Calculator size={40} style={{ color: theme.primary }} />
          </motion.div>

          <p
            style={{
              fontSize: '14px',
              color: theme.textSecondary,
              marginBottom: '8px',
            }}
          >
            ACCANTONAMENTO GIORNALIERO
          </p>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: theme.primary,
            }}
          >
            € {getTotalDailyAmount().toFixed(2)}
          </motion.p>
          <p
            style={{
              fontSize: '14px',
              color: theme.textSecondary,
              marginTop: '8px',
            }}
          >
            Da sottrarre dal budget giornaliero
          </p>
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <motion.div
            variants={itemVariants}
            style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: `${theme.warning}15`,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '12px', color: theme.textSecondary }}>
              SPESE PIANIFICATE
            </p>
            <p
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: theme.warning,
                marginTop: '4px',
              }}
            >
              {futureExpenses.length}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: `${theme.danger}15`,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '12px', color: theme.textSecondary }}>
              TOTALE DA PAGARE
            </p>
            <p
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: theme.danger,
                marginTop: '4px',
              }}
            >
              € {futureExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Lista spese future */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          margin: '0 16px',
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: theme.card,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div>
            <h3
              style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}
            >
              Prossime spese
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: theme.textSecondary,
                marginTop: '4px',
              }}
            >
              Gestisci le tue spese imminenti
            </p>
          </div>
        </div>

        {/* Lista delle spese */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {futureExpenses.map((expense) => {
            const daysRemaining = calculateDaysRemaining(expense.dueDate);
            const dailyAmount = calculateDailyAmount(expense.amount, expense.dueDate);
            const isUrgent = daysRemaining <= 7;
            const isOverdue = daysRemaining === 0;
            const category = categories.find(c => c.id === expense.categoryId);

            return (
              <motion.div
                key={expense.id}
                variants={itemVariants}
                layout
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: theme.background,
                  border: `1px solid ${
                    isOverdue ? theme.danger : isUrgent ? theme.warning : theme.border
                  }`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: `${category?.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {category?.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: theme.text,
                          }}
                        >
                          {expense.name}
                        </h4>
                        {isUrgent && !isOverdue && (
                          <AlertCircle
                            size={16}
                            style={{ color: theme.warning }}
                          />
                        )}
                        {isOverdue && (
                          <AlertCircle
                            size={16}
                            style={{ color: theme.danger }}
                          />
                        )}
                      </div>
                      <p
                        style={{ fontSize: '14px', color: theme.textSecondary }}
                      >
                        Scadenza: {new Date(expense.dueDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditExpense(expense)}
                      style={{
                        width: '32px',
                        height: '32px',
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
                      <Pencil size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteExpense(expense.id)}
                      style={{
                        width: '32px',
                        height: '32px',
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
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: `${theme.primary}20`,
                    marginBottom: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - (daysRemaining / 30) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: '4px',
                      backgroundColor: isOverdue
                        ? theme.danger
                        : isUrgent
                        ? theme.warning
                        : theme.primary,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                      {isOverdue
                        ? 'Scaduta!'
                        : `${daysRemaining} giorni rimanenti`}
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: theme.primary,
                      }}
                    >
                      € {dailyAmount} al giorno
                    </p>
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
                    € {expense.amount.toFixed(2)}
                  </p>
                </div>

                {expense.description && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginTop: '12px',
                      fontStyle: 'italic',
                    }}
                  >
                    {expense.description}
                  </p>
                )}
              </motion.div>
            );
          })}

          {futureExpenses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                borderRadius: '16px',
                backgroundColor: theme.background,
                color: theme.textSecondary,
              }}
            >
              <Receipt
                size={48}
                style={{ margin: '0 auto 16px', opacity: 0.5 }}
              />
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  marginBottom: '8px',
                }}
              >
                Nessuna spesa pianificata
              </p>
              <p style={{ fontSize: '14px' }}>
                Aggiungi le spese future per calcolare l'accantonamento giornaliero
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Fixed Action Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '24px',
          zIndex: 20,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenForm}
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
          }}
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FutureExpensesPage;