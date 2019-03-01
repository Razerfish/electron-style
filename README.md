# pytorch-neural-style-gui
An Electron app for the pytorch implementation of neural style. Name is a placeholder.

# Requirements
```
Python 3.7 64 bit
Node JS 8.12
CUDA 9.0 compatible GPU (for GPU support)
(recommended) git bash
(recommended) Visual Studio Code
(recommended if running Windows 10) Windows 10 SDK
```

# Getting Started
Clone repository onto target machine.<br>
Using a command prompt navigate to where you cloned the repo and run:<br>
```
npm install
npm run setup
source env/Scripts/activate
```

# Testing
To start the program run:<br>
`npm start`<br>

# Compiling and Packaging
To compile `neural_style.py` and `check_cuda.py` into binaries run:<br>
`npm run compile`<br>
To package the current state of the project into and Electron distribution run:<br>
`npm run package`<br>
To compile and package in one command use:<br>
`npm run build`
