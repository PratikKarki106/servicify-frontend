type DialogType = 'alert' | 'confirm';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

interface DialogRequest extends Required<DialogOptions> {
  type: DialogType;
}

type DialogRunner = (request: DialogRequest) => Promise<boolean>;

let runner: DialogRunner | null = null;

export const registerDialogRunner = (fn: DialogRunner) => {
  runner = fn;
};

const fallbackConfirm = (message: string) => window.confirm(message);
const fallbackAlert = (message: string) => {
  window.alert(message);
  return true;
};

const withDefaults = (type: DialogType, options: DialogOptions): DialogRequest => ({
  type,
  title: options.title ?? (type === 'confirm' ? 'Please confirm' : 'Notice'),
  message: options.message,
  confirmText: options.confirmText ?? (type === 'confirm' ? 'Confirm' : 'OK'),
  cancelText: options.cancelText ?? 'Cancel',
  variant: options.variant ?? (type === 'confirm' ? 'warning' : 'info'),
});

export const appConfirm = async (options: DialogOptions): Promise<boolean> => {
  const request = withDefaults('confirm', options);
  if (!runner) return fallbackConfirm(request.message);
  return runner(request);
};

export const appAlert = async (options: DialogOptions): Promise<void> => {
  const request = withDefaults('alert', options);
  if (!runner) {
    fallbackAlert(request.message);
    return;
  }
  await runner(request);
};

