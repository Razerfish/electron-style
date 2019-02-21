# pytorch-neural-style-gui
An Electron app for the pytorch implementation of neural style. Name is a placeholder.

# Prerequisites
```
Python 3.7 64 bit
Node JS 8.12
CUDA 9.0 (for gpu support)
(recommended) git bash
(recommended) Visual Studio Code
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
`npm run package`
