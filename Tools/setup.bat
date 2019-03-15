@echo off

for /f "delims=" %%i in ('python -V') do set python=%%i
set python=%python:~0,10%

if /I "%python%" == "Python 3.7" (
    if EXIST pyenv\\pyvenv.cfg (
        echo Python virtual environment already exists, if there's something wrong with it delete it and run setup again.
    ) else (
        python -m venv pyenv
        pyenv\\Scripts\\activate.bat
        python -m pip install --upgrade pip
        pip install --upgrade setuptools
        pip install -r requirements.txt
    )
) else (
    echo "Python 3.7 not found. Is it installed and added to PATH?"
)