# ==============================================================================
# Bundle Useful Skills — Fast Universal Installer (Windows PowerShell)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=== Bundle Useful Skills: Fast Installer ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python version (>= 3.10)
$PythonCmd = ""
foreach ($cmd in @("python", "py")) {
    try {
        $verStr = & $cmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
        if ($verStr) {
            $parts = $verStr.Trim().Split(".")
            if ([int]$parts[0] -ge 3 -and [int]$parts[1] -ge 10) {
                $PythonCmd = $cmd
                break
            }
        }
    } catch {
        # ignore and continue
    }
}

if (-not $PythonCmd) {
    Write-Host "[ERROR] Python 3.10+ is required, but not found." -ForegroundColor Red
    Write-Host "Please install Python 3.10 or later from https://www.python.org or winget install Python.Python.3.12"
    exit 1
}

$pyVer = & $PythonCmd --version
Write-Host "[OK] Found Python: $pyVer ($PythonCmd)" -ForegroundColor Green

# 2. Determine installation location
$InstallDir = Join-Path $env:USERPROFILE ".bundle-useful-skills"
$RepoUrl = "https://github.com/ammasyaa/bundle-useful-skills.git"

if ((Test-Path "router\SKILL.md") -and (Test-Path "scripts\install.py")) {
    $RepoDir = (Get-Location).Path
    Write-Host "[OK] Running from local repository: $RepoDir" -ForegroundColor Green
} else {
    if (Test-Path (Join-Path $InstallDir ".git")) {
        Write-Host "--> Updating existing repository at $InstallDir..." -ForegroundColor Cyan
        git -C $InstallDir pull --quiet
    } else {
        Write-Host "--> Cloning repository to $InstallDir..." -ForegroundColor Cyan
        git clone --depth 1 $RepoUrl $InstallDir --quiet
    }
    $RepoDir = $InstallDir
}

# 3. Register with all detected AI agents
Write-Host "`n--> Registering with detected AI agent platforms..." -ForegroundColor Cyan
& $PythonCmd (Join-Path $RepoDir "scripts\install.py") --target all

# 4. Install global CLI command 'bus'
$BinDir = Join-Path $env:USERPROFILE ".local\bin"
if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

$BusCmdPath = Join-Path $BinDir "bus.cmd"
$ScriptRoutePath = Join-Path $RepoDir "scripts\route.py"

$cmdContent = "@echo off`r`n`"$PythonCmd`" `"$ScriptRoutePath`" %*"
Set-Content -Path $BusCmdPath -Value $cmdContent -Force

Write-Host "[OK] Created global CLI command: $BusCmdPath" -ForegroundColor Green

# Check if ~/.local/bin is in PATH
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$BinDir*") {
    Write-Host "`n[NOTE] Adding $BinDir to your User PATH environment variable..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$BinDir", "User")
    $env:Path = "$env:Path;$BinDir"
    Write-Host "[OK] Added to PATH! (Restart existing terminals if 'bus' is not recognized immediately)" -ForegroundColor Green
}

Write-Host "`n[SUCCESS] Installation Complete!" -ForegroundColor Green
Write-Host "Try routing a task:"
Write-Host '  bus "Build a Next.js app with Supabase and Tailwind"' -ForegroundColor Yellow
Write-Host ""
