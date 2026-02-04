@echo off
REM Script de deployment do AWS WAF para NoraHub (Windows)
REM Execute este script após configurar suas credenciais AWS

setlocal enabledelayedexpansion

echo 🔒 Iniciando deployment do AWS WAF para NoraHub...

REM Verificar se AWS CLI está instalado
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/
    exit /b 1
)

REM Verificar credenciais AWS
echo 🔑 Verificando credenciais AWS...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Credenciais AWS não configuradas. Execute: aws configure
    exit /b 1
)

REM Nome da stack CloudFormation
set STACK_NAME=norahub-waf-security
set TEMPLATE_FILE=aws-waf-cloudformation.json
set REGION=us-east-1

echo 📦 Criando/Atualizando stack CloudFormation: %STACK_NAME%

REM Verificar se stack já existe
aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🆕 Criando nova stack...
    aws cloudformation create-stack ^
        --stack-name %STACK_NAME% ^
        --template-body file://%TEMPLATE_FILE% ^
        --region %REGION% ^
        --capabilities CAPABILITY_IAM
    
    echo ⏳ Aguardando criação da stack...
    aws cloudformation wait stack-create-complete ^
        --stack-name %STACK_NAME% ^
        --region %REGION%
) else (
    echo 🔄 Atualizando stack existente...
    aws cloudformation update-stack ^
        --stack-name %STACK_NAME% ^
        --template-body file://%TEMPLATE_FILE% ^
        --region %REGION% ^
        --capabilities CAPABILITY_IAM
    
    if %ERRORLEVEL% EQU 0 (
        echo ⏳ Aguardando atualização da stack...
        aws cloudformation wait stack-update-complete ^
            --stack-name %STACK_NAME% ^
            --region %REGION%
    ) else (
        echo ℹ️  Nenhuma atualização necessária ou erro na atualização
    )
)

echo.
echo ✅ WAF deployment concluído com sucesso!
echo.
echo 📊 Informações do WAF:
aws cloudformation describe-stacks ^
    --stack-name %STACK_NAME% ^
    --region %REGION% ^
    --query "Stacks[0].Outputs" ^
    --output table

echo.
echo 🔗 Próximos passos:
echo 1. Anote o WebACL ARN acima
echo 2. Configure CloudFront para usar este WAF
echo 3. Configure o domínio personalizado
echo 4. Monitore os logs em CloudWatch: /aws/waf/norahub
echo.
echo 📚 Documentação: https://docs.aws.amazon.com/waf/

pause
