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

// Componente Form Fullscreen Semplificato per Spese Future
const FutureExpenseFormFullscreen = ({ isOpen, onClose, onSave, editingExpense, categories, theme }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    categoryId: 1,
    description: '',
  });
  const [amountDisplay, setAmountDisplay] = useState('');
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
        setFormData({
          name: editingExpense.name,
          amount: editingExpense.amount.toString(),
          dueDate: editingExpense.dueDate,
          categoryId: editingExpense.categoryId,
          description: editingExpense.description || '',
        });
        setAmountDisplay(editingExpense.amount.toString());
      } else {
        setFormData({
          name: '',
          amount: '',
          dueDate: '',
          categoryId: 1,
          description: '',
        });
        setAmountDisplay('');
      }
    }
  }, [isOpen, editingExpense]);

  if (!isOpen) return null;

  // Calcola i giorni rimanenti
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Gestione selezione categoria
  const handleSelectCategory = (category) => {
    setFormData({ ...formData, categoryId: category.id });
  };

  // Validazione form
  const isFormValid = () => {
    return formData.name && formData.amount && formData.dueDate && 
           !isNaN(parseFloat(formData.amount)) && parseFloat(formData.amount) > 0;
  };

  // Gestione salvataggio
  const handleSave = () => {
    if (!isFormValid()) return;

    onSave({
      ...formData,
      amount: parseFloat(formData.amount), // Salviamo il valore direttamente senza moltiplicare
    });

    onClose();
  };

  const daysRemaining = calculateDaysRemaining(formData.dueDate);
  const dailyAmount = daysRemaining > 0 && formData.amount ? 
    (parseFloat(formData.amount) / daysRemaining).toFixed(2) : '0.00';

  // Filtra solo le categorie di spesa
  const expenseCategories = categories.filter(cat => cat.id <= 20);

  // Calcola il numero di colonne in base alla dimensione dello schermo
  const getGridColumns = () => {
    if (isDesktop) return 'repeat(4, 1fr)';
    if (isVerySmall) return 'repeat(2, 1fr)';
    return 'repeat(3, 1fr)';
  };

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
        zIndex: 2
      }}>
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
          {editingExpense ? 'Modifica Spesa' : 'Nuova Spesa Futura'}
        </h2>

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
      </header>

      {/* Contenuto scrollabile */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isVerySmall ? '16px 8px' : isMobile ? '20px 12px' : isDesktop ? '32px 24px' : '24px 16px',
        maxWidth: isDesktop ? '800px' : '100%',
        margin: isDesktop ? '0 auto' : '0',
        width: '100%'
      }}>
        {/* Sezione Nome e Importo */}
        <div style={{ marginBottom: '32px' }}>
          {/* Nome spesa */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: isVerySmall ? '12px' : '14px',
              fontWeight: '500',
              color: theme.textSecondary,
              marginBottom: '8px'
            }}>
              Nome della spesa
            </label>
            <div style={{
              backgroundColor: theme.card,
              borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
              padding: isVerySmall ? '12px' : isMobile ? '16px' : '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es. Bollo auto, Assicurazione"
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                  color: theme.text
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Importo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: isVerySmall ? '12px' : '14px',
              fontWeight: '500',
              color: theme.textSecondary,
              marginBottom: '8px'
            }}>
              Importo totale
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: theme.card,
              borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
              padding: isVerySmall ? '12px' : isMobile ? '16px' : '20px',
              gap: isVerySmall ? '6px' : isMobile ? '8px' : '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <span style={{
                fontSize: isVerySmall ? '20px' : isMobile ? '24px' : '28px',
                fontWeight: '700',
                color: theme.primary
              }}>
                €
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]*$/.test(value) || value === '') {
                    setAmountDisplay(value);
                    setFormData({ ...formData, amount: value });
                  }
                }}
                placeholder="0"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: isVerySmall ? '20px' : isMobile ? '24px' : '28px',
                  fontWeight: '700',
                  color: theme.text,
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Data scadenza */}
          <div>
            <label style={{
              display: 'block',
              fontSize: isVerySmall ? '12px' : '14px',
              fontWeight: '500',
              color: theme.textSecondary,
              marginBottom: '8px'
            }}>
              Data di scadenza
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

        {/* Categoria */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: isVerySmall ? '12px' : '14px',
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: '12px'
          }}>
            Categoria
          </label>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            gap: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
            width: '100%'
          }}>
            {expenseCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectCategory(category)}
                style={{
                  backgroundColor: formData.categoryId === category.id ? `${category.color}10` : theme.card,
                  borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                  padding: isVerySmall ? '12px 4px' : isMobile ? '16px 8px' : '20px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isVerySmall ? '4px' : '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  border: formData.categoryId === category.id 
                    ? `1px solid ${category.color}` 
                    : `1px solid ${theme.card}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ 
                  fontSize: isVerySmall ? '24px' : isMobile ? '28px' : '32px'
                }}>
                  {category.icon}
                </div>
                <span style={{ 
                  fontSize: isVerySmall ? '10px' : '11px', 
                  fontWeight: '500',
                  color: theme.textSecondary,
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {category.name}
                </span>
              </motion.div>
            ))}
          </div>
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
              textAlign: 'center',
              marginBottom: '32px'
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
            fontSize: isVerySmall ? '12px' : '14px',
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: '8px'
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