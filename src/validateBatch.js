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

function validateBatch(batch) {
  const errors = [], warnings = [];
  if (!batch || typeof batch !== 'object' || !batch.metadata || typeof batch.metadata !== 'object' || Array.isArray(batch.metadata)) return { errors: ['metadata ausente'], warnings, total: 0 };
  if (batch.metadata.status !== 'APROVADO_PARA_PROCESSAMENTO') errors.push(`status do lote inválido: ${batch.metadata.status}`);
  for (const field of ['batchId', 'competence']) {
    if (typeof batch.metadata[field] !== 'string' || !batch.metadata[field].trim()) errors.push(`metadata.${field} ausente`);
  }
  if (!Array.isArray(batch.payments) || !batch.payments.length) return { errors: [...errors, 'lista payments ausente ou vazia'], warnings, total: 0 };
  const ids = new Set();
  let cents = 0;
  batch.payments.forEach((payment, index) => {
    errors.push(...validatePayment(payment, index));
    if (!payment || typeof payment !== 'object') return;
    if (ids.has(payment.beneficiaryId)) errors.push(`pagamento ${index + 1}: beneficiário duplicado: ${payment.beneficiaryId}`);
    ids.add(payment.beneficiaryId);
    if (Number.isFinite(payment.amount)) cents += Math.round(payment.amount * 100);
    if (Number.isFinite(payment.amount) && payment.amount >= 4000) warnings.push(`pagamento ${index + 1}: valor alto requer revisão adicional`);
  });
  const total = cents / 100;
  const limit = batch.metadata.budgetLimit;
  if (!Number.isFinite(limit) || limit <= 0) errors.push('metadata.budgetLimit inválido');
  else if (total > limit) errors.push(`orçamento excedido: total ${total.toFixed(2)} > limite ${limit.toFixed(2)}`);
  return { errors, warnings, total };
}

if (require.main === module) {
  try {
    const batch = JSON.parse(fs.readFileSync(process.argv[2] || 'data/lote.json', 'utf8'));
    const result = validateBatch(batch);
    console.log(`LOTE=${batch.metadata?.batchId}; TOTAL=${result.total.toFixed(2)}`);
    result.warnings.forEach(w => console.log(`AVISO: ${w}`));
    if (result.errors.length) {
      console.error('VALIDAÇÃO REPROVADA — lote não liberado');
      result.errors.forEach(e => console.error(` - ${e}`));
      process.exitCode = 1;
    } else console.log('VALIDAÇÃO APROVADA');
  } catch (error) {
    console.error(`VALIDAÇÃO REPROVADA: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = { validatePayment, validateBatch };
