import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Receipt, BarChart3, Settings } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Navigation = () => {
  const { currentView, setCurrentView, theme } = useContext(AppContext);

  const navItems = [
    { id: 'dashboard', icon: Home },
    { id: 'history', icon: Calendar },
    { id: 'future-expenses', icon: Receipt },
    { id: 'stats', icon: BarChart3 },
    { id: 'settings', icon: Settings },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="navigation safe-area-bottom"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme?.card || '#FFFFFF',
        zIndex: 50,
        padding: '8px 16px 16px',
      }}
    >
      {/* Barra floating */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: theme?.card || '#FFFFFF',
          borderRadius: '24px',
          padding: '8px',
          maxWidth: '380px',
          margin: '0 auto',
          height: '68px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${theme?.border || '#E3E8F1'}`,
        }}
      >
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView(item.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0',
              width: '52px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '16px',
              transition: 'background-color 0.3s ease',
            }}
          >
            {/* Background attivo con gradient */}
            <AnimatePresence>
              {currentView === item.id && (
                <motion.div
                  layoutId="activeTab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${theme?.primary}20 0%, ${theme?.primary}10 100%)`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Icona con effetto bounce */}
            <motion.div
              initial={{ y: 0 }}
              animate={{
                y: currentView === item.id ? -2 : 0,
                scale: currentView === item.id ? 1.1 : 1,
                color: currentView === item.id ? theme?.primary : theme?.textSecondary,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20,
                delay: currentView === item.id ? index * 0.02 : 0
              }}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <item.icon 
                size={26} 
                strokeWidth={currentView === item.id ? 2.5 : 2}
              />
              
              {/* Effetto glow per icona attiva */}
              {currentView === item.id && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [0.5, 0, 0.5] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  style={{
                    position: 'absolute',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: theme?.primary,
                    filter: 'blur(10px)',
                    zIndex: -1,
                  }}
                />
              )}
            </motion.div>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;