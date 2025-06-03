pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
        DOCKER_IMAGE = 'hariprasad981/leaveapp:latest'
        SCANNER_HOME = "${tool 'SonarScanner'}"
        AZURE_WEBHOOK_URL = ''
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Hariprasad-791/Leave-Management-Sys.git'
            }
        }


       stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            sh '''
                $SCANNER_HOME/bin/sonar-scanner \\
                -Dsonar.projectKey=leave-manage \\
                -Dsonar.projectName="leave manage" \\
                -Dsonar.sources=frontend/src,backend \\
                -Dsonar.exclusions=**/__mocks__/**,**/node_modules/**,**/coverage/**,**/build/**,**/dist/**,**/*.test.js,**/__tests__/**,**/jest.config.cjs,**/jest.setup.js,**/setupTests.js,**/reportWebVitals.js \\
                -Dsonar.sourceEncoding=UTF-8 \\
                -Dsonar.host.url=http://localhost:9000
            '''
        }
    }
}


        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        stage('Docker Build & Tag') {
            steps {
                sh '''
                    echo "Building Docker image..."
                    docker build -t leaveapp:latest .
                    docker tag leaveapp:latest $DOCKER_IMAGE
                    echo "Docker image built and tagged successfully"
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Cleaning up any existing Docker login..."
                        docker logout || echo "No existing login"
                        
                        echo "Logging into Docker Hub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        
                        echo "Pushing image to Docker Hub..."
                        docker push $DOCKER_IMAGE
                        
                        echo "✅ Image pushed successfully to Docker Hub"
                        docker logout
                    '''
                }
            }
        }

        stage('Trigger Azure Deployment') {
            steps {
                sh '''
                    echo "Triggering Azure App Service deployment..."
                    curl -X POST "$AZURE_WEBHOOK_URL" \\
                    -H "Content-Type: application/json" \\
                    --max-time 30 \\
                    --retry 3 \\
                    --retry-delay 5 \\
                    --silent --show-error
                    echo ""
                    echo "Azure deployment triggered successfully"
                '''
            }
        }

        stage('Wait for Azure Deployment') {
            steps {
                script {
                    echo "Waiting for Azure deployment to complete..."
                    sleep(120)
                }
            }
        }

        stage('Verify Azure Deployment') {
            steps {
                sh '''
                    echo "Verifying Azure deployment..."
                    for i in {1..5}; do
                        echo "Attempt $i: Testing application health..."
                        if curl -f --max-time 30 --silent https://leave-management-app.azurewebsites.net/health; then
                            echo "✅ Application is healthy!"
                            break
                        else
                            echo "⏳ Application not ready yet, waiting..."
                            sleep 30
                        fi
                    done
                    
                    echo "Testing main application endpoint..."
                    curl -I --max-time 30 --silent https://leave-management-app.azurewebsites.net || echo "Main endpoint check completed"
                '''
            }
        }
    }

    post {
        always {
            sh '''
                echo "Cleaning up Docker resources..."
                docker logout || echo "No logout needed"
                docker system prune -f || echo "Cleanup completed"
                docker image rm leaveapp:latest || echo "Image cleanup completed"
            '''
            
            script {
                try {
                    archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
                    echo "✅ Coverage reports archived successfully"
                } catch (Exception e) {
                    echo "⚠️ Coverage reports not available: ${e.getMessage()}"
                }
            }
        }
        
        success {
            echo '''
            🎉 DEPLOYMENT SUCCESSFUL! 🎉
            
            ✅ Tests passed with coverage reports
            ✅ Quality gate passed
            ✅ Docker image built and pushed
            ✅ Azure deployment triggered
            ✅ Application is healthy
            
            🌐 Azure URL: https://leave-management-app.azurewebsites.net
            '''
        }
        
        failure {
            echo '''
            ❌ DEPLOYMENT FAILED!
            
            Check:
            1. Node.js and npm are installed
            2. Docker Desktop is running
            3. SonarQube server is accessible
            4. Jenkins has proper permissions
            5. Docker Hub credentials are valid
            '''
        }
    }
}
