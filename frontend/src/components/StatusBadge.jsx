import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
      case 'successful':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'admitted':
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
      case 'partially paid':
      case 'on leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'discharged':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'inactive':
      case 'cancelled':
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
