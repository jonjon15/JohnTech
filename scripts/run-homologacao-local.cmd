@echo off
REM Script para rodar o fluxo de homologação Bling localmente
REM Certifique-se de que o .env.local está configurado corretamente

npx tsx scripts/bling-homologacao-flow.ts

pause
