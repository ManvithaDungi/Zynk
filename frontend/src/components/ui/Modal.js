import React from 'react';

const Modal = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;
  return (
    <div className="bg-galaxy" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: 'min(600px, 92vw)' }}>
        {title && <h2 className="text-universe" style={{ marginTop: 0 }}>{title}</h2>}
        <div>{children}</div>
        <div className="divider" />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {actions}
          <button className="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;


