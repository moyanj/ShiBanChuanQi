import json
import zipfile
import argparse
import os
import subprocess
import sys

# 尝试安装 bsdiff4，如果没有找到的话
try:
    import bsdiff4
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "bsdiff4"])
    import bsdiff4

class Patch:
    def __init__(self, file):
        self.file = file
        self.init()
    
    def init(self):
        # 打开补丁文件并读取diff.json
        with zipfile.ZipFile(self.file) as z:
            # 直接在内存中读取diff.json，而不是提取到磁盘
            diff_json = z.read('diff.json').decode('utf-8')
        
        self.info = json.loads(diff_json)
        self.patch_data = z
        
    def delfile(self):
        # 删除文件列表中的文件
        for i in self.info.get("delfile", []):
            try:
                os.remove(i)
                print(f"Deleted file: {i}")
            except Exception as e:
                print(f"Failed to delete file {i}: {e}")
    
    def addfile(self):
        # 添加文件列表中的文件
        for i in self.info.get("addfile", []):
            try:
                with self.patch_data.open(i) as f:
                    with open(i, 'wb') as out_file:
                        out_file.write(f.read())
                print(f"Added file: {i}")
            except Exception as e:
                print(f"Failed to add file {i}: {e}")
    
    def modfile(self):
        # 修改文件（应用二进制补丁）
        for i in self.info.get("modfile", []):
            try:
                patch_file = i + ".diff"
                with self.patch_data.open(patch_file) as f:
                    patch_data = f.read()
                bsdiff4.file_patch_inplace(i, patch_data)
                print(f"Modified file: {i}")
            except Exception as e:
                print(f"Failed to apply patch to file {i}: {e}")
            
    def run(self):
        # 执行所有补丁操作
        print("Patching...")
        self.delfile()
        self.addfile()
        self.modfile()
        print("Patch Success!")

if __name__ == "__main__": 
    parser = argparse.ArgumentParser()
    parser.add_argument("file", help="patch file")
    args = parser.parse_args()
    
    try:
        Patch(args.file).run()
    except Exception as e:
        print(f"Patch failed: {e}")
