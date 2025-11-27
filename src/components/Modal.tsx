import React from 'react';

export default function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        minWidth: 320,
        maxWidth: 400,
        boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
        }}>&times;</button>
        {children}
      </div>
    </div>
  );
}
