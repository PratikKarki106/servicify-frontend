import React, { useEffect, useState } from 'react';
import { registerDialogRunner } from '../services/dialogService';
import './AppDialogHost.css';

interface DialogState {
  open: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
  resolver: ((value: boolean) => void) | null;
}

const defaultState: DialogState = {
  open: false,
  type: 'alert',
  title: 'Notice',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  variant: 'info',
  resolver: null,
};

const AppDialogHost: React.FC = () => {
  const [dialog, setDialog] = useState<DialogState>(defaultState);

  useEffect(() => {
    registerDialogRunner((request) => {
      return new Promise<boolean>((resolve) => {
        setDialog({
          ...request,
          open: true,
          resolver: resolve,
        });
      });
    });
  }, []);

  const close = (result: boolean) => {
    dialog.resolver?.(result);
    setDialog(defaultState);
  };

  if (!dialog.open) return null;

  return (
    <div className="app-dialog-overlay" onClick={() => close(false)}>
      <div className="app-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className={`app-dialog-icon ${dialog.variant}`}>{dialog.type === 'confirm' ? '?' : 'i'}</div>
        <h3 className="app-dialog-title">{dialog.title}</h3>
        <p className="app-dialog-message">{dialog.message}</p>
        <div className="app-dialog-actions">
          {dialog.type === 'confirm' && (
            <button className="app-dialog-btn secondary" onClick={() => close(false)}>
              {dialog.cancelText}
            </button>
          )}
          <button className={`app-dialog-btn primary ${dialog.variant}`} onClick={() => close(true)}>
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppDialogHost;

