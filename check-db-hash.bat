@echo off
set HOST=163.245.202.161
set USER=root
set PASS=SERVER+guide
set LOCAL_DB=prisma\dev.db
set REMOTE_DB=/root/data/prod.db

echo ===== LOCAL =====
echo Arquivo: %LOCAL_DB%
for %%I in ("%LOCAL_DB%") do echo Tamanho: %%~zI bytes
certutil -hashfile "%LOCAL_DB%" SHA256 | findstr /R /V "hash|CertUtil"

echo.
echo ===== VM =====
echo Arquivo: %REMOTE_DB%
plink -batch -ssh -l %USER% -pw "%PASS%" %HOST% "ls -l %REMOTE_DB% && (command -v sha256sum >/dev/null 2>&1 && sha256sum %REMOTE_DB% || (command -v md5sum >/dev/null 2>&1 && md5sum %REMOTE_DB%))"

echo.
echo Se os hashes forem iguais, os bancos sao identicos.
pause
