const fs = require('node:fs');

function validatePayment(payment, index) {
  const prefix = `pagamento ${index + 1}`;
  if (!payment || typeof payment !== 'object' || Array.isArray(payment)) return [`${prefix}: pagamento inválido`];
  const errors = [];
  for (const field of ['beneficiaryId', 'name', 'bank', 'agency', 'account']) {
    if (typeof payment[field] !== 'string' || !payment[field].trim()) errors.push(`${prefix}: campo obrigatório ausente ou inválido: ${field}`);
  }
  if (!/^BEN-\d{3}$/.test(payment.beneficiaryId || '')) errors.push(`${prefix}: beneficiaryId deve seguir o padrão BEN-999`);
  if (!Number.isFinite(payment.amount) || payment.amount < 0.01 || payment.amount > 5000) errors.push(`${prefix}: valor deve estar entre 0,01 e 5.000,00`);
  else if (Math.abs(payment.amount * 100 - Math.round(payment.amount * 100)) > 0.000001) errors.push(`${prefix}: valor deve ter no máximo duas casas decimais`);
  if (payment.approved !== true) errors.push(`${prefix}: pagamento sem aprovação formal`);
  return errors;
}

module.exports = { validatePayment };
