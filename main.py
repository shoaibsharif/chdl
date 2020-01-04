import os

for filename in os.listdir('DataStructure2Mosh'):
    src = f'DataStructure2Mosh/{filename}'
    dst = f'DataStructure2Mosh/{filename}.mp4'
    os.rename(src, dst)
