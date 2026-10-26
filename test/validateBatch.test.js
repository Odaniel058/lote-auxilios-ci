const test = require('node:test');
const assert = require('node:assert/strict');
const { validateBatch } = require('../src/validateBatch');
const validBatch = () => ({
  metadata: { batchId: 'TESTE', competence: '2026-10', budgetLimit: 20000, status: 'APROVADO_PARA_PROCESSAMENTO' },
  payments: [1, 2, 3, 4, 5].map(n => ({ beneficiaryId: `BEN-00${n}`, name: `Pessoa fictícia ${n}`, amount: 1000, bank: '001', agency: '1234', account: '0000-0', approved: true }))
});
test('aprova lote consistente e calcula total', () => {
  const result = validateBatch(validBatch());
  assert.deepEqual(result.errors, []);
  assert.equal(result.total, 5000);
});
test('rejeita beneficiário duplicado', () => {
  const b = validBatch(); b.payments[4].beneficiaryId = 'BEN-001';
  assert.match(validateBatch(b).errors.join('\n'), /pagamento 5: beneficiário duplicado/);
});
for (const amount of [0, -1, 0.001, 5000.01, 6000, '1000', null]) {
  test(`rejeita valor inválido ${amount}`, () => {
    const b = validBatch(); b.payments[0].amount = amount;
    assert.match(validateBatch(b).errors.join('\n'), /valor deve estar/);
  });
}
test('aceita limites individuais 0,01 e 5000 e orçamento exato', () => {
  const b = validBatch(); b.payments[0].amount = 0.01; b.payments[1].amount = 5000;
  b.metadata.budgetLimit = 8000.01;
  assert.deepEqual(validateBatch(b).errors, []);
  assert.equal(validateBatch(b).total, 8000.01);
});
test('rejeita estouro de orçamento', () => {
  const b = validBatch(); b.metadata.budgetLimit = 4999;
  assert.match(validateBatch(b).errors.join('\n'), /orçamento excedido/);
});
test('exige aprovação booleana verdadeira', () => {
  for (const approved of [false, 'true', 1, null]) {
    const b = validBatch(); b.payments[0].approved = approved;
    assert.match(validateBatch(b).errors.join('\n'), /sem aprovação formal/);
  }
});
test('rejeita dados bancários vazios', () => {
  for (const field of ['bank', 'agency', 'account']) {
    const b = validBatch(); b.payments[0][field] = ' ';
    assert.match(validateBatch(b).errors.join('\n'), new RegExp(field));
  }
});
test('rejeita ID fora do padrão', () => {
  const b = validBatch(); b.payments[0].beneficiaryId = 'BEN-1';
  assert.match(validateBatch(b).errors.join('\n'), /padrão BEN-999/);
});
test('rejeita status do lote inválido', () => {
  const b = validBatch(); b.metadata.status = 'PENDENTE';
  assert.match(validateBatch(b).errors.join('\n'), /status do lote inválido/);
});
test('rejeita estruturas inválidas sem lançar exceção', () => {
  for (const b of [null, {}, { metadata: {} }, { metadata: {}, payments: [] }]) assert.ok(validateBatch(b).errors.length);
  const b = validBatch(); b.payments[0] = null;
  assert.match(validateBatch(b).errors.join('\n'), /pagamento inválido/);
});
test('avisa sobre valor alto sem reprovar pagamento válido', () => {
  const b = validBatch(); b.payments[0].amount = 4000;
  const result = validateBatch(b);
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 1);
});
