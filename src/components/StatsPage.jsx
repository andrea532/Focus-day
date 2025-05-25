import React, { useContext, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Trophy,
  Calendar,
  ArrowUp,
  ArrowDown,
  Wallet,
  PiggyBank,
  Receipt,
  Clock,
  Filter,
  ChevronRight,
  Plus,
  Minus,
  Target,
  DollarSign
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const StatsPage = () => {
  const {
    theme,
    categories,
    transactions,
    getMonthlyStats,
    getWeeklyComparison,
    streak,
    achievements,
    setAchievements,
    setCurrentView,
  } = useContext(AppContext);

  // Stati locali
  const [timeFilter, setTimeFilter] = useState('monthly'); // monthly, weekly, daily
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Calcola le statistiche in base al filtro temporale
  const getFilteredStats = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeFilter) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = totalIncome - totalExpenses;
    const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    // Calcola spese per categoria
    const categoryBreakdown = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryBreakdown[t.categoryId]) {
          categoryBreakdown[t.categoryId] = 0;
        }
        categoryBreakdown[t.categoryId] += t.amount;
      });
    
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const averageExpense = expenseTransactions.length > 0 
      ? totalExpenses / expenseTransactions.length 
      : 0;
    
    return {
      totalExpenses,
      totalIncome,
      savings,
      savingsPercentage,
      categoryBreakdown,
      transactionCount: filteredTransactions.length,
      averageExpense,
      dailyAverageExpense: totalExpenses / (timeFilter === 'daily' ? 1 : timeFilter === 'weekly' ? 7 : 30),
    };
  }, [timeFilter, transactions]);

  // Usa le stats mensili esistenti quando il filtro è mensile
  const monthlyStats = getMonthlyStats();
  const weeklyComparison = getWeeklyComparison();

  // Dati per il grafico temporale
  const getChartData = () => {
    const data = [];
    const now = new Date();
    
    switch (timeFilter) {
      case 'daily':
        // Ultime 24 ore
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(now.getHours() - i);
          const hourExpenses = transactions
            .filter(t => {
              const tDate = new Date(t.date);
              const tHour = tDate.getHours();
              return t.type === 'expense' && 
                     tDate.toDateString() === hour.toDateString() &&
                     tHour === hour.getHours();
            })
            .reduce((sum, t) => sum + t.amount, 0);
          
          data.push({
            label: `${hour.getHours()}:00`,
            amount: hourExpenses,
          });
        }
        break;
      
      case 'weekly':
        // Ultimi 7 giorni
        for (let i = 6; i >= 0; i--) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          const dayExpenses = transactions
            .filter(t => {
              const tDate = new Date(t.date);
              return t.type === 'expense' && 
                     tDate.toDateString() === day.toDateString();
            })
            .reduce((sum, t) => sum + t.amount, 0);
          
          data.push({
            label: day.toLocaleDateString('it-IT', { weekday: 'short' }),
            amount: dayExpenses,
            date: day,
            isToday: i === 0
          });
        }
        break;
      
      case 'monthly':
        // Ultime 4 settimane
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i * 7 + 6));
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - (i * 7));
          
          const weekExpenses = transactions
            .filter(t => {
              const tDate = new Date(t.date);
              return t.type === 'expense' && 
                     tDate >= weekStart && 
                     tDate <= weekEnd;
            })
            .reduce((sum, t) => sum + t.amount, 0);
          
          data.push({
            label: `Sett. ${4 - i}`,
            amount: weekExpenses,
            isCurrentWeek: i === 0
          });
        }
        break;
    }
    
    return data;
  };

  const chartData = getChartData();
  const maxChartAmount = Math.max(...chartData.map(d => d.amount));

  // Animazioni
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  // Ottieni statistiche per categoria
  const getCategoryStats = () => {
    const stats = [];
    const currentStats = timeFilter === 'monthly' ? monthlyStats : getFilteredStats;
    
    Object.entries(currentStats.categoryBreakdown).forEach(([categoryId, amount]) => {
      const category = categories.find(c => c.id === parseInt(categoryId));
      if (category && category.id <= 20) { // Solo categorie di spesa (1-20)
        const percentage = (amount / currentStats.totalExpenses) * 100;
        stats.push({
          category,
          amount,
          percentage
        });
      }
    });
    return stats.sort((a, b) => b.amount - a.amount);
  };

  const categoryStats = getCategoryStats();

  // Achievement non visti
  const unseenAchievements = achievements.filter((a) => !a.seen);

  useEffect(() => {
    if (unseenAchievements.length > 0) {
      const timer = setTimeout(() => {
        setAchievements((prev) => prev.map((a) => ({ ...a, seen: true })));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [unseenAchievements, setAchievements]);

  // Ottieni l'icona della categoria
  const getCategoryDisplay = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { icon: '💰', color: theme.textSecondary, name: 'Altro' };
    return {
      icon: category.icon,
      color: category.color,
      name: category.name
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="stats-page"
      style={{ paddingBottom: '100px', backgroundColor: theme.background, minHeight: '100vh' }}
    >
      {/* Header con filtri */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: '20px',
          backgroundColor: theme.card,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>
          Statistiche Finanziarie
        </h2>
        <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>
          Analizza le tue spese e monitora i tuoi risparmi
        </p>
        
        {/* Filtri temporali */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'daily', label: 'Giornaliero' },
            { value: 'weekly', label: 'Settimanale' },
            { value: 'monthly', label: 'Mensile' }
          ].map((filter) => (
            <motion.button
              key={filter.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFilter(filter.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: timeFilter === filter.value ? theme.primary : theme.background,
                color: timeFilter === filter.value ? 'white' : theme.text,
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {unseenAchievements.length > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              margin: '16px',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: `${theme.warning}20`,
              border: `1px solid ${theme.warning}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{
                x: [0, 100, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: '-100px',
                width: '100px',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${theme.warning}40, transparent)`,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy size={24} style={{ color: theme.warning }} />
              <div>
                <p style={{ fontWeight: '600', color: theme.text }}>
                  Nuovo Achievement!
                </p>
                <p style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {unseenAchievements[0].title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: '16px' }}
      >
        {/* Cards principali - Sommario */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {/* Spese */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: theme.card,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Minus size={20} style={{ color: theme.danger }} />
              <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                {timeFilter === 'daily' ? 'Oggi' : timeFilter === 'weekly' ? 'Settimana' : 'Mese'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: theme.textSecondary }}>Spese Totali</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: theme.danger }}>
              €{getFilteredStats.totalExpenses.toFixed(2)}
            </p>
          </motion.div>

          {/* Entrate */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: theme.card,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Plus size={20} style={{ color: theme.secondary }} />
              <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                {timeFilter === 'daily' ? 'Oggi' : timeFilter === 'weekly' ? 'Settimana' : 'Mese'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: theme.textSecondary }}>Entrate Totali</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: theme.secondary }}>
              €{getFilteredStats.totalIncome.toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Risparmi */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            color: 'white',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, white 0%, transparent 70%)'
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PiggyBank size={24} />
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Risparmi del Periodo</h3>
              </div>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                {getFilteredStats.savingsPercentage.toFixed(1)}% delle entrate
              </span>
            </div>
            
            <p style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              €{getFilteredStats.savings.toFixed(2)}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getFilteredStats.savings > 0 ? (
                <>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '14px' }}>Ottimo lavoro! Stai risparmiando</span>
                </>
              ) : (
                <>
                  <ArrowDown size={16} />
                  <span style={{ fontSize: '14px' }}>Attenzione alle spese</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistiche aggiuntive */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: theme.card,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={16} style={{ color: theme.primary }} />
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>Spesa Media</p>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
              €{getFilteredStats.averageExpense.toFixed(2)}
            </p>
            <p style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
              per transazione
            </p>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: theme.card,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={16} style={{ color: theme.primary }} />
              <p style={{ fontSize: '12px', color: theme.textSecondary }}>Media Giornaliera</p>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
              €{getFilteredStats.dailyAverageExpense.toFixed(2)}
            </p>
            <p style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
              al giorno
            </p>
          </div>
        </motion.div>

        {/* Grafico temporale */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '24px',
            borderRadius: '24px',
            backgroundColor: theme.card,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
              Andamento {timeFilter === 'daily' ? 'Orario' : timeFilter === 'weekly' ? 'Giornaliero' : 'Settimanale'}
            </h3>
            <BarChart3 size={20} style={{ color: theme.primary }} />
          </div>

          <div style={{ height: '200px', position: 'relative', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', gap: '4px' }}>
              {chartData.map((data, index) => {
                const height = maxChartAmount > 0 ? (data.amount / maxChartAmount) * 100 : 0;
                const isHighlighted = data.isToday || data.isCurrentWeek;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      flex: 1,
                      backgroundColor: isHighlighted ? theme.primary : `${theme.primary}60`,
                      borderRadius: '8px 8px 0 0',
                      position: 'relative',
                      cursor: 'pointer',
                      minHeight: '4px'
                    }}
                  >
                    {data.amount > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        style={{
                          position: 'absolute',
                          top: '-24px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '10px',
                          fontWeight: '600',
                          color: theme.text,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        €{data.amount.toFixed(0)}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {chartData.map((data, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '10px',
                  color: data.isToday || data.isCurrentWeek ? theme.primary : theme.textSecondary,
                  fontWeight: data.isToday || data.isCurrentWeek ? '600' : '400'
                }}
              >
                {data.label}
              </div>
            ))}
          </div>

          {/* Trend settimanale (solo per vista mensile) */}
          {timeFilter === 'monthly' && (
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${theme.background}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {weeklyComparison.percentageChange < 0 ? (
                  <ArrowDown size={20} style={{ color: theme.secondary }} />
                ) : (
                  <ArrowUp size={20} style={{ color: theme.danger }} />
                )}
                <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Rispetto alla settimana scorsa
                </span>
              </div>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontWeight: '600',
                  color: weeklyComparison.percentageChange < 0 ? theme.secondary : theme.danger,
                }}
              >
                {weeklyComparison.percentageChange > 0 ? '+' : ''}
                {weeklyComparison.percentageChange.toFixed(1)}%
              </motion.span>
            </div>
          )}
        </motion.div>

        {/* Spese per Categoria */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '24px',
            borderRadius: '24px',
            backgroundColor: theme.card,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
              Spese per Categoria
            </h3>
            <PieChart size={20} style={{ color: theme.primary }} />
          </div>

          {categoryStats.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={showAllCategories ? 'all' : 'limited'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  {categoryStats
                    .slice(0, showAllCategories ? undefined : 5)
                    .map((stat, index) => (
                      <motion.div
                        key={stat.category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedCategory(
                          selectedCategory?.id === stat.category.id ? null : stat.category
                        )}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <motion.div
                              animate={{
                                scale: selectedCategory?.id === stat.category.id ? 1.2 : 1,
                                backgroundColor: selectedCategory?.id === stat.category.id
                                  ? stat.category.color
                                  : `${stat.category.color}20`,
                              }}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <span style={{ fontSize: '20px' }}>{stat.category.icon}</span>
                            </motion.div>
                            <div>
                              <p style={{ fontWeight: '500', color: theme.text }}>
                                {stat.category.name}
                              </p>
                              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                                {stat.percentage.toFixed(1)}% del totale
                              </p>
                            </div>
                          </div>
                          <p style={{ fontWeight: '600', color: theme.text }}>
                            €{stat.amount.toFixed(2)}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: theme.background,
                          overflow: 'hidden',
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            style={{
                              height: '100%',
                              borderRadius: '3px',
                              backgroundColor: stat.category.color,
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              </AnimatePresence>

              {categoryStats.length > 5 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: theme.background,
                    color: theme.primary,
                    fontWeight: '500',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {showAllCategories ? 'Mostra meno' : `Vedi tutte (${categoryStats.length})`}
                </motion.button>
              )}
            </>
          ) : (
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: theme.textSecondary,
              padding: '32px 0',
            }}>
              Nessuna spesa nel periodo selezionato
            </p>
          )}
        </motion.div>

        {/* Transazioni Recenti */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '24px',
            borderRadius: '24px',
            backgroundColor: theme.card,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
              Transazioni Recenti
            </h3>
            <Receipt size={20} style={{ color: theme.primary }} />
          </div>

          {transactions.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={showAllTransactions ? 'all' : 'limited'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, showAllTransactions ? undefined : 5)
                    .map((transaction, index) => {
                      const categoryDisplay = getCategoryDisplay(transaction.categoryId);
                      const transactionDate = new Date(transaction.date);
                      
                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: theme.background,
                            marginBottom: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: `${categoryDisplay.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <span style={{ fontSize: '16px' }}>{categoryDisplay.icon}</span>
                            </div>
                            <div>
                              <p style={{ fontWeight: '500', color: theme.text }}>
                                {transaction.description || categoryDisplay.name}
                              </p>
                              <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                                {transactionDate.toLocaleDateString('it-IT')} • {categoryDisplay.name}
                              </p>
                            </div>
                          </div>
                          <p style={{
                            fontWeight: '600',
                            color: transaction.type === 'income' ? theme.secondary : theme.danger
                          }}>
                            {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                          </p>
                        </motion.div>
                      );
                    })}
                </motion.div>
              </AnimatePresence>

              {transactions.length > 5 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: theme.background,
                    color: theme.primary,
                    fontWeight: '500',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {showAllTransactions ? 'Mostra meno' : 'Vedi tutte'}
                  <ChevronRight
                    size={16}
                    style={{
                      transform: showAllTransactions ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </motion.button>
              )}
            </>
          ) : (
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: theme.textSecondary,
              padding: '32px 0',
            }}>
              Nessuna transazione registrata
            </p>
          )}
        </motion.div>

        {/* Achievements e Streak */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '24px',
            borderRadius: '24px',
            backgroundColor: theme.card,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>
              Progressi e Achievements
            </h3>
            <Trophy size={20} style={{ color: theme.warning }} />
          </div>

          {/* Streak Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${theme.primary} 0%, #5A85FF 100%)`,
              marginBottom: '20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, white 0%, transparent 70%)',
              }}
            />

            <Calendar
              size={32}
              style={{ color: 'white', margin: '0 auto 12px' }}
            />
            <p style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>
              Streak Attuale
            </p>
            <motion.p
              key={streak}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                color: 'white',
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: '8px',
              }}
            >
              {streak}
            </motion.p>
            <p style={{ color: 'white', fontSize: '14px', opacity: 0.9 }}>
              giorni consecutivi sotto budget
            </p>
          </motion.div>

          {/* Recent Achievements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {achievements.length > 0 ? (
              achievements
                .slice(-3)
                .reverse()
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: theme.background,
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: `${theme.warning}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trophy size={20} style={{ color: theme.warning }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '500', color: theme.text }}>
                        {achievement.title}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {new Date(achievement.date).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </motion.div>
                ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: theme.textSecondary,
                  padding: '32px 0',
                }}
              >
                Completa obiettivi per sbloccare achievements!
              </motion.p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPage;