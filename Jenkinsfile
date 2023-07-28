def imageName = 'paulappz/quote-web'
def registry = '570942461061.dkr.ecr.eu-west-2.amazonaws.com' 
def region = 'eu-west-2'

node('workers'){
try {
    stage('Checkout'){
        checkout scm
        notifySlack('STARTED')
    }
    
    //  def imageTest= docker.build("${imageName}-test", "-f Dockerfile.test .")

   stage('Quality Tests'){
   //     sh "docker run --rm ${imageName}-test npm run lint"
    }

    stage('Unit Tests'){
    //    sh "docker run --rm -v $PWD/coverage:/app/coverage ${imageName}-test npm run test"
    //    publishHTML (target: [
    //        allowMissing: false,
    //        alwaysLinkToLastBuild: false,
    //        keepAll: true,
    //        reportDir: "$PWD/coverage/marketplace",
    //        reportFiles: "index.html",
    //        reportName: "Coverage Report"
    //    ])
    }
    
    stage('Static Code Analysis'){
        withSonarQubeEnv('sonarqube') {
            sh 'sonar-scanner'
         }
    }

    stage("Quality Gate"){
        timeout(time: 5, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
                error "Pipeline aborted due to quality gate failure: ${qg.status}"
            }
        }
    }
    
    stage('Build'){
       sh "aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${registry}/${imageName}"
        if (env.BRANCH_NAME == 'develop') {
                sh "docker build --build-arg ENVIRONMENT=sandbox --tag ${imageName}:develop ."
            }
        if (env.BRANCH_NAME == 'preprod') {
                sh "docker build --build-arg ENVIRONMENT=staging --tag ${imageName}:preprod ."
            }
        if (env.BRANCH_NAME == 'master') {
                sh "docker build --build-arg ENVIRONMENT=production --tag ${imageName}:master ."
            }  
    }
    
        
    stage('Push'){
         if (env.BRANCH_NAME == 'develop') {
                sh " docker tag ${imageName}:develop ${registry}/${imageName}:develop"
                sh "docker push ${registry}/${imageName}:develop"
            }
         if (env.BRANCH_NAME == 'preprod') {
                sh " docker tag ${imageName}:preprod ${registry}/${imageName}:preprod"
                sh "docker push ${registry}/${imageName}:preprod"
            }
         if (env.BRANCH_NAME == 'master') {
                sh " docker tag ${imageName}:master ${registry}/${imageName}:master" 
                sh "docker push ${registry}/${imageName}:master"
                
            }
    }

    stage('Analyze'){
     def scannedImage = ''
        if (env.BRANCH_NAME == 'develop') {
                scannedImage = "${registry}/${imageName}:develop"
            }
         if (env.BRANCH_NAME == 'preprod') {
                scannedImage = "${registry}/${imageName}:preprod"
            }
         if (env.BRANCH_NAME == 'master') {
                scannedImage = "${registry}/${imageName}:master"
            }
             writeFile file: 'images', text: scannedImage
             anchore name: 'images'
        }
        
    stage('Deploy'){
        if(env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'preprod'){
                build job: "quote-microservice-deployments/${env.BRANCH_NAME}"
        }
        if(env.BRANCH_NAME == 'master'){
                timeout(time: 2, unit: "HOURS") {
                input message: "Approve Deploy?", ok: "Yes"
        }
                build job: "quote-microservice-deployments/master"
            }
        }
}
        catch(e){
        currentBuild.result = 'FAILED'
        throw e
    } finally {
        notifySlack(currentBuild.result)
    }
}

def notifySlack(String buildStatus){
    buildStatus =  buildStatus ?: 'SUCCESSFUL'
    def colorCode = '#FF0000'
    def subject = "Name: '${env.JOB_NAME}'\nStatus: ${buildStatus}\nBuild ID: ${env.BUILD_NUMBER}"
    def summary = "${subject}\nMessage: ${commitMessage()}\nAuthor: ${commitAuthor()}\nURL: ${env.BUILD_URL}"

    if (buildStatus == 'STARTED') {
        colorCode = '#546e7a'
    } else if (buildStatus == 'SUCCESSFUL') {
        colorCode = '#2e7d32'
    } else {
        colorCode = '#c62828c'
    }

    slackSend (color: colorCode, message: summary)
}


def commitAuthor(){
    sh 'git show -s --pretty=%an > .git/commitAuthor'
    def commitAuthor = readFile('.git/commitAuthor').trim()
    sh 'rm .git/commitAuthor'
    commitAuthor
}

def commitID() {
    sh 'git rev-parse HEAD > .git/commitID'
    def commitID = readFile('.git/commitID').trim()
    sh 'rm .git/commitID'
    commitID
}

def commitMessage() {
    sh 'git log --format=%B -n 1 HEAD > .git/commitMessage'
    def commitMessage = readFile('.git/commitMessage').trim()
    sh 'rm .git/commitMessage'
    commitMessage
}
