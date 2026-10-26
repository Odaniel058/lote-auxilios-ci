const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { validateBatch } = require('./validateBatch');
const raw = fs.readFileSync('data/lote.json');
const batch = JSON.parse(raw.toString('utf8'));
const validation = validateBatch(batch);
fs.mkdirSync('dist', { recursive: true });
// Remover uma saída antiga impede que um lote reprovado reutilize uma liberação anterior.
if (fs.existsSync('dist/lote-liberado.json')) fs.unlinkSync('dist/lote-liberado.json');
const audit = {
  batchId: batch.metadata?.batchId,
  competence: batch.metadata?.competence,
  status: validation.errors.length ? 'REPROVADO' : 'APROVADO',
  paymentCount: Array.isArray(batch.payments) ? batch.payments.length : 0,
  total: validation.total,
  budgetLimit: batch.metadata?.budgetLimit,
  errors: validation.errors,
  warnings: validation.warnings,
  inputSha256: crypto.createHash('sha256').update(raw).digest('hex'),
  commit: process.env.GIT_COMMIT || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  buildNumber: process.env.BUILD_NUMBER || 'local',
  generatedAt: new Date().toISOString()
};
fs.writeFileSync('dist/auditoria.json', JSON.stringify(audit, null, 2) + '\n');
if (!validation.errors.length) fs.writeFileSync('dist/lote-liberado.json', JSON.stringify({ batchId: audit.batchId, competence: audit.competence, total: audit.total, inputSha256: audit.inputSha256, payments: batch.payments }, null, 2) + '\n');
console.log(`AUDITORIA GERADA: status=${audit.status}; erros=${audit.errors.length}; avisos=${audit.warnings.length}`);
