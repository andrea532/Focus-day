import React, { useState, createContext, useEffect } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Stati principali
  const [currentView, setCurrentView] = useState('dashboard');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [lastPaydayDate, setLastPaydayDate] = useState('');
  const [nextPaydayDate, setNextPaydayDate] = useState('');
  const [paymentType, setPaymentType] = useState('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState([]);
  
  // STATI AGGIORNATI PER RISPARMI - SOLO PERIODI CUSTOM
  const [savingsMode, setSavingsMode] = useState('percentage'); // percentage o fixed
  const [savingsPeriod, setSavingsPeriod] = useState('custom'); // SEMPRE custom ora
  const [savingsPercentage, setSavingsPercentage] = useState(10);
  const [savingsFixedAmount, setSavingsFixedAmount] = useState(0);
  const [savingsStartDate, setSavingsStartDate] = useState('');
  const [savingsEndDate, setSavingsEndDate] = useState('');
  
  const [transactions, setTransactions] = useState([]);
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [categories] = useState([
    // Categorie Spese (1-20)
    { id: 1, name: 'Cibo e Bevande', color: '#FF5252', icon: '🍕' },
    { id: 2, name: 'Trasporti', color: '#448AFF', icon: '🚌' },
    { id: 3, name: 'Divertimento', color: '#7C4DFF', icon: '🎬' },
    { id: 4, name: 'Shopping', color: '#FF4081', icon: '🛍️' },
    { id: 5, name: 'Casa', color: '#4CAF50', icon: '🏠' },
    { id: 6, name: 'Salute', color: '#E91E63', icon: '💊' },
    { id: 7, name: 'Istruzione', color: '#3F51B5', icon: '📚' },
    { id: 8, name: 'Abbigliamento', color: '#9C27B0', icon: '👗' },
    { id: 9, name: 'Sport', color: '#FF9800', icon: '⚽' },
    { id: 10, name: 'Viaggi', color: '#00BCD4', icon: '✈️' },
    { id: 11, name: 'Tecnologia', color: '#795548', icon: '💻' },
    { id: 12, name: 'Libri', color: '#607D8B', icon: '📖' },
    { id: 13, name: 'Animali', color: '#8BC34A', icon: '🐾' },
    { id: 14, name: 'Bellezza', color: '#FFC107', icon: '💄' },
    { id: 15, name: 'Caffè', color: '#6F4E37', icon: '☕' },
    { id: 16, name: 'Alcol', color: '#B71C1C', icon: '🍷' },
    { id: 17, name: 'Sigarette', color: '#757575', icon: '🚬' },
    { id: 18, name: 'Hobby', color: '#FF6F00', icon: '🎨' },
    { id: 19, name: 'Musica', color: '#1B5E20', icon: '🎵' },
    { id: 20, name: 'Altro', color: '#546E7A', icon: '📦' },
    
    // Categorie Entrate (21-30)
    { id: 21, name: 'Stipendio', color: '#2ECC71', icon: '💰' },
    { id: 22, name: 'Bonus', color: '#9C27B0', icon: '🎯' },
    { id: 23, name: 'Regalo', color: '#00BCD4', icon: '🎁' },
    { id: 24, name: 'Vendita', color: '#FFA726', icon: '🏷️' },
    { id: 25, name: 'Investimenti', color: '#5C6BC0', icon: '📈' },
    { id: 26, name: 'Freelance', color: '#26A69A', icon: '💼' },
    { id: 27, name: 'Affitto', color: '#8D6E63', icon: '🏘️' },
    { id: 28, name: 'Dividendi', color: '#66BB6A', icon: '💵' },
    { id: 29, name: 'Rimborso', color: '#42A5F5', icon: '♻️' },
    { id: 30, name: 'Altro Entrata', color: '#78909C', icon: '➕' }
  ]);
  const [futureExpenses, setFutureExpenses] = useState([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    darkMode: false,
    currency: 'EUR',
    language: 'it'
  });

  // Tema
  const theme = {
    primary: '#4C6FFF',
    secondary: '#2ECC71',
    danger: '#FF5252',
    warning: '#FFB74D',
    background: userSettings.darkMode ? '#1A1B21' : '#F8FAFF',
    card: userSettings.darkMode ? '#25262E' : '#FFFFFF',
    text: userSettings.darkMode ? '#FFFFFF' : '#1A2151',
    textSecondary: userSettings.darkMode ? '#A0A3BD' : '#757F8C',
    border: userSettings.darkMode ? '#3A3B43' : '#E3E8F1',
  };

  // Calcola il totale giornaliero delle spese future da sottrarre
  const getDailyFutureExpenses = () => {
    const today = new Date();
    return futureExpenses.reduce((total, expense) => {
      const dueDate = new Date(expense.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        const dailyAmount = expense.amount / diffDays;
        return total + dailyAmount;
      }
      return total;
    }, 0);
  };

  // Funzione per calcolare i giorni nel periodo di pagamento - METODO AFFIDABILE
  const getDaysInPaymentPeriod = () => {
    if (paymentType === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate + 'T00:00:00');
      const end = new Date(customEndDate + 'T00:00:00');
      
      let count = 0;
      const current = new Date(start);
      
      while (current <= end) {
        count++;
        current.setDate(current.getDate() + 1);
      }
      
      return count;
    } else {
      return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    }
  };

  // FUNZIONE AGGIORNATA: Calcola i giorni nel periodo di risparmio (sempre custom)
  const getDaysInSavingsPeriod = () => {
    if (savingsStartDate && savingsEndDate) {
      const start = new Date(savingsStartDate + 'T00:00:00');
      const end = new Date(savingsEndDate + 'T00:00:00');
      
      let count = 0;
      const current = new Date(start);
      
      while (current <= end) {
        count++;
        current.setDate(current.getDate() + 1);
      }
      
      return count;
    }
    return 0;
  };

  // FUNZIONE AGGIORNATA: Calcola l'importo del risparmio per il periodo
  const getMonthlySavingsAmount = () => {
    const periodDays = getDaysInSavingsPeriod();
    if (periodDays === 0) return 0;
    
    if (savingsMode === 'percentage') {
      return (monthlyIncome * savingsPercentage) / 100;
    } else {
      return savingsFixedAmount;
    }
  };

  // FUNZIONE AGGIORNATA: Calcola il risparmio giornaliero
  const getDailySavingsAmount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (savingsStartDate && savingsEndDate) {
      const start = new Date(savingsStartDate + 'T00:00:00');
      const end = new Date(savingsEndDate + 'T00:00:00');
      
      // Verifica se siamo nel periodo di risparmio
      if (today >= start && today <= end) {
        const daysInPeriod = getDaysInSavingsPeriod();
        const totalSavings = getMonthlySavingsAmount();
        return daysInPeriod > 0 ? totalSavings / daysInPeriod : 0;
      }
    }
    return 0; // Fuori dal periodo di risparmio
  };

  // FUNZIONE AGGIORNATA: Calcola il budget giornaliero
  const calculateDailyBudget = () => {
    // Gestione automatica ripetizione periodo
    const checkAndUpdatePeriod = () => {
      const isRepeating = localStorage.getItem('incomeRepeating') === 'true';
      
      if (isRepeating && paymentType === 'custom' && customStartDate && customEndDate) {
        const today = new Date();
        const endDate = new Date(customEndDate);
        
        if (today > endDate) {
          const start = new Date(customStartDate + 'T00:00:00');
          const end = new Date(customEndDate + 'T00:00:00');
          
          let periodDays = 0;
          const tempCurrent = new Date(start);
          while (tempCurrent <= end) {
            periodDays++;
            tempCurrent.setDate(tempCurrent.getDate() + 1);
          }
          
          const newStart = new Date(endDate);
          newStart.setDate(newStart.getDate() + 1);
          const newEnd = new Date(newStart);
          newEnd.setDate(newEnd.getDate() + periodDays - 1);
          
          setCustomStartDate(newStart.toISOString().split('T')[0]);
          setCustomEndDate(newEnd.toISOString().split('T')[0]);
          setLastPaydayDate(newStart.toISOString().split('T')[0]);
          setNextPaydayDate(newEnd.toISOString().split('T')[0]);
        }
      }
    };
    
    checkAndUpdatePeriod();
    
    // Calcola le spese fisse giornaliere considerando i periodi personalizzati
    const getDailyFixedExpenses = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return fixedExpenses.reduce((total, expense) => {
        // Ora tutte le spese hanno periodo custom
        if (expense.customStartDate && expense.customEndDate) {
          const start = new Date(expense.customStartDate + 'T00:00:00');
          const end = new Date(expense.customEndDate + 'T00:00:00');
          
          // Verifica se siamo nel periodo attivo
          if (today >= start && today <= end) {
            let diffDays = 0;
            const tempCurrent = new Date(start);
            while (tempCurrent <= end) {
              diffDays++;
              tempCurrent.setDate(tempCurrent.getDate() + 1);
            }
            return total + (expense.amount / diffDays);
          }
          
          // Se la spesa ha ripetizione automatica, controlla se dovremmo essere in un nuovo periodo
          if (expense.isRepeating && today > end) {
            // Calcola il periodo corrente basato sulla ripetizione
            let periodDays = 0;
            const tempCurrent = new Date(start);
            while (tempCurrent <= end) {
              periodDays++;
              tempCurrent.setDate(tempCurrent.getDate() + 1);
            }
            
            // Calcola in quale periodo dovremmo essere
            const daysPassed = Math.floor((today - end) / (1000 * 60 * 60 * 24));
            const periodsToAdd = Math.ceil(daysPassed / periodDays);
            
            const currentPeriodStart = new Date(start);
            currentPeriodStart.setDate(currentPeriodStart.getDate() + (periodDays * periodsToAdd));
            const currentPeriodEnd = new Date(end);
            currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (periodDays * periodsToAdd));
            
            if (today >= currentPeriodStart && today <= currentPeriodEnd) {
              return total + (expense.amount / periodDays);
            }
          }
        }
        return total;
      }, 0);
    };
    
    const dailyFixedExpenses = getDailyFixedExpenses();
    const dailySavings = getDailySavingsAmount();
    const daysInPeriod = getDaysInPaymentPeriod();
    const dailyIncome = monthlyIncome / daysInPeriod;
    
    const dailyBudget = dailyIncome - dailyFixedExpenses - dailySavings;
    const dailyFutureExpenses = getDailyFutureExpenses();
    const finalBudget = dailyBudget - dailyFutureExpenses;
    
    return finalBudget > 0 ? finalBudget : 0;
  };

  const getTodayExpenses = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(transaction => new Date(transaction.date).toDateString() === today && transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getTodayIncome = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(transaction => new Date(transaction.date).toDateString() === today && transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getBudgetSurplus = () => {
    const dailyBudget = calculateDailyBudget();
    const todayExpenses = getTodayExpenses();
    const todayIncome = getTodayIncome();
    return dailyBudget - todayExpenses + todayIncome;
  };

  const getMonthlyAvailability = () => {
    if (paymentType === 'custom' && customStartDate && customEndDate) {
      const isRepeating = localStorage.getItem('incomeRepeating') === 'true';
      const today = new Date();
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      
      let currentPeriodStart = start;
      let currentPeriodEnd = end;
      
      if (isRepeating && today > end) {
        let periodDays = 0;
        const tempCurrent = new Date(start);
        while (tempCurrent <= end) {
          periodDays++;
          tempCurrent.setDate(tempCurrent.getDate() + 1);
        }
        
        const daysPassed = Math.floor((today - end) / (1000 * 60 * 60 * 24));
        const periodsToAdd = Math.ceil(daysPassed / periodDays);
        
        currentPeriodStart = new Date(start);
        currentPeriodStart.setDate(currentPeriodStart.getDate() + (periodDays * periodsToAdd));
        currentPeriodEnd = new Date(end);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (periodDays * periodsToAdd));
      }
      
      const periodExpenses = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && 
                 tDate >= currentPeriodStart && 
                 tDate <= currentPeriodEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      let periodDays = 0;
      const tempPeriodCurrent = new Date(currentPeriodStart);
      while (tempPeriodCurrent <= currentPeriodEnd) {
        periodDays++;
        tempPeriodCurrent.setDate(tempPeriodCurrent.getDate() + 1);
      }
      
      const dailyFixedExpenses = fixedExpenses.reduce((sum, expense) => {
        if (expense.customStartDate && expense.customEndDate) {
          const expStart = new Date(expense.customStartDate);
          const expEnd = new Date(expense.customEndDate);
          if (today >= expStart && today <= expEnd) {
            let expDays = 0;
            const tempExpCurrent = new Date(expStart);
            while (tempExpCurrent <= expEnd) {
              expDays++;
              tempExpCurrent.setDate(tempExpCurrent.getDate() + 1);
            }
            return sum + (expense.amount / expDays);
          }
        }
        return sum;
      }, 0);
      
      const totalFixedExpenses = dailyFixedExpenses * periodDays;
      const savingsAmount = getDailySavingsAmount() * periodDays;
      
      return monthlyIncome - totalFixedExpenses - savingsAmount - periodExpenses;
    }
    
    // Comportamento normale per pagamento mensile
    const getMonthlyFixedExpenses = () => {
      const today = new Date();
      
      return fixedExpenses.reduce((total, expense) => {
        if (expense.customStartDate && expense.customEndDate) {
          const start = new Date(expense.customStartDate);
          const end = new Date(expense.customEndDate);
          
          if (today >= start && today <= end) {
            let diffDays = 0;
            const tempCurrent = new Date(start);
            while (tempCurrent <= end) {
              diffDays++;
              tempCurrent.setDate(tempCurrent.getDate() + 1);
            }
            const dailyAmount = expense.amount / diffDays;
            return total + (dailyAmount * 30);
          }
        }
        return total;
      }, 0);
    };
    
    const totalFixedExpenses = getMonthlyFixedExpenses();
    const monthlySavings = getMonthlySavingsAmount();
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

    return monthlyIncome - totalFixedExpenses - monthlySavings - monthlyExpenses;
  };

  const getDaysUntilPayday = () => {
    const isRepeating = localStorage.getItem('incomeRepeating') === 'true';
    
    if (paymentType === 'custom' && customEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = new Date(customEndDate + 'T00:00:00');
      
      if (today > endDate && isRepeating) {
        const start = new Date(customStartDate + 'T00:00:00');
        
        let periodDays = 0;
        const tempCurrent = new Date(start);
        while (tempCurrent <= endDate) {
          periodDays++;
          tempCurrent.setDate(tempCurrent.getDate() + 1);
        }
        
        const daysPassed = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
        const periodsToAdd = Math.ceil(daysPassed / periodDays);
        
        const newEnd = new Date(endDate);
        newEnd.setDate(newEnd.getDate() + (periodDays * periodsToAdd));
        
        let daysUntil = 0;
        const current = new Date(today);
        while (current < newEnd) {
          daysUntil++;
          current.setDate(current.getDate() + 1);
        }
        
        return daysUntil;
      }
      
      if (today > endDate) return 0;
      
      let daysUntil = 0;
      const current = new Date(today);
      while (current < endDate) {
        daysUntil++;
        current.setDate(current.getDate() + 1);
      }
      
      return daysUntil;
    }
    
    if (!nextPaydayDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextPayday = new Date(nextPaydayDate + 'T00:00:00');
    
    if (today > nextPayday) return 0;
    
    let daysUntil = 0;
    const current = new Date(today);
    while (current < nextPayday) {
      daysUntil++;
      current.setDate(current.getDate() + 1);
    }
    
    return daysUntil;
  };

  // Metodi per le transazioni
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      amount: parseFloat(transaction.amount),
      type: transaction.type || 'expense'
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updatedData } : transaction
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  // Metodi per le spese fisse
  const addFixedExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      amount: parseFloat(expense.amount)
    };
    setFixedExpenses(prev => [...prev, newExpense]);
  };

  const deleteFixedExpense = (id) => {
    setFixedExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Metodi per le spese future
  const addFutureExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setFutureExpenses(prev => [...prev, newExpense]);
  };

  const updateFutureExpense = (id, updatedData) => {
    setFutureExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, ...updatedData } : expense
      )
    );
  };

  const deleteFutureExpense = (id) => {
    setFutureExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Funzione per aggiungere ai risparmi
  const addToSavings = (amount, date = new Date().toISOString()) => {
    const newEntry = {
      id: Date.now(),
      amount: parseFloat(amount),
      date,
      total: totalSavings + parseFloat(amount)
    };
    setSavingsHistory(prev => [...prev, newEntry]);
    setTotalSavings(prev => prev + parseFloat(amount));
  };

  // Funzione per prelevare dai risparmi
  const withdrawFromSavings = (amount, date = new Date().toISOString()) => {
    const newEntry = {
      id: Date.now(),
      amount: -parseFloat(amount),
      date,
      total: totalSavings - parseFloat(amount)
    };
    setSavingsHistory(prev => [...prev, newEntry]);
    setTotalSavings(prev => prev - parseFloat(amount));
  };

  // Sistema automatico per aggiungere risparmi alla fine del periodo
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Per risparmi con periodo personalizzato
    if (savingsPeriod === 'custom' && savingsEndDate) {
      const endDate = new Date(savingsEndDate + 'T00:00:00');
      const isRepeating = localStorage.getItem('savingsRepeating') === 'true';
      
      // Se oggi è la fine del periodo di risparmio
      if (today.toDateString() === endDate.toDateString()) {
        const todayStr = today.toISOString().split('T')[0];
        const alreadySavedToday = savingsHistory.some(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === todayStr && entry.amount > 0;
        });
        
        if (!alreadySavedToday) {
          const totalSavingsAmount = getMonthlySavingsAmount();
          if (totalSavingsAmount > 0) {
            addToSavings(totalSavingsAmount, new Date().toISOString());
          }
          
          // Se c'è ripetizione, aggiorna al prossimo periodo
          if (isRepeating) {
            const start = new Date(savingsStartDate + 'T00:00:00');
            const end = new Date(savingsEndDate + 'T00:00:00');
            
            let periodDays = 0;
            const tempCurrent = new Date(start);
            while (tempCurrent <= end) {
              periodDays++;
              tempCurrent.setDate(tempCurrent.getDate() + 1);
            }
            
            const nextStart = new Date(end);
            nextStart.setDate(nextStart.getDate() + 1);
            const nextEnd = new Date(nextStart);
            nextEnd.setDate(nextEnd.getDate() + periodDays - 1);
            
            setSavingsStartDate(nextStart.toISOString().split('T')[0]);
            setSavingsEndDate(nextEnd.toISOString().split('T')[0]);
          }
        }
      }
    }
  }, [savingsPeriod, savingsEndDate, savingsStartDate, getMonthlySavingsAmount, savingsHistory]);

  // Statistiche
  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const expenses = monthlyTransactions.filter(t => t.type === 'expense');
    const income = monthlyTransactions.filter(t => t.type === 'income');

    const categoryExpenses = {};
    expenses.forEach(t => {
      if (!categoryExpenses[t.categoryId]) {
        categoryExpenses[t.categoryId] = 0;
      }
      categoryExpenses[t.categoryId] += t.amount;
    });

    return {
      totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
      totalIncome: income.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: monthlyTransactions.length,
      averageExpense: expenses.length ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length : 0,
      categoryBreakdown: categoryExpenses,
      dailyAverageExpense: expenses.reduce((sum, t) => sum + t.amount, 0) / new Date().getDate()
    };
  };

  const getWeeklyComparison = () => {
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);

    const thisWeekExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= thisWeekStart;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastWeekExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= lastWeekStart && tDate <= lastWeekEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      thisWeek: thisWeekExpenses,
      lastWeek: lastWeekExpenses,
      difference: thisWeekExpenses - lastWeekExpenses,
      percentageChange: lastWeekExpenses ? ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100 : 0
    };
  };

  // Value del provider con TUTTE le funzioni
  return (
    <AppContext.Provider value={{
      // Stati
      currentView, setCurrentView,
      monthlyIncome, setMonthlyIncome,
      lastPaydayDate, setLastPaydayDate,
      nextPaydayDate, setNextPaydayDate,
      paymentType, setPaymentType,
      customStartDate, setCustomStartDate,
      customEndDate, setCustomEndDate,
      fixedExpenses, setFixedExpenses,
      savingsPercentage, setSavingsPercentage,
      savingsMode, setSavingsMode,
      savingsPeriod, setSavingsPeriod,
      savingsFixedAmount, setSavingsFixedAmount,
      savingsStartDate, setSavingsStartDate,
      savingsEndDate, setSavingsEndDate,
      transactions, setTransactions,
      savingsHistory, setSavingsHistory,
      totalSavings, setTotalSavings,
      categories,
      futureExpenses, setFutureExpenses,
      theme,
      streak, 
      achievements, setAchievements,
      userSettings, setUserSettings,

      // FUNZIONI IMPORTANTI
      addTransaction, 
      updateTransaction, 
      deleteTransaction,
      addFixedExpense, 
      deleteFixedExpense,
      addFutureExpense,
      updateFutureExpense,
      deleteFutureExpense,
      calculateDailyBudget,
      getTodayExpenses,
      getTodayIncome,
      getBudgetSurplus,
      getDaysUntilPayday,
      getMonthlyAvailability,
      getDailyFutureExpenses,
      getDaysInPaymentPeriod,
      getDaysInSavingsPeriod,
      getDailySavingsAmount,
      getMonthlySavingsAmount,
      getMonthlyStats,
      getWeeklyComparison,
      addToSavings,
      withdrawFromSavings
    }}>
      {children}
    </AppContext.Provider>
  );
};