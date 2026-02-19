import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info, HelpCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'confirm';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    onConfirm?: () => void;
    confirmLabel?: string;
    confirmColor?: string;
}

// Simple event-based singleton for global usage
let toastListener: (toast: ToastMessage) => void;

export const showToast = (message: string, type: ToastType = 'success') => {
    if (toastListener) {
        toastListener({ id: Math.random().toString(36).substr(2, 9), message, type });
    }
};

export const showConfirm = (message: string, onConfirm: () => void, confirmLabel: string = 'Delete', confirmColor: string = '#ef4444') => {
    if (toastListener) {
        toastListener({
            id: 'confirm-' + Math.random().toString(36).substr(2, 9),
            message,
            type: 'confirm',
            onConfirm,
            confirmLabel,
            confirmColor
        });
    }
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        toastListener = (newToast) => {
            setToasts((prev) => [...prev, newToast]);

            // Only auto-remove if it's not a confirmation toast
            if (newToast.type !== 'confirm') {
                setTimeout(() => {
                    removeToast(newToast.id);
                }, 3000);
            }
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{
                            minWidth: '320px',
                            maxWidth: '400px',
                            padding: '20px',
                            background: 'rgba(30, 41, 59, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${toast.type === 'confirm' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border)'}`,
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            color: 'white',
                            pointerEvents: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {toast.type === 'success' && <CheckCircle2 size={24} color="#10b981" />}
                            {toast.type === 'error' && <AlertCircle size={24} color="#ef4444" />}
                            {toast.type === 'info' && <Info size={24} color="var(--primary)" />}
                            {toast.type === 'confirm' && <HelpCircle size={24} color="#f59e0b" />}

                            <div style={{ flex: 1, fontSize: '15px', fontWeight: 500, lineHeight: 1.5, paddingTop: '2px' }}>
                                {toast.message}
                            </div>

                            {toast.type !== 'confirm' && (
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: '-4px'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {toast.type === 'confirm' && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        toast.onConfirm?.();
                                        removeToast(toast.id);
                                    }}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        background: toast.confirmColor || '#ef4444',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {toast.confirmLabel || 'Delete'}
                                </button>
                            </div>
                        )}

                        {toast.type !== 'confirm' && (
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 3, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    height: '3px',
                                    background: toast.type === 'success' ? '#10b981' : (toast.type === 'error' ? '#ef4444' : 'var(--primary)'),
                                    borderBottomLeftRadius: '16px',
                                    borderBottomRightRadius: '16px'
                                }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
