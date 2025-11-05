<#
  fix-expo-build.ps1
  Corrige build do Expo/Gradle ajustando JDK 17, Kotlin e Gradle.
#>

$ErrorActionPreference = "Stop"

function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err  { param($msg) Write-Host "[ERR ] $msg" -ForegroundColor Red }

# 0) Confere pasta
if (-not (Test-Path ".\package.json")) {
  Write-Err "Execute este script na raiz do projeto (onde fica package.json)."
  exit 1
}

# 1) Detecta JDK 17 automaticamente
$jvmCandidates = @(
  "C:\Program Files\Eclipse Adoptium\jdk-17.*\",
  "C:\Program Files\Microsoft\jdk-17.*\",
  "C:\Program Files\Java\jdk-17.*\"
)
$javaHome = $null
foreach ($pattern in $jvmCandidates) {
  $paths = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Sort-Object -Descending -Property Name
  if ($paths -and (Test-Path (Join-Path $paths[0].FullName "bin\java.exe"))) {
    $javaHome = $paths[0].FullName.TrimEnd('\')
    break
  }
}
if (-not $javaHome) {
  Write-Warn "JDK 17 não encontrado automaticamente. Configure manualmente se necessário."
} else {
  $env:JAVA_HOME = $javaHome
  $env:GRADLE_JAVA_HOME = $javaHome
  $env:Path = "$javaHome\bin;$env:Path"
  & java -version
  Write-Ok "JAVA_HOME definido para: $javaHome"
}

# 2) Verifica Gradle wrapper
$wrapperPath = ".\android\gradle\wrapper\gradle-wrapper.properties"
if (-not (Test-Path $wrapperPath)) {
  Write-Info "Gerando android/ via prebuild..."
  npx expo prebuild --clean
}

# 3) Fixar Gradle 8.7
if (Test-Path $wrapperPath) {
  Copy-Item $wrapperPath "$wrapperPath.bak" -Force
  $content = Get-Content $wrapperPath -Raw
  $content = $content -replace "distributionUrl=.*", "distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-bin.zip"
  Set-Content $wrapperPath $content -Encoding UTF8
  Write-Ok "Gradle fixado em 8.7"
}

# 4) Atualizar gradle.properties
$gradleProps = ".\android\gradle.properties"
if (-not (Test-Path $gradleProps)) { New-Item $gradleProps -ItemType File | Out-Null }
Copy-Item $gradleProps "$gradleProps.bak" -Force

$props = Get-Content $gradleProps -Raw
function Upsert-Prop($name, $value) {
  if ($props -match "^\s*$([regex]::Escape($name))\s*=") {
    $script:props = [regex]::Replace($props, "^\s*$([regex]::Escape($name))\s*=.*", "$name=$value", 'Multiline')
  } else {
    $script:props = ($props.TrimEnd() + "`n$name=$value`n")
  }
}

Upsert-Prop "kotlin.version" "2.0.21"
if ($javaHome) {
  $escaped = $javaHome -replace "\\", "\\"
  Upsert-Prop "org.gradle.java.home" $escaped
  Upsert-Prop "org.gradle.java.installations.auto-detect" "false"
  Upsert-Prop "org.gradle.java.installations.auto-download" "false"
}
Set-Content $gradleProps $props -Encoding UTF8
Write-Ok "gradle.properties atualizado."

# 5) Atualizar expo-modules-autolinking
Write-Info "Atualizando expo-modules-autolinking..."
npx expo install expo-modules-autolinking@latest

# 6) Limpar caches
Write-Info "Limpando caches..."
Get-Process java,gradle,adb,studio64,code -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force ".\.gradle" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\android\.gradle" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\android\build" -ErrorAction SilentlyContinue
Write-Ok "Caches limpos."

# 7) Iniciar build
Write-Info "Rodando build: npx expo run:android"
npx expo run:android
