pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
        DOCKER_IMAGE = 'hariprasad981/leaveapp:latest'
        SCANNER_HOME = "${tool 'SonarScanner'}" // Correctly refer to sonar-scanner
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Hariprasad-791/Leave-Management-Sys.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {  // Must match Jenkins global config name
                    sh '''
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=leave-manage \
                        -Dsonar.projectName="leave manage" \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t leaveapp:latest .'
                sh 'docker tag leaveapp:latest $DOCKER_IMAGE'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_IMAGE
                    '''
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                    docker rm -f leaveapp || true
                    docker run -d --name leaveapp -p 5000:5000 $DOCKER_IMAGE
                '''
            }
        }
    }
}
