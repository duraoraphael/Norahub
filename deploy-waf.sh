#!/bin/bash

# Script de deployment do AWS WAF para NoraHub
# Execute este script após configurar suas credenciais AWS

set -e

echo "🔒 Iniciando deployment do AWS WAF para NoraHub..."

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar credenciais AWS
echo "🔑 Verificando credenciais AWS..."
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo "❌ Credenciais AWS não configuradas. Execute: aws configure"
    exit 1
}

# Nome da stack CloudFormation
STACK_NAME="norahub-waf-security"
TEMPLATE_FILE="aws-waf-cloudformation.json"
REGION="us-east-1"  # WAF para CloudFront deve ser em us-east-1

echo "📦 Criando/Atualizando stack CloudFormation: $STACK_NAME"

# Verificar se stack já existe
STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION 2>&1 || true)

if echo "$STACK_EXISTS" | grep -q "does not exist"; then
    echo "🆕 Criando nova stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $REGION \
        --capabilities CAPABILITY_IAM
    
    echo "⏳ Aguardando criação da stack..."
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
else
    echo "🔄 Atualizando stack existente..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $REGION \
        --capabilities CAPABILITY_IAM || {
        if [ $? -eq 254 ]; then
            echo "ℹ️  Nenhuma atualização necessária"
        else
            exit 1
        fi
    }
    
    echo "⏳ Aguardando atualização da stack..."
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION 2>/dev/null || true
fi

# Obter outputs
echo ""
echo "✅ WAF deployment concluído com sucesso!"
echo ""
echo "📊 Informações do WAF:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "🔗 Próximos passos:"
echo "1. Anote o WebACL ARN acima"
echo "2. Configure CloudFront para usar este WAF"
echo "3. Configure o domínio personalizado"
echo "4. Monitore os logs em CloudWatch: /aws/waf/norahub"
echo ""
echo "📚 Documentação: https://docs.aws.amazon.com/waf/"
