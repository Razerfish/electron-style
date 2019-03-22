# -*- mode: python -*-

block_cipher = None


neural_style_a = Analysis(['Assets\\Scripts\\neural_style\\neural_style.py'],
             pathex=['Assets\\Scripts\\neural_style', 'C:\\Program Files (x86)\\Windows Kits\\10\\Redist\\10.0.17763.0\\ucrt\\DLLs\\x64'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)

check_cuda_a = Analysis(['Assets\\Scripts\\check_cuda\\check_cuda.py'],
             pathex=['Assets\\Scripts\\check_cuda', 'C:\\Program Files (x86)\\Windows Kits\\10\\Redist\\10.0.17763.0\\ucrt\\DLLs\\x64'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=[],
             win_private_assemblies=[],
             cipher=block_cipher,
             noarchive=False)

MERGE( (neural_style_a, 'neural_style', 'neural_style'), (check_cuda_a, 'check_cuda', 'check_cuda') )

neural_style_pyz = PYZ(neural_style_a.pure, neural_style_a.zipped_data,
             cipher=block_cipher)

neural_style_exe = EXE(neural_style_pyz,
         neural_style_a.scripts,
         [],
         exclude_binaries=True,
         name='neural_style',
         debug=False,
         bootloader_ignore_signals=False,
         strip=False,
         upx=True,
         console=False )

check_cuda_pyz = PYZ(check_cuda_a.pure, check_cuda_a.zipped_data,
             cipher=block_cipher)

check_cuda_exe = EXE(check_cuda_pyz,
         check_cuda_a.scripts,
         [],
         exclude_binaries=True,
         name='check_cuda',
         debug=False,
         bootloader_ignore_signals=False,
         strip=False,
         upx=True,
         console=False )

coll = COLLECT(neural_style_exe, check_cuda_exe,
             neural_style_a.binaries,
             check_cuda_a.binaries,
             neural_style_a.zipfiles,
             check_cuda_a.zipfiles,
             neural_style_a.datas,
             check_cuda_a.datas,
             strip=False,
             upx=True,
             name='neural_style')
