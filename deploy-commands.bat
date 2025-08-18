@echo off
echo 🚀 DEPLOYING MR. SPRINKLE TO GITHUB...
echo.

cd "C:\Users\wette\OneDrive\Desktop\Mr.Sprinkle"

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Complete Mr. Sprinkle website - safety policies, mold form, SMS system ready"

echo Pushing to GitHub...
git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo Next steps:
echo 1. Go to your GitHub repository
echo 2. Click Settings tab
echo 3. Scroll to Pages section
echo 4. Set Source to "Deploy from a branch"
echo 5. Select "main" branch and "root" folder
echo 6. Click Save
echo.
echo Your site will be live at: https://yourusername.github.io/Mr.Sprinkle
echo.
pause