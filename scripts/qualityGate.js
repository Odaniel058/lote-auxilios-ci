const fs = require('node:fs');
try {
  const audit = JSON.parse(fs.readFileSync(process.argv[2] || 'dist/auditoria.json', 'utf8'));
  const reasons = [];
  if (audit.status !== 'APROVADO') reasons.push('auditoria não aprovada');
  if (!Array.isArray(audit.errors) || audit.errors.length) reasons.push('erros críticos ou lista de erros inválida');
  if (!Number.isInteger(audit.paymentCount) || audit.paymentCount < 5) reasons.push('lote abaixo do volume mínimo de controle');
  if (!Number.isFinite(audit.total) || audit.total <= 0) reasons.push('total financeiro inválido');
  if (!Number.isFinite(audit.budgetLimit) || audit.total > audit.budgetLimit) reasons.push('limite orçamentário inválido ou excedido');
  if (!/^[a-f0-9]{64}$/.test(audit.inputSha256 || '')) reasons.push('hash de entrada ausente ou inválido');
  if (reasons.length) throw new Error(reasons.join('; '));
  console.log(`QUALITY GATE FINANCEIRO APROVADO: LOTE=${audit.batchId}; TOTAL=${audit.total.toFixed(2)}; HASH=${audit.inputSha256}`);
} catch (error) {
  console.error(`QUALITY GATE FINANCEIRO REPROVADO: ${error.message}`);
  process.exitCode = 1;
}
