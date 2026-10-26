pipeline {
    agent any
    parameters {
        choice(name: 'DESTINO', choices: ['HOMOLOGACAO', 'PRODUCAO'], description: 'Destino simulado do lote acadêmico.')
    }
    options {
        skipDefaultCheckout(true)
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }
    environment {
        APP_NAME = 'lote-auxilios-ci'
        AUDIT_FILE = 'dist/auditoria.json'
        RELEASE_FILE = 'dist/lote-liberado.json'
    }
    stages {
        stage('1. Sincronizar código') {
            steps {
                checkout scm
                sh 'git rev-parse HEAD; git log -1 --pretty=%s'
                dir('dist') { deleteDir() }
                dir('release') { deleteDir() }
            }
        }
        stage('2. Validar lote') { steps { sh 'npm run validate' } }
        stage('3. Executar testes') { steps { sh 'npm test' } }
        stage('4. Gerar auditoria') { steps { sh 'npm run audit' } }
        stage('5. Quality Gate financeiro') { steps { sh 'npm run gate' } }
        stage('6. Revisar evidências') {
            steps { sh 'cat "$AUDIT_FILE"; sha256sum data/lote.json "$RELEASE_FILE"' }
        }
        stage('7. Aprovação para produção') {
            when { expression { params.DESTINO == 'PRODUCAO' } }
            steps {
                script {
                    def audit = new groovy.json.JsonSlurperClassic().parseText(readFile(env.AUDIT_FILE))
                    input message: "Laboratório: liberar lote ${audit.batchId}, total BRL ${audit.total}, commit ${audit.commit} para PRODUCAO simulada?", ok: 'LIBERAR LOTE'
                }
            }
        }
        stage('8. Publicar lote') {
            when { expression { params.DESTINO == 'PRODUCAO' } }
            steps {
                sh '''
                    mkdir -p release
                    cp "$RELEASE_FILE" "release/lote-${BUILD_NUMBER}.json"
                    cp "$AUDIT_FILE" "release/auditoria-${BUILD_NUMBER}.json"
                '''
                archiveArtifacts artifacts: 'release/**', fingerprint: true
            }
        }
        stage('9. Arquivar homologação') {
            when { expression { params.DESTINO == 'HOMOLOGACAO' } }
            steps {
                echo 'Homologação: nenhum arquivo liberado para produção.'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }
    post {
        success { echo "PROCESSO APROVADO — destino=${params.DESTINO}" }
        failure { echo 'PROCESSO REPROVADO — lote não liberado' }
        aborted { echo 'PROCESSO CANCELADO — consulte o Console' }
        always { echo "RESULTADO FINAL: ${currentBuild.currentResult}" }
    }
}
