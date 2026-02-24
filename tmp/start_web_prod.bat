@echo off
REM Start web production server with required env vars for NextAuth
SET NEXTAUTH_SECRET=dev_secret_change_me
SET NEXTAUTH_URL=http://localhost:4000
cd /d D:\amoravibe
yarn workspace web start -p 4000
