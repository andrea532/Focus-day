// src/services/db.js
const DB_NAME = 'budgetAppDB';
const DB_VERSION = 1;

// Definizione degli object stores (tabelle)
const STORES = {
  SETTINGS: 'settings',
  TRANSACTIONS: 'transactions',
  FIXED_EXPENSES: 'fixedExpenses',
  FUTURE_EXPENSES: 'futureExpenses',
  SAVINGS: 'savings'
};

// Funzione per inizializzare il database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    console.log('Inizializzazione database...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject("Impossibile aprire il database");
    };

    request.onupgradeneeded = (event) => {
      console.log('Upgrade database necessario');
      const db = event.target.result;

      // Crea gli object stores con auto-incrementing keys
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        console.log('Creato store:', STORES.SETTINGS);
      }
      
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id', autoIncrement: true });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type', 'type', { unique: false });
        console.log('Creato store:', STORES.TRANSACTIONS);
      }

      if (!db.objectStoreNames.contains(STORES.FIXED_EXPENSES)) {
        db.createObjectStore(STORES.FIXED_EXPENSES, { keyPath: 'id', autoIncrement: true });
        console.log('Creato store:', STORES.FIXED_EXPENSES);
      }

      if (!db.objectStoreNames.contains(STORES.FUTURE_EXPENSES)) {
        const futureExpenseStore = db.createObjectStore(STORES.FUTURE_EXPENSES, { keyPath: 'id', autoIncrement: true });
        futureExpenseStore.createIndex('dueDate', 'dueDate', { unique: false });
        console.log('Creato store:', STORES.FUTURE_EXPENSES);
      }

      if (!db.objectStoreNames.contains(STORES.SAVINGS)) {
        const savingsStore = db.createObjectStore(STORES.SAVINGS, { keyPath: 'id', autoIncrement: true });
        savingsStore.createIndex('date', 'date', { unique: false });
        console.log('Creato store:', STORES.SAVINGS);
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log('Database aperto con successo');
      db.close(); // Chiudi la connessione dopo l'inizializzazione
      resolve(db);
    };
  });
};

// Operazioni generiche del database
const dbOperation = (storeName, mode, operation) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("Errore apertura database:", event.target.error);
      reject("Errore apertura database");
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      try {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        transaction.oncomplete = () => {
          db.close();
        };

        transaction.onerror = (event) => {
          console.error("Errore nella transazione:", event.target.error);
          db.close();
          reject("Errore durante l'operazione nel database");
        };

        const result = operation(store);

        if (result && typeof result.onsuccess !== 'undefined') {
          result.onsuccess = (event) => {
            const value = event.target.result;
            resolve(value);
          };
          
          result.onerror = (event) => {
            console.error("Errore nella richiesta:", event.target.error);
            reject(`Errore nell'operazione: ${event.target.error}`);
          };
        } else {
          // Per operazioni che non ritornano un request
          transaction.oncomplete = () => {
            resolve();
          };
        }
      } catch (error) {
        db.close();
        console.error("Errore durante l'operazione:", error);
        reject(error);
      }
    };
  });
};

// Funzioni per le impostazioni
export const saveSettings = async (settings) => {
  console.log('Salvataggio impostazioni:', settings);
  return dbOperation(STORES.SETTINGS, 'readwrite', (store) => {
    return store.put(settings);
  });
};

export const getSettings = async () => {
  console.log('Caricamento impostazioni...');
  return dbOperation(STORES.SETTINGS, 'readonly', (store) => {
    return store.getAll();
  });
};

// Funzioni per le transazioni
export const addTransaction = async (transaction) => {
  console.log('Aggiunta transazione:', transaction);
  
  // Crea una copia pulita senza ID per lasciare che il database lo generi
  const cleanTransaction = {
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    description: transaction.description,
    date: transaction.date,
    type: transaction.type
  };
  
  return dbOperation(STORES.TRANSACTIONS, 'readwrite', (store) => {
    return store.add(cleanTransaction);
  });
};

export const updateTransaction = async (transaction) => {
  console.log('Aggiornamento transazione:', transaction);
  
  // Assicurati che l'ID sia un numero
  const cleanTransaction = {
    ...transaction,
    id: typeof transaction.id === 'number' ? transaction.id : parseInt(transaction.id)
  };
  
  return dbOperation(STORES.TRANSACTIONS, 'readwrite', (store) => {
    return store.put(cleanTransaction);
  });
};

export const deleteTransaction = async (id) => {
  console.log('Eliminazione transazione con ID:', id);
  
  // Assicurati che l'ID sia un numero
  const numericId = typeof id === 'number' ? id : parseInt(id);
  
  return dbOperation(STORES.TRANSACTIONS, 'readwrite', (store) => {
    return store.delete(numericId);
  });
};

