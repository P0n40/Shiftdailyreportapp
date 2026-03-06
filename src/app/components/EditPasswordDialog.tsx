import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface EditPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EditPasswordDialog({
  isOpen,
  onClose,
  onConfirm,
}: EditPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (password !== 'Den4ik123@') {
      setError('Неправильний пароль');
      return;
    }
    onConfirm();
    setPassword('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-500/10 rounded-full">
          <Lock className="w-6 h-6 text-orange-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Редагувати рапорт
        </h2>

        {/* Message */}
        <p className="text-zinc-400 text-center mb-6">
          Для редагування рапорту введіть пароль.
        </p>

        {/* Password Input */}
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Введіть пароль"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            className="flex-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
          >
            Скасувати
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Редагувати
          </Button>
        </div>
      </div>
    </div>
  );
}
