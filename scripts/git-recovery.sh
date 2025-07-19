#!/bin/bash

echo "🔍 Verificando status atual do repositório..."

# Verifica o status atual
git status

echo ""
echo "📋 Últimos commits:"
git log --oneline -10

echo ""
echo "🌿 Branches disponíveis:"
git branch -a

echo ""
echo "📊 Diferenças do último commit:"
git diff HEAD~1

echo ""
echo "🔄 Opções de recuperação:"
echo "1. git reset --soft HEAD~1  (desfaz último commit, mantém mudanças)"
echo "2. git reset --hard HEAD~1  (desfaz último commit e mudanças)"
echo "3. git revert HEAD          (cria novo commit desfazendo o último)"
echo "4. git checkout HEAD~1 -- . (restaura arquivos do commit anterior)"