export const getTransactions = async () => {
  console.log('Caricamento transazioni...');
  return dbOperation(STORES.TRANSACTIONS, 'readonly', (store) => {
    return store.getAll();
  });
};

// Funzioni per le spese fisse
export const addFixedExpense = async (expense) => {
  console.log('Aggiunta spesa fissa:', expense);
  
  // Crea una copia pulita senza ID
  const cleanExpense = {
    name: expense.name,
    amount: expense.amount,
    categoryId: expense.categoryId,
    period: expense.period,
    customStartDate: expense.customStartDate,
    customEndDate: expense.customEndDate,
    isRepeating: expense.isRepeating
  };
  
  return dbOperation(STORES.FIXED_EXPENSES, 'readwrite', (store) => {
    return store.add(cleanExpense);
  });
};

export const updateFixedExpense = async (expense) => {
  console.log('Aggiornamento spesa fissa:', expense);
  
  const cleanExpense = {
    ...expense,
    id: typeof expense.id === 'number' ? expense.id : parseInt(expense.id)
  };
  
  return dbOperation(STORES.FIXED_EXPENSES, 'readwrite', (store) => {
    return store.put(cleanExpense);
  });
};

export const deleteFixedExpense = async (id) => {
  console.log('Eliminazione spesa fissa con ID:', id);
  
  const numericId = typeof id === 'number' ? id : parseInt(id);
  
  return dbOperation(STORES.FIXED_EXPENSES, 'readwrite', (store) => {
    return store.delete(numericId);
  });
};

export const getFixedExpenses = async () => {
  console.log('Caricamento spese fisse...');
  return dbOperation(STORES.FIXED_EXPENSES, 'readonly', (store) => {
    return store.getAll();
  });
};

// Funzioni per le spese future
export const addFutureExpense = async (expense) => {
  console.log('Aggiunta spesa futura:', expense);
  
  // Crea una copia pulita senza ID
  const cleanExpense = {
    name: expense.name,
    amount: expense.amount,
    dueDate: expense.dueDate,
    categoryId: expense.categoryId,
    description: expense.description,
    createdAt: expense.createdAt
  };
  
  return dbOperation(STORES.FUTURE_EXPENSES, 'readwrite', (store) => {
    return store.add(cleanExpense);
  });
};

export const updateFutureExpense = async (expense) => {
  console.log('Aggiornamento spesa futura:', expense);
  
  const cleanExpense = {
    ...expense,
    id: typeof expense.id === 'number' ? expense.id : parseInt(expense.id)
  };
  
  return dbOperation(STORES.FUTURE_EXPENSES, 'readwrite', (store) => {
    return store.put(cleanExpense);
  });
};

export const deleteFutureExpense = async (id) => {
  console.log('Eliminazione spesa futura con ID:', id);
  
  const numericId = typeof id === 'number' ? id : parseInt(id);
  
  return dbOperation(STORES.FUTURE_EXPENSES, 'readwrite', (store) => {
    return store.delete(numericId);
  });
};

export const getFutureExpenses = async () => {
  console.log('Caricamento spese future...');
  return dbOperation(STORES.FUTURE_EXPENSES, 'readonly', (store) => {
    return store.getAll();
  });
};

// Funzioni per i risparmi
export const addSavingsEntry = async (entry) => {
  console.log('Aggiunta risparmio:', entry);
  
  // Crea una copia pulita senza ID
  const cleanEntry = {
    amount: entry.amount,
    date: entry.date,
    total: entry.total
  };
  
  return dbOperation(STORES.SAVINGS, 'readwrite', (store) => {
    return store.add(cleanEntry);
  });
};

export const getSavingsHistory = async () => {
  console.log('Caricamento cronologia risparmi...');
  return dbOperation(STORES.SAVINGS, 'readonly', (store) => {
    return store.getAll();
  });
};

// Cancella tutto il database
export const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('Cancellazione database...');
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      console.log("Database cancellato con successo");
      resolve();
    };
    
    request.onerror = (event) => {
      console.error("Errore nella cancellazione del database:", event.target.error);
      reject("Impossibile cancellare il database");
    };
    
    request.onblocked = () => {
      console.warn("Cancellazione database bloccata");
      reject("Cancellazione database bloccata - chiudi tutte le tab");
    };
  });
};

// Funzione di utilità per verificare se il database esiste
export const checkDatabaseExists = async () => {
  try {
    const databases = await indexedDB.databases();
    return databases.some(db => db.name === DB_NAME);
  } catch (error) {
    console.error('Errore nel controllo del database:', error);
    return false;
  }
};

// Inizializza il database all'avvio
(async () => {
  try {
    await initDB();
    console.log('Database inizializzato correttamente');
  } catch (error) {
    console.error('Errore inizializzazione database:', error);
  }
})();

// Esporta i nomi degli store
export { STORES };