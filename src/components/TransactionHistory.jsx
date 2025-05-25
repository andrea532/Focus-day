import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, Clock, Search, 
  Filter, Calendar, MoreVertical, Edit, Trash, X, AlertTriangle,
  BarChart, PieChart, Plus, Minus, Check
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import TransactionFormFullscreen from './TransactionFormFullscreen';

// Componente per il singolo elemento della transazione
const TransactionItem = ({ transaction, theme, category, onEdit }) => {
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit'
  });
  
  const isExpense = transaction.type === 'expense';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        backgroundColor: theme.card,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          width: '100%',
          cursor: 'pointer'
        }}
        onClick={() => onEdit(transaction)}
      >
        <div style={{ 
          width: '46px', 
          height: '46px', 
          borderRadius: '12px', 
          backgroundColor: `${category.color}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0
        }}>
          {category.icon}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: theme.text,
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {transaction.description || category.name}
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Calendar size={14} />
            {formattedDate}
          </div>
        </div>
        
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: isExpense ? theme.danger : theme.secondary,
          flexShrink: 0
        }}>
          {isExpense ? '-' : '+'}€ {transaction.amount.toFixed(2)}
        </div>
      </div>
    </motion.div>
  );
};

// Componente per il raggruppamento delle transazioni per data
const TransactionGroup = ({ date, transactions, theme, categories, onEditTransaction }) => {
  const transactionDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let dateLabel = '';
  
  if (transactionDate.getTime() === today.getTime()) {
    dateLabel = 'Oggi';
  } else if (transactionDate.getTime() === yesterday.getTime()) {
    dateLabel = 'Ieri';
  } else {
    const formattedDay = transactionDate.toLocaleDateString('it-IT', { weekday: 'short' });
    const capitalizedDay = formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1);
    dateLabel = `${capitalizedDay}, ${transactionDate.getDate()} ${transactionDate.toLocaleDateString('it-IT', { month: 'short' })}`;
  }
  
  const dailyTotal = transactions.reduce((sum, t) => {
    return t.type === 'expense' 
      ? sum - t.amount 
      : sum + t.amount;
  }, 0);
  
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px',
        paddingLeft: '8px'
      }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: theme.text 
        }}>
          {dateLabel}
        </div>
        
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: dailyTotal >= 0 ? theme.secondary : theme.danger 
        }}>
          {dailyTotal >= 0 ? '+' : ''}€ {dailyTotal.toFixed(2)}
        </div>
      </div>
      
      <div>
        {transactions.map(transaction => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
            theme={theme}
            category={categories.find(c => c.id === transaction.categoryId)}
            onEdit={onEditTransaction}
          />
        ))}
      </div>
    </div>
  );
};

// Componente per il grafico annuale
const AnnualExpensesChart = ({ transactions, theme, categories, screenWidth }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const getMonthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, i, 1);
      return {
        month: date.toLocaleDateString('it-IT', { month: 'short' }),
        expenses: 0,
        incomes: 0
      };
    });
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        if (transaction.type === 'expense') {
          months[monthIndex].expenses += transaction.amount;
        } else {
          months[monthIndex].incomes += transaction.amount;
        }
      }
    });
    
    return months;
  };
  
  const getCategoryData = () => {
    const expensesByCategory = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear && transaction.type === 'expense') {
        if (!expensesByCategory[transaction.categoryId]) {
          expensesByCategory[transaction.categoryId] = 0;
        }
        expensesByCategory[transaction.categoryId] += transaction.amount;
      }
    });
    
    return Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => ({
        category: categories.find(c => c.id === parseInt(categoryId)),
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };
  
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalIncomes = monthlyData.reduce((sum, month) => sum + month.incomes, 0);
  const balance = totalIncomes - totalExpenses;
  
  const maxExpense = Math.max(...monthlyData.map(month => month.expenses));
  
  return (
    <div style={{ padding: screenWidth <= 480 ? '12px' : '16px', backgroundColor: theme.card, borderRadius: '16px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600',
        color: theme.text,
        marginTop: 0,
        marginBottom: '24px'
      }}>
        Panoramica annuale {currentYear}
      </h3>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            color: theme.textSecondary,
            marginBottom: '8px' 
          }}>
            Entrate
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: theme.secondary 
          }}>
            € {totalIncomes.toFixed(2)}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            color: theme.textSecondary,
            marginBottom: '8px' 
          }}>
            Spese
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: theme.danger 
          }}>
            € {totalExpenses.toFixed(2)}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            color: theme.textSecondary,
            marginBottom: '8px' 
          }}>
            Saldo
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: balance >= 0 ? theme.secondary : theme.danger 
          }}>
            € {balance.toFixed(2)}
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          color: theme.text,
          marginBottom: '16px'
        }}>
          Andamento mensile
        </h4>
        
        <div style={{ 
          display: 'flex', 
          height: '200px',
          alignItems: 'flex-end',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {monthlyData.map((data, index) => {
            const today = new Date();
            const isCurrentMonth = index === today.getMonth();
            const heightPercentage = maxExpense > 0 ? (data.expenses / maxExpense) * 100 : 0;
            
            return (
              <div 
                key={data.month} 
                style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
              >
                <div style={{ 
                  width: '100%',
                  height: `${heightPercentage}%`,
                  backgroundColor: isCurrentMonth ? theme.primary : `${theme.danger}60`,
                  borderRadius: '4px 4px 0 0',
                  position: 'relative'
                }}>
                  {data.expenses > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: theme.text,
                      fontSize: '10px',
                      whiteSpace: 'nowrap'
                    }}>
                      €{data.expenses.toFixed(0)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          {monthlyData.map(data => (
            <div 
              key={data.month}
              style={{ 
                flex: 1,
                textAlign: 'center',
                fontSize: '12px',
                color: theme.textSecondary,
                textTransform: 'capitalize'
              }}
            >
              {data.month}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          color: theme.text,
          marginBottom: '16px'
        }}>
          Top categorie di spesa
        </h4>
        
        {categoryData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categoryData.map(data => (
              <div 
                key={data.category.id}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ 
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: `${data.category.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {data.category.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.text,
                    marginBottom: '4px'
                  }}>
                    {data.category.name}
                  </div>
                  
                  <div style={{ 
                    height: '6px',
                    backgroundColor: `${theme.border}`,
                    borderRadius: '3px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${(data.amount / totalExpenses) * 100}%`,
                      backgroundColor: data.category.color,
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text
                }}>
                  € {data.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            color: theme.textSecondary
          }}>
            Nessuna spesa registrata quest'anno
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principale
const TransactionHistory = () => {
  const { theme, transactions, categories, updateTransaction, deleteTransaction } = useContext(AppContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Controlla la dimensione dello schermo
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const groupTransactionsByDate = (filteredTransactions) => {
    const grouped = {};
    
    filteredTransactions.forEach(transaction => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }
      
      grouped[transaction.date].push(transaction);
    });
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, transactions]) => ({ date, transactions }));
  };
  
  const filterTransactionsByMonth = () => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth.getMonth() &&
        transactionDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };
  
  const getFilteredTransactions = () => {
    let filtered = filterTransactionsByMonth();
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.type === selectedFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return (
          (t.description && t.description.toLowerCase().includes(query)) ||
          (category && category.name.toLowerCase().includes(query))
        );
      });
    }
    
    return filtered;
  };
  
  const filteredTransactions = getFilteredTransactions();
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  const calculateMonthlyTotal = () => {
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const incomes = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      expenses,
      incomes,
      balance: incomes - expenses
    };
  };
  
  const monthlyTotal = calculateMonthlyTotal();
  
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    
    const today = new Date();
    if (newDate > today) return;
    
    setCurrentMonth(newDate);
  };
  
  const getFormattedMonth = () => {
    const month = currentMonth.toLocaleDateString('it-IT', { month: 'long' });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };
  
  const isNextMonthDisabled = () => {
    const today = new Date();
    return (
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };
  
  const handleSaveTransaction = (updatedTransaction) => {
    updateTransaction(updatedTransaction.id, updatedTransaction);
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };
  
  const handleDeleteTransaction = (transactionId) => {
    deleteTransaction(transactionId);
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  return (
    <div style={{ 
      backgroundColor: theme.background,
      minHeight: '100vh',
      position: 'relative'
    }}>
      <AnimatePresence>
        {showTransactionForm && (
          <TransactionFormFullscreen 
            isOpen={showTransactionForm}
            onClose={() => {
              setShowTransactionForm(false);
              setEditingTransaction(null);
            }}
            initialData={editingTransaction}
            onSave={handleSaveTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </AnimatePresence>
      
      <div style={{ 
        backgroundColor: theme.card,
        padding: screenWidth <= 480 ? '12px' : '16px',
        borderBottom: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '16px'
        }}>
          <h2 style={{ 
            fontSize: screenWidth <= 480 ? '18px' : '20px', 
            fontWeight: '700',
            color: theme.text,
            margin: 0,
            flexShrink: 0
          }}>
            Cronologia transazioni
          </h2>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: screenWidth <= 480 ? '8px' : '12px'
          }}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{
                width: screenWidth <= 480 ? '36px' : '40px',
                height: screenWidth <= 480 ? '36px' : '40px',
                borderRadius: '50%',
                backgroundColor: isSearchOpen ? `${theme.primary}20` : 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme.primary,
                flexShrink: 0
              }}
            >
              <Search size={screenWidth <= 480 ? 18 : 20} />
            </button>
            
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                width: screenWidth <= 480 ? '36px' : '40px',
                height: screenWidth <= 480 ? '36px' : '40px',
                borderRadius: '50%',
                backgroundColor: selectedFilter !== 'all' || isFilterOpen ? `${theme.primary}20` : 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme.primary,
                flexShrink: 0
              }}
            >
              <Filter size={screenWidth <= 480 ? 18 : 20} />
            </button>
          </div>
        </div>
        
        <div>
          <h1 style={{ 
            fontSize: screenWidth <= 480 ? '20px' : '24px', 
            fontWeight: '700',
            color: theme.text,
            margin: '0 0 16px 0'
          }}>
            Transazioni
          </h1>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: screenWidth <= 480 ? 'column' : 'row',
            gap: '12px',
            alignItems: screenWidth <= 480 ? 'stretch' : 'center',
            justifyContent: screenWidth <= 480 ? 'center' : 'space-between'
          }}>
            {/* Selettore vista */}
            <div style={{
              backgroundColor: `${theme.primary}10`,
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              width: screenWidth <= 480 ? '100%' : 'auto'
            }}>
              <button
                onClick={() => setViewMode('monthly')}
                style={{
                  flex: screenWidth <= 480 ? 1 : 'unset',
                  padding: screenWidth <= 480 ? '8px 4px' : '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'monthly' ? theme.card : 'transparent',
                  color: viewMode === 'monthly' ? theme.primary : theme.textSecondary,
                  fontWeight: '600',
                  fontSize: screenWidth <= 480 ? '13px' : '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={screenWidth <= 480 ? 14 : 16} />
                Mensile
              </button>
              <button
                onClick={() => setViewMode('annual')}
                style={{
                  flex: screenWidth <= 480 ? 1 : 'unset',
                  padding: screenWidth <= 480 ? '8px 4px' : '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'annual' ? theme.card : 'transparent',
                  color: viewMode === 'annual' ? theme.primary : theme.textSecondary,
                  fontWeight: '600',
                  fontSize: screenWidth <= 480 ? '13px' : '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <BarChart size={screenWidth <= 480 ? 14 : 16} />
                Annuale
              </button>
            </div>
            
            {/* Navigazione mesi */}
            {viewMode === 'monthly' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: screenWidth <= 480 ? 'space-between' : 'flex-end',
                width: screenWidth <= 480 ? '100%' : 'auto'
              }}>
                <button 
                  onClick={goToPreviousMonth}
                  style={{
                    width: screenWidth <= 480 ? '32px' : '36px',
                    height: screenWidth <= 480 ? '32px' : '36px',
                    borderRadius: '50%',
                    backgroundColor: `${theme.primary}10`,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: theme.primary,
                    flexShrink: 0
                  }}
                >
                  <ChevronLeft size={screenWidth <= 480 ? 18 : 20} />
                </button>
                
                <div style={{ 
                  padding: screenWidth <= 480 ? '6px 10px' : '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: `${theme.primary}10`,
                  color: theme.primary,
                  fontWeight: '600',
                  fontSize: screenWidth <= 480 ? '14px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: screenWidth <= 480 ? '4px' : '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: screenWidth <= 480 ? 1 : 'unset',
                  justifyContent: 'center'
                }}>
                  <Clock size={screenWidth <= 480 ? 14 : 16} />
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {screenWidth <= 360 
                      ? `${getFormattedMonth().substring(0, 3)} ${currentMonth.getFullYear()}`
                      : `${getFormattedMonth()} ${currentMonth.getFullYear()}`
                    }
                  </span>
                </div>
                
                <button 
                  onClick={goToNextMonth}
                  disabled={isNextMonthDisabled()}
                  style={{
                    width: screenWidth <= 480 ? '32px' : '36px',
                    height: screenWidth <= 480 ? '32px' : '36px',
                    borderRadius: '50%',
                    backgroundColor: isNextMonthDisabled() ? theme.border : `${theme.primary}10`,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isNextMonthDisabled() ? 'not-allowed' : 'pointer',
                    color: isNextMonthDisabled() ? theme.textSecondary : theme.primary,
                    opacity: isNextMonthDisabled() ? 0.5 : 1,
                    flexShrink: 0
                  }}
                >
                  <ChevronRight size={screenWidth <= 480 ? 18 : 20} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ 
                overflow: 'hidden',
                marginTop: '16px'
              }}
            >
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca descrizione o categoria..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.background,
                  fontSize: '16px',
                  color: theme.text,
                  outline: 'none'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ 
                overflow: 'hidden',
                marginTop: '16px',
                display: 'flex',
                gap: '8px'
              }}
            >
              <button
                onClick={() => setSelectedFilter('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: selectedFilter === 'all' ? theme.primary : `${theme.primary}10`,
                  color: selectedFilter === 'all' ? 'white' : theme.primary,
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Tutte
              </button>
              
              <button
                onClick={() => setSelectedFilter('expense')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: selectedFilter === 'expense' ? theme.danger : `${theme.danger}10`,
                  color: selectedFilter === 'expense' ? 'white' : theme.danger,
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Solo spese
              </button>
              
              <button
                onClick={() => setSelectedFilter('income')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: selectedFilter === 'income' ? theme.secondary : `${theme.secondary}10`,
                  color: selectedFilter === 'income' ? 'white' : theme.secondary,
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Solo entrate
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence mode="wait">
        {viewMode === 'monthly' ? (
          <motion.div
            key="monthly-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={{ 
              backgroundColor: theme.card,
              margin: screenWidth <= 480 ? '12px' : '16px',
              borderRadius: '16px',
              padding: screenWidth <= 480 ? '12px' : '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: theme.text,
                marginTop: 0,
                marginBottom: '16px'
              }}>
                Riassunto {getFormattedMonth()}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between' 
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    marginBottom: '4px' 
                  }}>
                    Entrate
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: theme.secondary 
                  }}>
                    € {monthlyTotal.incomes.toFixed(2)}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    marginBottom: '4px' 
                  }}>
                    Spese
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: theme.danger 
                  }}>
                    € {monthlyTotal.expenses.toFixed(2)}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    marginBottom: '4px' 
                  }}>
                    Saldo
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: monthlyTotal.balance >= 0 ? theme.secondary : theme.danger 
                  }}>
                    € {monthlyTotal.balance.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: screenWidth <= 480 ? '0 12px 80px 12px' : '0 16px 80px 16px' }}>
              {groupedTransactions.length > 0 ? (
                groupedTransactions.map(group => (
                  <TransactionGroup 
                    key={group.date} 
                    date={group.date} 
                    transactions={group.transactions} 
                    theme={theme}
                    categories={categories}
                    onEditTransaction={handleEditTransaction}
                  />
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 0',
                  color: theme.textSecondary
                }}>
                  <div style={{ fontSize: '60px', marginBottom: '16px' }}>
                    🔍
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: theme.text,
                    marginBottom: '8px'
                  }}>
                    Nessuna transazione trovata
                  </h3>
                  <p style={{ fontSize: '16px' }}>
                    {searchQuery 
                      ? 'Prova a modificare i filtri di ricerca' 
                      : `Non hai registrato transazioni in ${getFormattedMonth()}`}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="annual-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ padding: '16px 16px 80px 16px' }}
          >
            <AnnualExpensesChart 
              transactions={transactions}
              theme={theme}
              categories={categories}
              screenWidth={screenWidth}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory;