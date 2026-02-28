@echo off
set HOST=163.245.202.161
set USER=root
set PASS=SERVER+guide
set LOCAL_DB=prisma\dev.db
set REMOTE_DIR=/root/data

echo [1/3] Criando diretorio remoto...
plink -batch -ssh -l %USER% -pw "%PASS%" %HOST% "mkdir -p %REMOTE_DIR%"

echo [2/3] Enviando banco de dados local para a VM...
pscp -pw "%PASS%" "%LOCAL_DB%" %USER%@%HOST%:%REMOTE_DIR%/prod.db
if %errorlevel% neq 0 (
    echo Erro ao enviar o banco de dados.
    pause
    exit /b %errorlevel%
)

echo [3/3] Banco enviado com sucesso para %REMOTE_DIR%/prod.db!
pause
