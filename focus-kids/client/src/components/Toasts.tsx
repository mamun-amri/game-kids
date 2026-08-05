import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface Toast {
  id: number;
  icon: string;
  text: string;
}

const ToastCtx = createContext<{ toast: (icon: string, text: string) => void }>({
  toast: () => {},
});

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((icon: string, text: string) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, icon, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
