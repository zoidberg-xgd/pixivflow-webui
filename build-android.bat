@echo off
REM PixivFlow Android APK 构建脚本 (Windows)
REM 用于构建 Android 应用的 APK 文件

echo ======================================
echo PixivFlow Android APK 构建脚本
echo ======================================
echo.

REM 检查 Node.js
echo 检查 Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js 版本: %NODE_VERSION%

REM 检查 npm
echo 检查 npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 npm
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm 版本: %NPM_VERSION%

REM 检查 Java
echo 检查 Java...
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到 Java
    echo 请安装 JDK 17 或更高版本
    echo 推荐使用 OpenJDK: https://adoptium.net/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
echo [OK] Java 版本: %JAVA_VERSION%

REM 检查 Android SDK
echo 检查 Android SDK...
if "%ANDROID_HOME%"=="" (
    if "%ANDROID_SDK_ROOT%"=="" (
        echo [警告] 未设置 ANDROID_HOME 或 ANDROID_SDK_ROOT 环境变量
        echo.
        echo 请设置 ANDROID_HOME 环境变量指向您的 Android SDK 路径
        echo 例如: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        echo.
        echo 或安装 Android Studio: https://developer.android.com/studio
        pause
        exit /b 1
    ) else (
        echo [OK] Android SDK: %ANDROID_SDK_ROOT%
    )
) else (
    echo [OK] Android SDK: %ANDROID_HOME%
)

echo.
echo ======================================
echo 开始构建流程
echo ======================================
echo.

REM 步骤 1: 安装依赖
echo 步骤 1/5: 安装依赖...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo 依赖已安装,跳过...
)
echo [OK] 依赖安装完成
echo.

REM 步骤 2: 构建 Web 应用
echo 步骤 2/5: 构建 Web 应用...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Web 应用构建失败
    pause
    exit /b 1
)
echo [OK] Web 应用构建完成
echo.

REM 步骤 3: 检查/初始化 Android 项目
echo 步骤 3/5: 检查 Android 项目...
if not exist "android" (
    echo Android 项目不存在,正在初始化...
    call npx cap add android
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] Android 项目初始化失败
        pause
        exit /b 1
    )
    echo [OK] Android 项目初始化完成
) else (
    echo Android 项目已存在
)
echo.

REM 步骤 4: 同步到 Android 项目
echo 步骤 4/5: 同步到 Android 项目...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 同步失败
    pause
    exit /b 1
)
echo [OK] 同步完成
echo.

REM 步骤 5: 构建 APK
echo 步骤 5/5: 构建 APK...
cd android

echo.
echo 请选择构建类型:
echo 1) Debug APK (调试版本,可直接安装)
echo 2) Release APK (发布版本,需要签名)
set /p BUILD_TYPE="请输入选项 (1 或 2, 默认为 1): "
if "%BUILD_TYPE%"=="" set BUILD_TYPE=1

if "%BUILD_TYPE%"=="2" (
    echo 构建 Release APK...
    call gradlew.bat assembleRelease
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] Release APK 构建失败
        cd ..
        pause
        exit /b 1
    )
    
    set APK_PATH=app\build\outputs\apk\release\app-release-unsigned.apk
    if exist "!APK_PATH!" (
        echo.
        echo ======================================
        echo [OK] 构建成功!
        echo ======================================
        echo.
        echo APK 位置: android\!APK_PATH!
        echo.
        echo [注意] 这是一个未签名的 Release APK
        echo 在发布前需要进行签名,请参考 docs\ANDROID_BUILD_GUIDE.md
        echo.
        
        copy "!APK_PATH!" "..\pixivflow-release-unsigned.apk"
        echo 已复制到: pixivflow-release-unsigned.apk
    ) else (
        echo [错误] APK 文件未找到
        cd ..
        pause
        exit /b 1
    )
) else (
    echo 构建 Debug APK...
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] Debug APK 构建失败
        cd ..
        pause
        exit /b 1
    )
    
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
    if exist "!APK_PATH!" (
        echo.
        echo ======================================
        echo [OK] 构建成功!
        echo ======================================
        echo.
        echo APK 位置: android\!APK_PATH!
        echo.
        echo 这是一个 Debug APK,可以直接安装到设备上进行测试
        echo.
        
        copy "!APK_PATH!" "..\pixivflow-debug.apk"
        echo 已复制到: pixivflow-debug.apk
        echo.
        echo 安装方法:
        echo 1. 将 APK 文件传输到 Android 设备
        echo 2. 在设备上启用'未知来源'安装
        echo 3. 点击 APK 文件进行安装
        echo.
        echo 或使用 adb 安装:
        echo adb install pixivflow-debug.apk
    ) else (
        echo [错误] APK 文件未找到
        cd ..
        pause
        exit /b 1
    )
)

cd ..

echo.
echo ======================================
echo 构建流程完成!
echo ======================================
pause

