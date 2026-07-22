pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'cinema-booking'
        JWT_SECRET = 'cinema-booking-local-secret'
        CORS_ORIGIN = 'http://localhost:8084'
    }

    stages {
        stage('Checkout Deploy Branch') {
            steps {
                git branch: 'Jenkis',
                    credentialsId: 'github-pat',
                    url: 'https://github.com/kamilaizzati/cinema-booking'
            }
        }

        stage('Build Images') {
            steps {
                echo 'Building Docker images...'
                bat 'docker compose build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                bat returnStatus: true, script: 'docker compose down --remove-orphans'
                bat returnStatus: true, script: 'docker rm -f cinema-backend cinema-frontend cinema-mongo cinema-mongodb'
                bat 'docker compose up -d'
            }
        }

        stage('Smoke Test') {
            steps {
                echo 'Checking services...'
                sleep time: 20, unit: 'SECONDS'
                bat 'docker compose ps'
                bat 'curl.exe -f http://localhost:8084/api/movies'
            }
        }
    }

    post {
        always {
            bat returnStatus: true, script: 'docker compose ps'
        }
        failure {
            echo 'Pipeline gagal. Cek log di atas untuk detail error.'
            bat returnStatus: true, script: 'docker compose logs --tail=120'
        }
        success {
            echo 'Pipeline berhasil. Aplikasi tersedia di http://localhost:8084'
        }
    }
}
