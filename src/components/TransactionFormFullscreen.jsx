import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trash2, X, AlertTriangle, Plus, Minus, Check 
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const TransactionFormFullscreen = ({ isOpen, onClose, initialType, initialData, onSave, onDelete }) => {
  const { theme, categories } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(initialData ? 2 : 1);
  const [transactionType, setTransactionType] = useState(initialType || (initialData ? initialData.type : 'expense'));
  const [selectedCategory, setSelectedCategory] = useState(
    initialData ? categories.find(c => c.id === initialData.categoryId) : null
  );
  const [amount, setAmount] = useState(initialData ? Math.round(initialData.amount * 100).toString() : '');
  const [description, setDescription] = useState(initialData ? initialData.description : '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      setCurrentStep(initialData ? 2 : 1);
      setSelectedCategory(initialData ? categories.find(c => c.id === initialData.categoryId) : null);
      setAmount(initialData ? Math.round(initialData.amount * 100).toString() : '');
      setDescription(initialData ? initialData.description : '');
      setTransactionType(initialType || (initialData ? initialData.type : 'expense'));
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialType, initialData, categories]);

  // Se non è aperto, non renderizziamo nulla
  if (!isOpen) return null;
  
  // Formattazione importo
  const formatAmount = (value) => {
    if (!value) return '';
    // Mantieni solo le cifre
    const numValue = value.replace(/[^0-9]/g, '');
    if (numValue === '') return '';
    
    // Converti in formato decimale (dividi per 100)
    const numericValue = parseInt(numValue, 10) / 100;
    return numericValue.toFixed(2).replace('.', ',');
  };

  // Gestione categoria selezionata
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentStep(2); // Passa al secondo step
  };
  
  // Torna al primo step
  const handleBack = () => {
    if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
    } else if (initialData) {
      onClose();
    } else {
      setCurrentStep(1);
    }
  };
  
  // Gestione salvataggio
  const handleSave = () => {
    if (!amount) return;
    
    // Converti l'importo in formato numerico (dividi per 100 perché amount è in centesimi)
    const numericAmount = parseInt(amount, 10) / 100;
    
    // Chiamare la funzione onSave passata come prop
    onSave({
      id: initialData?.id,
      type: transactionType,
      categoryId: selectedCategory.id,
      amount: numericAmount,
      description: description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0]
    });

    // Chiudi il form
    onClose();
  };

  // Gestione eliminazione
  const handleDelete = () => {
    if (showDeleteConfirm && initialData) {
      onDelete(initialData.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Filtro le categorie in base al tipo di transazione
  const filteredCategories = categories.filter(cat => 
    transactionType === 'expense' ? cat.id <= 20 : cat.id >= 21
  );

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
          {showDeleteConfirm 
            ? "Conferma eliminazione"
            : (currentStep === 1 
              ? (transactionType === 'expense' ? 'Nuova Spesa' : 'Nuova Entrata')
              : (initialData ? 'Modifica' : '') + (selectedCategory?.name || '')
            )
          }
        </h2>

        {currentStep === 2 && !showDeleteConfirm ? (
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
        ) : showDeleteConfirm ? (
          <button
            onClick={handleDelete}
            style={{
              padding: isVerySmall ? '2px 4px' : isMobile ? '4px 8px' : '8px 16px',
              backgroundColor: theme.danger,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: isVerySmall ? '12px' : isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: isVerySmall ? '2px' : '4px'
            }}
          >
            <Trash2 size={isVerySmall ? 14 : isMobile ? 16 : 18} />
            Elimina
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
        {/* Conferma eliminazione */}
        {showDeleteConfirm && (
          <motion.div
            key="delete-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '24px 16px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${theme.danger}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={40} color={theme.danger} />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: theme.text,
                marginBottom: '12px' 
              }}>
                Elimina transazione
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: theme.textSecondary,
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              marginTop: '12px'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text,
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
              
              <button
                onClick={handleDelete}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.danger,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Elimina
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Step 1: Seleziona categoria */}
        {currentStep === 1 && !showDeleteConfirm && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: isVerySmall ? '12px 8px' : isMobile ? '16px 12px' : '20px 16px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            <h3 style={{ 
              fontSize: isVerySmall ? '14px' : isMobile ? '16px' : '18px', 
              fontWeight: '600', 
              color: theme.text,
              marginBottom: isVerySmall ? '8px' : isMobile ? '12px' : '20px' 
            }}>
              Seleziona una categoria
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: getGridColumns(),
              gap: isVerySmall ? '6px' : isMobile ? '8px' : isDesktop ? '24px' : '16px',
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
                    borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
                    padding: isVerySmall ? '8px 2px' : isMobile ? '12px 4px' : '20px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isVerySmall ? '4px' : isMobile ? '8px' : '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.card}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ 
                    fontSize: isVerySmall ? '20px' : isMobile ? '28px' : '36px',
                    width: isVerySmall ? '28px' : isMobile ? '40px' : '60px',
                    height: isVerySmall ? '28px' : isMobile ? '40px' : '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${category.color}15`,
                    borderRadius: '50%'
                  }}>
                    {category.icon}
                  </div>
                  <span style={{ 
                    fontSize: isVerySmall ? '10px' : isMobile ? '12px' : '16px', 
                    fontWeight: '500',
                    color: theme.text,
                    textAlign: 'center',
                    lineHeight: '1.2',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: isVerySmall ? '-webkit-box' : 'block',
                    WebkitLineClamp: isVerySmall ? 2 : 'unset',
                    WebkitBoxOrient: isVerySmall ? 'vertical' : 'unset'
                  }}>
                    {category.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Step 2: Inserisci importo e descrizione */}
        {currentStep === 2 && selectedCategory && !showDeleteConfirm && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{
              padding: isVerySmall ? '12px 8px' : isMobile ? '16px 12px' : isDesktop ? '32px 24px' : '24px 16px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              maxWidth: isDesktop ? '800px' : '100%',
              margin: isDesktop ? '0 auto' : '0',
              width: '100%'
            }}
          >
            {/* Categoria selezionata */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
              padding: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
              backgroundColor: `${selectedCategory.color}10`,
              borderRadius: isVerySmall ? '8px' : isMobile ? '12px' : '16px',
              border: `1px solid ${selectedCategory.color}30`,
              marginBottom: isVerySmall ? '16px' : isMobile ? '24px' : '32px'
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
            <div style={{ marginBottom: isVerySmall ? '16px' : isMobile ? '24px' : '32px' }}>
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
                  inputMode="decimal"
                  value={formatAmount(amount)}
                  onChange={(e) => {
                    // Rimuovi tutto tranne i numeri
                    const numValue = e.target.value.replace(/[^0-9]/g, '');
                    setAmount(numValue);
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
            <div style={{ marginBottom: isVerySmall ? '24px' : isMobile ? '32px' : '40px' }}>
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

            {/* Pulsante Elimina (solo se stiamo modificando) */}
            {initialData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '40px'
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    width: '100%',
                    padding: isVerySmall ? '14px' : isMobile ? '16px' : '18px',
                    borderRadius: isVerySmall ? '10px' : '12px',
                    backgroundColor: 'transparent',
                    color: theme.danger,
                    border: `2px solid ${theme.danger}`,
                    fontSize: isVerySmall ? '15px' : isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.danger;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.danger;
                  }}
                >
                  <Trash2 size={isVerySmall ? 16 : isMobile ? 18 : 20} />
                  Elimina Transazione
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionFormFullscreen;