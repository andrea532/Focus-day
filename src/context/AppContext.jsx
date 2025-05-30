import React, { useState, createContext, useEffect } from 'react';
import * as db from '../services/db';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Stati principali
  const [isLoading, setIsLoading] = useState(true);
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
    // Categorie Spese (1-16) - Ottimizzate per l'Italia
    { id: 1, name: 'Spesa e Supermercato', color: '#FF5252', icon: '🛒' },
    { id: 2, name: 'Trasporti', color: '#448AFF', icon: '🚗' },
    { id: 3, name: 'Casa e Bollette', color: '#4CAF50', icon: '🏠' },
    { id: 4, name: 'Bar e Ristoranti', color: '#FF6F00', icon: '🍝' },
    { id: 5, name: 'Shopping', color: '#FF4081', icon: '🛍️' },
    { id: 6, name: 'Salute e Farmacia', color: '#E91E63', icon: '💊' },
    { id: 7, name: 'Divertimento', color: '#7C4DFF', icon: '🎬' },
    { id: 8, name: 'Sport e Palestra', color: '#FF9800', icon: '💪' },
    { id: 9, name: 'Abbigliamento', color: '#9C27B0', icon: '👔' },
    { id: 10, name: 'Tecnologia', color: '#795548', icon: '💻' },
    { id: 11, name: 'Istruzione', color: '#3F51B5', icon: '📚' },
    { id: 12, name: 'Animali', color: '#8BC34A', icon: '🐾' },
    { id: 13, name: 'Bellezza e Cura', color: '#FFC107', icon: '💄' },
    { id: 14, name: 'Viaggi e Vacanze', color: '#00BCD4', icon: '✈️' },
    { id: 15, name: 'Regalo', color: '#FF7043', icon: '🎁' },
    { id: 16, name: 'Altro', color: '#546E7A', icon: '📦' },
    
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

  // Carica i dati dal database all'avvio
  useEffect(() => {
    const loadDataFromDB = async () => {
      try {
        setIsLoading(true);
        
        // Carica le impostazioni
        const savedSettings = await db.getSettings();
        if (savedSettings && savedSettings.length > 0) {
          const settings = savedSettings[0];
          
          // Carica tutti i dati dalle impostazioni salvate
          if (settings.monthlyIncome !== undefined) setMonthlyIncome(settings.monthlyIncome);
          if (settings.lastPaydayDate) setLastPaydayDate(settings.lastPaydayDate);
          if (settings.nextPaydayDate) setNextPaydayDate(settings.nextPaydayDate);
          if (settings.paymentType) setPaymentType(settings.paymentType);
          if (settings.customStartDate) setCustomStartDate(settings.customStartDate);
          if (settings.customEndDate) setCustomEndDate(settings.customEndDate);
          if (settings.savingsMode) setSavingsMode(settings.savingsMode);
          if (settings.savingsPeriod) setSavingsPeriod(settings.savingsPeriod);
          if (settings.savingsPercentage !== undefined) setSavingsPercentage(settings.savingsPercentage);
          if (settings.savingsFixedAmount !== undefined) setSavingsFixedAmount(settings.savingsFixedAmount);
          if (settings.savingsStartDate) setSavingsStartDate(settings.savingsStartDate);
          if (settings.savingsEndDate) setSavingsEndDate(settings.savingsEndDate);
          if (settings.userSettings) setUserSettings(settings.userSettings);
          if (settings.streak !== undefined) setStreak(settings.streak);
          if (settings.achievements) setAchievements(settings.achievements);
        }
        
        // Carica le transazioni
        const savedTransactions = await db.getTransactions();
        if (savedTransactions) {
          setTransactions(savedTransactions);
        }
        
        // Carica le spese fisse
        const savedFixedExpenses = await db.getFixedExpenses();
        if (savedFixedExpenses) {
          setFixedExpenses(savedFixedExpenses);
        }
        
        // Carica le spese future
        const savedFutureExpenses = await db.getFutureExpenses();
        if (savedFutureExpenses) {
          setFutureExpenses(savedFutureExpenses);
        }
        
        // Carica la cronologia dei risparmi
        const savedSavingsHistory = await db.getSavingsHistory();
        if (savedSavingsHistory) {
          setSavingsHistory(savedSavingsHistory);
          // Calcola il totale dei risparmi
          const total = savedSavingsHistory.reduce((sum, entry) => sum + entry.amount, 0);
          setTotalSavings(total);
        }
        
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDataFromDB();
  }, []);

  // Salva le impostazioni quando cambiano
  useEffect(() => {
    if (!isLoading) {
      const saveSettingsToDB = async () => {
        try {
          await db.saveSettings({
            id: 'main-settings',
            monthlyIncome,
            lastPaydayDate,
            nextPaydayDate,
            paymentType,
            customStartDate,
            customEndDate,
            savingsMode,
            savingsPeriod,
            savingsPercentage,
            savingsFixedAmount,
            savingsStartDate,
            savingsEndDate,
            userSettings,
            streak,
            achievements,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('Errore nel salvataggio delle impostazioni:', error);
        }
      };
      
      saveSettingsToDB();
    }
  }, [
    monthlyIncome, lastPaydayDate, nextPaydayDate, paymentType,
    customStartDate, customEndDate, savingsMode, savingsPeriod,
    savingsPercentage, savingsFixedAmount, savingsStartDate, savingsEndDate,
    userSettings, streak, achievements, isLoading
  ]);

  // FUNZIONE CORRETTA: Calcola il totale giornaliero delle spese future da sottrarre
  const getDailyFutureExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calcola l'accantonamento per TUTTE le spese future attive
    return futureExpenses.reduce((total, expense) => {
      const dueDate = new Date(expense.dueDate + 'T00:00:00');
      
      // Se la spesa è futura (non ancora scaduta)
      if (dueDate > today) {
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          const dailyAmount = expense.amount / diffDays;
          console.log(`Spesa futura: ${expense.name}, Scadenza: ${expense.dueDate}, Giorni: ${diffDays}, Accantonamento giornaliero: €${dailyAmount.toFixed(2)}`);
          return total + dailyAmount;
        }
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

  // FUNZIONE CORRETTA: Calcola il budget giornaliero includendo spese future
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
    
    // IMPORTANTE: Includi l'accantonamento per spese future nel calcolo
    const dailyFutureExpenses = getDailyFutureExpenses();
    
    // Calcola il budget finale
    const dailyBudget = dailyIncome - dailyFixedExpenses - dailySavings - dailyFutureExpenses;
    
    // Log per debug
    console.log('Daily Budget Calculation:', {
      dailyIncome: dailyIncome.toFixed(2),
      dailyFixedExpenses: dailyFixedExpenses.toFixed(2),
      dailySavings: dailySavings.toFixed(2),
      dailyFutureExpenses: dailyFutureExpenses.toFixed(2),
      finalBudget: dailyBudget.toFixed(2),
      date: new Date().toISOString()
    });
    
    return dailyBudget;
  };

  const getTodayExpenses = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionStr = transactionDate.toISOString().split('T')[0];
        return transactionStr === todayStr && transaction.type === 'expense';
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getTodayIncome = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionStr = transactionDate.toISOString().split('T')[0];
        return transactionStr === todayStr && transaction.type === 'income';
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getBudgetSurplus = () => {
    // IMPORTANTE: Forza il ricalcolo del budget giornaliero (che include spese future)
    const dailyBudget = calculateDailyBudget();
    const todayExpenses = getTodayExpenses();
    const todayIncome = getTodayIncome();
    
    const surplus = dailyBudget - todayExpenses + todayIncome;
    
    // Log per debug
    console.log('Budget Surplus Calculation:', {
      dailyBudget: dailyBudget.toFixed(2),
      todayExpenses: todayExpenses.toFixed(2),
      todayIncome: todayIncome.toFixed(2),
      surplus: surplus.toFixed(2),
      date: new Date().toISOString()
    });
    
    return surplus;
  };

  const getMonthlyAvailability = () => {
    if (paymentType === 'custom' && customStartDate && customEndDate) {
      const isRepeating = localStorage.getItem('incomeRepeating') === 'true';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
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
      
      // Calcola giorni rimanenti nel periodo
      let remainingDays = 0;
      const tempToday = new Date(today);
      while (tempToday <= currentPeriodEnd) {
        remainingDays++;
        tempToday.setDate(tempToday.getDate() + 1);
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
      
      // IMPORTANTE: Calcola l'accantonamento totale per spese future per i giorni rimanenti
      const dailyFutureExpenses = getDailyFutureExpenses();
      const totalFutureExpenses = dailyFutureExpenses * remainingDays;
      
      const availability = monthlyIncome - totalFixedExpenses - savingsAmount - periodExpenses - totalFutureExpenses;
      
      console.log('Monthly Availability Calculation:', {
        monthlyIncome: monthlyIncome.toFixed(2),
        totalFixedExpenses: totalFixedExpenses.toFixed(2),
        savingsAmount: savingsAmount.toFixed(2),
        periodExpenses: periodExpenses.toFixed(2),
        dailyFutureExpenses: dailyFutureExpenses.toFixed(2),
        remainingDays,
        totalFutureExpenses: totalFutureExpenses.toFixed(2),
        availability: availability.toFixed(2)
      });
      
      return availability;
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
    
    // IMPORTANTE: Includi le spese future nel calcolo mensile
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const remainingDaysInMonth = daysInMonth - new Date().getDate() + 1;
    const monthlyFutureExpenses = getDailyFutureExpenses() * remainingDaysInMonth;

    return monthlyIncome - totalFixedExpenses - monthlySavings - monthlyExpenses - monthlyFutureExpenses;
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
  const addTransaction = async (transaction) => {
    try {
      const newTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
        type: transaction.type || 'expense',
        date: transaction.date || new Date().toISOString().split('T')[0]
      };
      
      const id = await db.addTransaction(newTransaction);
      newTransaction.id = id;
      
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Errore nell\'aggiunta della transazione:', error);
    }
  };

  const updateTransaction = async (id, updatedData) => {
    try {
      const updatedTransaction = { ...updatedData, id };
      await db.updateTransaction(updatedTransaction);
      
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? updatedTransaction : transaction
        )
      );
    } catch (error) {
      console.error('Errore nell\'aggiornamento della transazione:', error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await db.deleteTransaction(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Errore nell\'eliminazione della transazione:', error);
    }
  };

  // Metodi per le spese fisse
  const addFixedExpense = async (expense) => {
    try {
      const newExpense = {
        ...expense,
        amount: parseFloat(expense.amount)
      };
      
      const id = await db.addFixedExpense(newExpense);
      newExpense.id = id;
      
      setFixedExpenses(prev => [...prev, newExpense]);
    } catch (error) {
      console.error('Errore nell\'aggiunta della spesa fissa:', error);
    }
  };

  const deleteFixedExpense = async (id) => {
    try {
      await db.deleteFixedExpense(id);
      setFixedExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Errore nell\'eliminazione della spesa fissa:', error);
    }
  };

  // Metodi per le spese future
  const addFutureExpense = async (expense) => {
    try {
      const newExpense = {
        ...expense,
        createdAt: new Date().toISOString()
      };
      
      const id = await db.addFutureExpense(newExpense);
      newExpense.id = id;
      
      setFutureExpenses(prev => [...prev, newExpense]);
    } catch (error) {
      console.error('Errore nell\'aggiunta della spesa futura:', error);
    }
  };

  const updateFutureExpense = async (id, updatedData) => {
    try {
      const updatedExpense = { ...updatedData, id };
      await db.updateFutureExpense(updatedExpense);
      
      setFutureExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? updatedExpense : expense
        )
      );
    } catch (error) {
      console.error('Errore nell\'aggiornamento della spesa futura:', error);
    }
  };

  const deleteFutureExpense = async (id) => {
    try {
      await db.deleteFutureExpense(id);
      setFutureExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Errore nell\'eliminazione della spesa futura:', error);
    }
  };

  // Funzione per aggiungere ai risparmi
  const addToSavings = async (amount, date = new Date().toISOString()) => {
    try {
      const newEntry = {
        amount: parseFloat(amount),
        date,
        total: totalSavings + parseFloat(amount)
      };
      
      const id = await db.addSavingsEntry(newEntry);
      newEntry.id = id;
      
      setSavingsHistory(prev => [...prev, newEntry]);
      setTotalSavings(prev => prev + parseFloat(amount));
    } catch (error) {
      console.error('Errore nell\'aggiunta ai risparmi:', error);
    }
  };

  // Funzione per prelevare dai risparmi
  const withdrawFromSavings = async (amount, date = new Date().toISOString()) => {
    try {
      const newEntry = {
        amount: -parseFloat(amount),
        date,
        total: totalSavings - parseFloat(amount)
      };
      
      const id = await db.addSavingsEntry(newEntry);
      newEntry.id = id;
      
      setSavingsHistory(prev => [...prev, newEntry]);
      setTotalSavings(prev => prev - parseFloat(amount));
    } catch (error) {
      console.error('Errore nel prelievo dai risparmi:', error);
    }
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
      isLoading,
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