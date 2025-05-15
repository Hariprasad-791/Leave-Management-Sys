pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Hariprasad-791/Leave-Management-Sys.git'
            }
        }


        stage('Docker Build') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'dockerhub-creds') {
                        sh 'docker build -t leaveapp:latest .'
                        sh 'docker tag leaveapp:latest hariprasad981/leaveapp:latest'
                    }
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'dockerhub-creds') {
                        sh 'docker push hariprasad981/leaveapp:latest'
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    sh 'docker rm -f leaveapp || true'
                    sh 'docker run -d --name leaveapp -p 5000:5000 hariprasad981/leaveapp:latest'
                }
            }
        }
    }
}
