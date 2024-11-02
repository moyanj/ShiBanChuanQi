import json
import zipfile
import argparse
import shutil
import os

try:
    import bsdiff4
except ImportError:
    import pip
    pip.main(["install", "bsdiff4"])
    import bsdiff4
    
class Patch:
    def __init__(self, file):
        self.file = file
        self.init()
    
    def init(self):
        os.makedirs("./.cache")
        with zipfile.ZipFile(self.file) as z:
            z.extractall("./.cache")
            
        self.info = json.load(open("./.cache/diff.json"))
        
    def delfile(self):
        for i in self.info["delfile"]:
            try:
                os.remove(i)
            except:
                pass
    
    def addfile(self):
        for i in self.info["addfile"]:
            shutil.copy(os.path.join("./.cache", i), i)
    
    def modfile(self):
        for i in self.info["modfile"]:
            bsdiff4.file_patch_inplace(i, os.path.join("./.cache", i+".diff"))
            
    def run(self):
        print("Patching...")
        self.delfile()
        self.addfile()
        self.modfile()
        
        shutil.rmtree("./.cache")
        print("Patch Success!")
        
if __name__ == "__main__": 
    parser = argparse.ArgumentParser()
    parser.add_argument("file", help="patch file")
    args = parser.parse_args()
    Patch(args.file).run()