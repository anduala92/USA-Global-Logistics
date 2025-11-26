import { createContext, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState('info');
  const value = useMemo(() => ({
    success: (m) => { setSeverity('success'); setMsg(m); setOpen(true); },
    error: (m) => { setSeverity('error'); setMsg(m); setOpen(true); },
    info: (m) => { setSeverity('info'); setMsg(m); setOpen(true); },
    warning: (m) => { setSeverity('warning'); setMsg(m); setOpen(true); },
  }), []);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={2500} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setOpen(false)} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
