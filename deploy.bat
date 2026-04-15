@echo off
chcp 65001 >nul
echo =========================================
echo  Citizen Grievance Portal - FULL DEPLOY
echo =========================================
echo.

cd /d "c:\Users\Admin\OneDrive - CloudMojo Tech Private Limited\Documents\react-projects\citizen-grievance-portal"

echo [Step 1/5] Removing test file and committing all code changes...
del /f testApi.js 2>nul
git add -A
git commit -m "fix: improve MongoDB connection caching, CORS for Vercel previews, env diagnostics"
git push
echo Done.
echo.

echo [Step 2/5] Setting BACKEND Vercel ENV VARS...
cd backend

echo. Removing old env vars (ignore errors)...
npx vercel@latest env rm MONGODB_URI production --yes 2>nul
npx vercel@latest env rm MONGODB_URI preview --yes 2>nul
npx vercel@latest env rm MONGODB_URI development --yes 2>nul
npx vercel@latest env rm JWT_SECRET production --yes 2>nul
npx vercel@latest env rm JWT_SECRET preview --yes 2>nul
npx vercel@latest env rm JWT_SECRET development --yes 2>nul
npx vercel@latest env rm NODE_ENV production --yes 2>nul

echo. Adding fresh env vars...
echo mongodb+srv://khanimran03466_db_user:yuU3PhBLR0I6yqhN@cluster0.hihyns6.mongodb.net/citizen-grievance-poc?appName=Cluster0 | npx vercel@latest env add MONGODB_URI production
echo mongodb+srv://khanimran03466_db_user:yuU3PhBLR0I6yqhN@cluster0.hihyns6.mongodb.net/citizen-grievance-poc?appName=Cluster0 | npx vercel@latest env add MONGODB_URI preview
echo mongodb+srv://khanimran03466_db_user:yuU3PhBLR0I6yqhN@cluster0.hihyns6.mongodb.net/citizen-grievance-poc?appName=Cluster0 | npx vercel@latest env add MONGODB_URI development
echo supersecret_poc_key_change_in_prod | npx vercel@latest env add JWT_SECRET production
echo supersecret_poc_key_change_in_prod | npx vercel@latest env add JWT_SECRET preview
echo supersecret_poc_key_change_in_prod | npx vercel@latest env add JWT_SECRET development
echo production | npx vercel@latest env add NODE_ENV production
echo Done.
echo.

echo [Step 3/5] Setting FRONTEND Vercel ENV VARS...
cd ..\frontend

npx vercel@latest env rm NEXT_PUBLIC_API_URL production --yes 2>nul
npx vercel@latest env rm NEXT_PUBLIC_API_URL preview --yes 2>nul
npx vercel@latest env rm NEXT_PUBLIC_API_URL development --yes 2>nul

echo https://citizen-grievance-backend.vercel.app | npx vercel@latest env add NEXT_PUBLIC_API_URL production
echo https://citizen-grievance-backend.vercel.app | npx vercel@latest env add NEXT_PUBLIC_API_URL preview
echo https://citizen-grievance-backend.vercel.app | npx vercel@latest env add NEXT_PUBLIC_API_URL development
echo Done.
echo.

echo [Step 4/5] Deploying BACKEND to production...
cd ..\backend
npx vercel@latest --prod --yes
echo Done.
echo.

echo [Step 5/5] Deploying FRONTEND to production...
cd ..\frontend
npx vercel@latest --prod --yes
echo Done.
echo.

echo =========================================
echo  ALL DONE!
echo.
echo  Backend health check:
echo  https://citizen-grievance-backend.vercel.app/api/health
echo.
echo  Frontend:
echo  https://citizen-grievance-portal-imc.vercel.app
echo =========================================
pause
