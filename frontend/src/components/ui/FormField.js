import React from 'react';

const FormField = ({ id, label, hint, error, className = '', inputClassName = '', ...props }) => {
  return (
    <div className={className}>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <input id={id} className={`input ${inputClassName}`} {...props} />
      {hint && !error && <small className="text-asteroid">{hint}</small>}
      {error && <small style={{ color: '#ff6666' }}>{error}</small>}
    </div>
  );
};

export default FormField;


