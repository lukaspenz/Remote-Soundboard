@echo off
REM Soundboard Portable - Package Creator
echo ========================================
echo Creating Portable Distribution Package
echo ========================================
echo.

REM Create portable directory
echo [1/5] Creating distribution folder...
if exist "Remote-Soundboard-Portable" rmdir /s /q "Remote-Soundboard-Portable"
mkdir "Remote-Soundboard-Portable"

REM Copy executable
echo [2/5] Copying executable...
copy "dist\soundboard.exe" "Remote-Soundboard-Portable\" >nul

REM Copy assets
echo [3/5] Copying web interface...
xcopy "public" "Remote-Soundboard-Portable\public\" /E /I /Q >nul

echo [4/5] Copying sounds folder...
xcopy "sounds" "Remote-Soundboard-Portable\sounds\" /E /I /Q >nul

REM Create README
echo [5/5] Creating README...
(
echo REMOTE SOUNDBOARD - PORTABLE EDITION
echo =====================================
echo.
echo QUICK START:
echo 1. Double-click "soundboard.exe" to start the server
echo 2. Open your browser to: http://localhost:3030
echo 3. Click "Network" to see the URL for remote devices
echo.
echo ADDING SOUNDS:
echo - Click "Manage Sounds" button in the app
echo - Upload files or add existing ones from the sounds folder
echo - Or manually place audio files in the "sounds" folder
echo.
echo PASSWORD:
echo - Default password for remote devices: soundboard123
echo - Host PC ^(localhost^) does not need password
echo - To change: Edit start.bat and set your password
echo.
echo REQUIREMENTS:
echo - Windows 10 or later
echo - No Node.js installation needed!
echo - Web browser ^(Chrome/Edge recommended^)
echo.
echo TROUBLESHOOTING:
echo - If port 3030 is busy, close the app and try again
echo - For remote access, ensure devices are on same network
echo - Check Windows Firewall if remote devices can't connect
echo - For password issues, see start.bat to set custom password
echo.
echo FEATURES:
echo - Remote triggering from phone/tablet
echo - Audio device selection ^(choose which speakers^)
echo - Sound management ^(add, rename, delete sounds^)
echo - File upload from browser
echo - Real-time sync across all devices
echo - Password protection for remote access
echo.
echo Enjoy your portable soundboard!
echo.
echo Version 1.0.0 - https://github.com/your-username/remote-soundboard
) > "Remote-Soundboard-Portable\README.txt"

REM Create start script with password option
(
echo @echo off
echo REM Set custom password here if desired
echo REM set SOUNDBOARD_PASSWORD=your_password_here
echo.
echo echo Starting Remote Soundboard...
echo soundboard.exe
) > "Remote-Soundboard-Portable\start.bat"

echo.
echo ========================================
echo Package created successfully!
echo ========================================
echo.
echo Location: Remote-Soundboard-Portable\
echo.
echo Contents:
echo   - soundboard.exe   ^(Main application^)
echo   - public\          ^(Web interface^)
echo   - sounds\          ^(Audio files^)
echo   - README.txt       ^(Instructions^)
echo   - start.bat        ^(Optional launcher^)
echo.
echo You can now copy the "Remote-Soundboard-Portable" folder
echo to any Windows PC and run it without installation!
echo.
pause
