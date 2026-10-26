# Lote de auxílios CI

Caso 2 do laboratório Jenkins. Todos os nomes e dados bancários são fictícios.
Produção significa copiar arquivos para release/; nenhum pagamento real é feito.

## Regras

ID BEN-999, beneficiário único, valor de R$ 0,01 até R$ 5.000,00,
dados bancários preenchidos, aprovação formal e soma dentro do orçamento.
Lote inicial: cinco pagamentos, total R$ 6.230,00, limite R$ 20.000,00.

## Executar

Node.js 22 ou superior. Sem dependências externas.

```sh
npm run ci
```

Comandos: validate, test, audit e gate. A auditoria registra o SHA-256 da entrada,
commit, número do Build, total, erros e avisos. Execuções locais usam local.

## Jenkins

Criar tarefa Pipeline, definição Pipeline script from SCM, SCM Git,
URL https://github.com/Odaniel058/lote-auxilios-ci.git, branch */main,
Script Path Jenkinsfile. Agente Linux com Node.js e Git.

Primeiro executar HOMOLOGACAO. Conferir SUCCESS e dist/auditoria.json e
dist/lote-liberado.json arquivados. As etapas de produção devem ser ignoradas.
Somente após registrar a baseline, provocar as falhas controladas do roteiro.
PRODUCAO exige aprovação humana depois dos controles automáticos.

Nenhum Build Jenkins deste projeto foi comprovado ainda.
