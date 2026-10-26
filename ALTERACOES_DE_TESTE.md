# Alterações de teste

Dados inteiramente fictícios, usados somente no laboratório. A produção desta
atividade é a cópia de arquivos dentro do Jenkins; não realiza pagamentos.

## Baseline em homologação
Build #3: SUCCESS em HOMOLOGACAO, conforme print do Console. A auditoria ainda
registrava commit local, corrigido no commit 291ecd0. Auditoria do Build #4
registra 291ecd0cddf9a3c49d3567057c1821b3e6c8bbb7, cinco pagamentos, total
6230, limite 20000, zero erros e zero avisos. Hash de entrada conferido com
data/lote.json. Resultado do Build #2 ainda não informado.

## Falha C: beneficiário duplicado
Commit 8a69ddd: quinto pagamento alterado para BEN-001, repetindo o primeiro.
Build #5 bloqueado em 2. Validar lote. Console: pagamento 5: beneficiário
duplicado: BEN-001. Total 6230.00. Testes e auditoria ignorados por falha anterior.
Regra violada: beneficiário único por lote. Risco: pagamento em duplicidade.
Evidência: print do Console enviado pelo operador antes da correção.
Correção: restaurar BEN-005 no quinto pagamento. Recuperação no Jenkins pendente.

## Falha D: orçamento excedido
Pendente: reduzir budgetLimit para 5000, executar e registrar antes de corrigir.

## Aprovação para produção
Pendente: executar com DESTINO=PRODUCAO, revisar evidências e confirmar manualmente.
