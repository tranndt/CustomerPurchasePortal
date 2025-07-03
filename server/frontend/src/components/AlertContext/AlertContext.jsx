import React, { createContext, useState, useContext } from 'react';
import CustomAlert from '../CustomAlert/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
    inputPlaceholder: '',
    showInput: false,
    isInputRequired: false
  });

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  // Simple alert (replaces window.alert)
  const showAlert = (message, title = 'Notification', type = 'info') => {
    return new Promise((resolve) => {
      setAlert({
        isOpen: true,
        title,
        message,
        type,
        confirmText: 'OK',
        showCancel: false,
        showInput: false,
        onConfirm: () => {
          closeAlert();
          resolve(true);
        },
        onCancel: closeAlert
      });
    });
  };

  // Confirm dialog (replaces window.confirm)
  const showConfirm = (message, title = 'Confirm', type = 'warning') => {
    return new Promise((resolve) => {
      setAlert({
        isOpen: true,
        title,
        message,
        type,
        confirmText: 'Yes',
        cancelText: 'No',
        showCancel: true,
        showInput: false,
        onConfirm: () => {
          closeAlert();
          resolve(true);
        },
        onCancel: () => {
          closeAlert();
          resolve(false);
        }
      });
    });
  };

  // Prompt dialog (replaces window.prompt)
  const showPrompt = (message, inputPlaceholder = '', title = 'Input Required', isInputRequired = false, type = 'info') => {
    return new Promise((resolve) => {
      setAlert({
        isOpen: true,
        title,
        message,
        type,
        confirmText: 'Submit',
        cancelText: 'Cancel',
        showCancel: true,
        showInput: true,
        inputPlaceholder,
        isInputRequired,
        onConfirm: (value) => {
          closeAlert();
          resolve(value);
        },
        onCancel: () => {
          closeAlert();
          resolve(null);
        }
      });
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      <CustomAlert
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        showCancel={alert.showCancel}
        onClose={alert.onCancel}
        onConfirm={alert.onConfirm}
        inputPlaceholder={alert.inputPlaceholder}
        showInput={alert.showInput}
        isInputRequired={alert.isInputRequired}
      />
    </AlertContext.Provider>
  );
};

export default AlertProvider;
