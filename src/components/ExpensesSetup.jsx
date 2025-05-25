import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Minus, 
  Plus, 
  Trash2, 
  CalendarRange,
  RefreshCw,
  Edit2,
  Check,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ExpensesSetup = () => {
  const {
    fixedExpenses,
    setFixedExpenses,
    categories,
    theme,
    setCurrentView,
  } = useContext(AppContext);

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

  // Calcola i giorni del periodo - METODO PIÙ AFFIDABILE
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

  // Verifica se siamo nel periodo di una spesa
  const isInPeriod = (expense) => {
    if (!expense.customStartDate || !expense.customEndDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(expense.customStartDate + 'T00:00:00');
    const end = new Date(expense.customEndDate + 'T00:00:00');
    
    return today >= start && today <= end;
  };

  // Calcola i giorni rimanenti per una spesa
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate + 'T00:00:00');
    
    if (today > end) return 0;
    
    let count = 0;
    const current = new Date(today);
    
    while (current <= end) {
      count++;
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Reset della modifica quando si clicca fuori
  const cancelEdit = () => {
    setEditingExpense(null);
    setNewExpense({
      name: '',
      amount: '',
      categoryId: 1,
      customStartDate: '',
      customEndDate: '',
      isRepeating: true
    });
  };

  // Auto-aggiornamento dei periodi scaduti con ripetizione
  useEffect(() => {
    const checkAndUpdateExpenses = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updatedExpenses = fixedExpenses.map(expense => {
        if (expense.isRepeating && expense.customEndDate) {
          const endDate = new Date(expense.customEndDate + 'T00:00:00');
          
          if (today > endDate) {
            const nextPeriod = calculateNextPeriod(expense.customStartDate, expense.customEndDate);
            if (nextPeriod) {
              return {
                ...expense,
                customStartDate: nextPeriod.start,
                customEndDate: nextPeriod.end
              };
            }
          }
        }
        return expense;
      });
      
      // Se ci sono stati aggiornamenti, salva
      if (JSON.stringify(updatedExpenses) !== JSON.stringify(fixedExpenses)) {
        setFixedExpenses(updatedExpenses);
      }
    };
    
    checkAndUpdateExpenses();
  }, []); // Esegui solo al mount

  // Calcola il totale delle spese fisse
  const getTotalExpenses = () => {
    return fixedExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Calcola i giorni del periodo per una spesa
  const getPeriodDays = (expense) => {
    return calculatePeriodDays(expense.customStartDate, expense.customEndDate);
  };

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

    setFixedExpenses([...fixedExpenses, expense]);
    
    // Reset del form
    cancelEdit();
    setShowAddForm(false);
  };

  const handleEditExpense = (expense) => {
    if (editingExpense === expense.id) {
      // Salva le modifiche
      if (!newExpense.name || !newExpense.amount || parseFloat(newExpense.amount) <= 0 ||
          !newExpense.customStartDate || !newExpense.customEndDate) {
        return;
      }
      
      setFixedExpenses(fixedExpenses.map(e => 
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
      cancelEdit();
    } else {
      // Prima cancella qualsiasi modifica in corso
      cancelEdit();
      // Poi inizia la nuova modifica
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
    setFixedExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const totalExpenses = getTotalExpenses();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        paddingBottom: '100px' 
      }}
    >
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
          Le tue spese fisse
        </h2>
        <p style={{
          fontSize: '16px',
          color: theme.textSecondary,
          marginTop: '8px',
        }}>
          Aggiungi le spese ricorrenti per periodi specifici
        </p>
      </motion.div>

      <div style={{ padding: '0 16px' }}>
        {/* Totale spese */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px',
            borderRadius: '20px',
            backgroundColor: theme.card,
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.danger}30 0%, ${theme.danger}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Wallet size={40} style={{ color: theme.danger }} />
          </motion.div>

          <p style={{
            fontSize: '14px',
            color: theme.textSecondary,
            marginBottom: '8px',
          }}>
            TOTALE SPESE FISSE
          </p>
          <motion.p
            key={totalExpenses}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: theme.danger,
              marginBottom: '8px'
            }}
          >
            € {totalExpenses.toFixed(2)}
          </motion.p>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            {fixedExpenses.length > 0 && 
              `${fixedExpenses.length} ${fixedExpenses.length === 1 ? 'spesa' : 'spese'} registrate`}
          </p>
        </motion.div>

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
            background: showAddForm ? theme.border : `linear-gradient(135deg, ${theme.primary} 0%, #5A85FF 100%)`,
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
              transition={{ duration: 0.3 }}
              style={{ 
                overflow: 'hidden', 
                marginBottom: '24px'
              }}
            >
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: theme.card,
                border: `2px solid ${theme.primary}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: theme.text,
                  marginBottom: '20px'
                }}>
                  Nuova spesa fissa
                </h3>

                {/* Nome spesa */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textSecondary,
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Nome spesa
                  </label>
                  <input
                    type="text"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    placeholder="Es. Affitto, Abbonamento Netflix"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.background,
                      color: theme.text,
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Importo */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textSecondary,
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Importo
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: theme.background,
                    borderRadius: '12px',
                    padding: '14px',
                    gap: '8px',
                    border: `1px solid ${theme.border}`,
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: theme.danger
                    }}>
                      €
                    </span>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.text,
                      }}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Periodo */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textSecondary,
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Periodo di pagamento
                  </label>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        fontSize: '12px',
                        color: theme.textSecondary,
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Data inizio
                      </label>
                      <input
                        type="date"
                        value={newExpense.customStartDate}
                        onChange={(e) => setNewExpense({ ...newExpense, customStartDate: e.target.value })}
                        style={{
                          width: '100%',
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
                    <div style={{ flex: 1 }}>
                      <label style={{
                        fontSize: '12px',
                        color: theme.textSecondary,
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Data fine
                      </label>
                      <input
                        type="date"
                        value={newExpense.customEndDate}
                        onChange={(e) => setNewExpense({ ...newExpense, customEndDate: e.target.value })}
                        min={newExpense.customStartDate}
                        style={{
                          width: '100%',
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
                  </div>

                  {/* Toggle ripetizione */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setNewExpense({ ...newExpense, isRepeating: !newExpense.isRepeating })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: theme.background,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `1px solid ${newExpense.isRepeating ? theme.primary : theme.border}`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={16} style={{ color: newExpense.isRepeating ? theme.primary : theme.textSecondary }} />
                      <div>
                        <p style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: theme.text 
                        }}>
                          Ripeti automaticamente
                        </p>
                        <p style={{ 
                          fontSize: '12px', 
                          color: theme.textSecondary 
                        }}>
                          Il periodo si ripeterà per i prossimi {calculatePeriodDays(newExpense.customStartDate, newExpense.customEndDate) || '...'} giorni
                        </p>
                      </div>
                    </div>
                    
                    {newExpense.isRepeating ? (
                      <ToggleRight size={24} style={{ color: theme.primary }} />
                    ) : (
                      <ToggleLeft size={24} style={{ color: theme.textSecondary }} />
                    )}
                  </motion.div>
                </div>

                {/* Categoria */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textSecondary,
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Categoria
                  </label>
                  <select
                    value={newExpense.categoryId}
                    onChange={(e) => setNewExpense({ ...newExpense, categoryId: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.background,
                      color: theme.text,
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  >
                    {categories.filter(cat => cat.id <= 20).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Anteprima calcolo per periodo */}
                {newExpense.customStartDate && newExpense.customEndDate && newExpense.amount && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: `${theme.primary}10`,
                      marginBottom: '20px',
                      border: `1px solid ${theme.primary}30`
                    }}
                  >
                    <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '4px' }}>
                      Costo giornaliero
                    </p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: theme.primary }}>
                      € {(parseFloat(newExpense.amount) / calculatePeriodDays(newExpense.customStartDate, newExpense.customEndDate)).toFixed(2)} al giorno
                    </p>
                    <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                      per {calculatePeriodDays(newExpense.customStartDate, newExpense.customEndDate)} giorni
                    </p>
                  </motion.div>
                )}

                {/* Pulsanti azione */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddExpense}
                    disabled={!newExpense.name || !newExpense.amount || !newExpense.customStartDate || !newExpense.customEndDate}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: (!newExpense.name || !newExpense.amount || !newExpense.customStartDate || !newExpense.customEndDate) 
                        ? theme.border : theme.secondary,
                      color: 'white',
                      fontWeight: '600',
                      border: 'none',
                      cursor: (!newExpense.name || !newExpense.amount || !newExpense.customStartDate || !newExpense.customEndDate) 
                        ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={18} />
                    Salva
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddForm(false);
                      cancelEdit();
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: theme.background,
                      color: theme.textSecondary,
                      fontWeight: '600',
                      border: `1px solid ${theme.border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <X size={18} />
                    Annulla
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista spese */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: theme.card,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '20px',
          }}>
            Le tue spese fisse
          </h3>

          {fixedExpenses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fixedExpenses.map((expense) => {
                const category = categories.find(c => c.id === expense.categoryId);
                const periodDays = getPeriodDays(expense);
                const dailyAmount = periodDays > 0 ? expense.amount / periodDays : 0;
                const isActive = isInPeriod(expense);
                const daysRemaining = getDaysRemaining(expense.customEndDate);
                const isEditing = editingExpense === expense.id;
                const nextPeriod = expense.isRepeating ? calculateNextPeriod(expense.customStartDate, expense.customEndDate) : null;

                return (
                  <motion.div
                    key={expense.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      backgroundColor: theme.background,
                      border: `1px solid ${isActive ? theme.primary : theme.border}`,
                      position: 'relative',
                      opacity: !isActive && !expense.isRepeating ? 0.6 : 1,
                    }}
                  >
                    {isEditing ? (
                      // Modalità di modifica
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={newExpense.name}
                              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                              placeholder="Nome spesa"
                              style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${theme.border}`,
                                backgroundColor: theme.card,
                                fontSize: '16px',
                                color: theme.text,
                                outline: 'none'
                              }}
                            />
                            <input
                              type="number"
                              value={newExpense.amount}
                              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                              placeholder="0.00"
                              style={{
                                width: '120px',
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${theme.border}`,
                                backgroundColor: theme.card,
                                fontSize: '16px',
                                color: theme.text,
                                outline: 'none'
                              }}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="date"
                              value={newExpense.customStartDate}
                              onChange={(e) => setNewExpense({ ...newExpense, customStartDate: e.target.value })}
                              style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${theme.border}`,
                                backgroundColor: theme.card,
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
                                backgroundColor: theme.card,
                                fontSize: '14px',
                                color: theme.text,
                                outline: 'none'
                              }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                              value={newExpense.categoryId}
                              onChange={(e) => setNewExpense({ ...newExpense, categoryId: parseInt(e.target.value) })}
                              style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${theme.border}`,
                                backgroundColor: theme.card,
                                fontSize: '14px',
                                color: theme.text,
                                outline: 'none'
                              }}
                            >
                              {categories.filter(cat => cat.id <= 20).map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.icon} {category.name}
                                </option>
                              ))}
                            </select>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditExpense(expense)}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                backgroundColor: theme.secondary,
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Check size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => cancelEdit()}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                backgroundColor: theme.background,
                                color: theme.textSecondary,
                                border: `1px solid ${theme.border}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Visualizzazione normale
                      <>
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
                              width: '48px',
                              height: '48px',
                              borderRadius: '16px',
                              backgroundColor: `${category?.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <span style={{ fontSize: '24px' }}>
                                {category?.icon}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', color: theme.text }}>
                                {expense.name}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: theme.textSecondary,
                              }}>
                                {category?.name} • {new Date(expense.customStartDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {new Date(expense.customEndDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontWeight: '700', color: theme.danger, fontSize: '18px' }}>
                                € {expense.amount.toFixed(2)}
                              </p>
                              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                                € {dailyAmount.toFixed(2)}/giorno
                              </p>
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
                                <Edit2 size={16} />
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
                        </div>

                        {/* Stato del periodo */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? `${theme.secondary}10` : `${theme.warning}10`,
                            border: `1px solid ${isActive ? theme.secondary : theme.warning}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarRange size={14} style={{ color: isActive ? theme.secondary : theme.warning }} />
                            <span style={{ fontSize: '12px', color: isActive ? theme.secondary : theme.warning, fontWeight: '500' }}>
                              {isActive ? `Periodo attivo • ${daysRemaining} giorni rimanenti` : 'Periodo terminato'}
                            </span>
                          </div>
                          
                          {expense.isRepeating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <RefreshCw size={12} style={{ color: theme.primary }} />
                              <span style={{ fontSize: '11px', color: theme.primary }}>
                                Ripete automaticamente
                              </span>
                            </div>
                          )}
                        </motion.div>

                        {/* Prossimo periodo se ripetizione attiva */}
                        {expense.isRepeating && nextPeriod && (
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            backgroundColor: `${theme.primary}05`,
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: theme.textSecondary
                          }}>
                            Prossimo periodo: {new Date(nextPeriod.start).toLocaleDateString('it-IT')} - {new Date(nextPeriod.end).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
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
              <Wallet
                size={48}
                style={{ margin: '0 auto 16px', opacity: 0.5 }}
              />
              <p style={{
                fontSize: '18px',
                fontWeight: '500',
                marginBottom: '8px',
              }}>
                Nessuna spesa fissa
              </p>
              <p style={{ fontSize: '14px' }}>
                Aggiungi le tue spese ricorrenti
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Pulsante continua */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('savings')}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${theme.primary} 0%, #5A85FF 100%)`,
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Continua
          <TrendingUp size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExpensesSetup;