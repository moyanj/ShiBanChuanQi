import json
import os
import shutil
import zipfile
import argparse
import subprocess
import time

try:
    import requests
    import tqdm
except ImportError:
    import pip
    pip.main(["install", "requests", "tqdm"])
    import requests
    import tqdm

parser = argparse.ArgumentParser()
parser.add_argument("target", help="system name", default="all")
parser.add_argument("--electron-version", help="electron version", default="33.0.1")
parser.add_argument("--no-compile-html", action="store_true", help="not build html")
args = parser.parse_args()

project_name = 'ShiBanChuanQi'
version = "1.0.0b"
electron_version = args.electron_version

if args.target == "all":
    targets = [
        [electron_version, "linux", 'x64', "linux"],    # Linux x64 
        [electron_version, "linux", 'arm64', "linux"],  # Linux arm64
        [electron_version, "linux", 'armv7l', "linux"], # Linux armv7l
        [electron_version, "win32", 'x64', "windows"],  # Windows x64
        [electron_version, "win32", 'arm64', "windows"],# Windows arm64
        [electron_version, "win32", 'ia32', "windows"], # Windows x86
        ["22.3.27", "win32", 'x64', "windows7"],        # Windows x64(兼容版)
        ["22.3.27", "win32", 'ia32', "windows7"],       # Windows x86(兼容版)
        ["22.3.27", "win32", 'arm64', "windows7"]       # Windows arm64(兼容版)
    ]
else:
    targets = [
        [electron_version] + args.target.split("-") + [args.target.split("-")[0]]
    ]

url = "https://npmmirror.com/mirrors/electron/{version}/electron-v{version}-{system}-{arch}.zip"

package_json = {
  "name": project_name,
  "version": version,
  "main": "main.js"
}


os.makedirs("build", exist_ok=True)
os.makedirs(".cache", exist_ok=True)
if args.no_compile_html:
    print("Skipping HTML build...")
else:
    print("Building HTML...")
    shutil.rmtree("html", ignore_errors=True)
    try:
        subprocess.run(["pnpm", "run", "build"], check=True)
    except subprocess.CalledProcessError:
        print("Error building HTML!!!")
        exit(1)

# 下载
for target in targets:
        if os.path.exists(".cache/electron-{}-{}.zip".format(target[3], target[2])):
            print("{} {} already exists, skipping...".format(target[3], target[2]))
            continue

        print("Downloading {} {} SDK ...".format(target[3], target[2]))
        url_str = url.format(version=target[0], system=target[1], arch=target[2])
        print(url_str)
        r = requests.get(url_str, stream=True, timeout=5)

        # 获取文件大小
        total_size = int(r.headers.get("content-length"))

        f = open(".cache/electron-{}-{}.zip".format(target[3], target[2]), "wb")

        with tqdm.tqdm(total=total_size, unit="B", unit_scale=True) as pbar:
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    pbar.update(len(chunk))

        f.close()

for target in targets:
        print("Building {} {} App...".format(target[3], target[2]))
        build_dir = f"build/{target[3]}-{target[2]}"
        shutil.rmtree(build_dir, ignore_errors=True)
        # 解压zip
        with zipfile.ZipFile(".cache/electron-{}-{}.zip".format(target[3], target[2]), "r") as zip_ref:
            zip_ref.extractall(build_dir)

        os.remove(os.path.join(build_dir, "resources", "default_app.asar"))
        os.mkdir(os.path.join(build_dir, "resources", "app"))
        shutil.copytree("html", os.path.join(build_dir, "resources", "app", "html"))
        shutil.copy("main.js", os.path.join(build_dir, "resources", "app"))
        # 创建package.json
        with open(os.path.join(build_dir, "resources", "app", "package.json"), "w") as f:
            json.dump(package_json, f)
        # 创建build_info.json
        build_info = {
            "version": version,
            "electron_version": target[0],
            "timestamp": time.time() * 1000,
            "platform": target[3],
            "arch": target[2],
            "time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        }
        with open(os.path.join(build_dir, "resources", "app", "html", "build_info.json"), "w") as f:
            json.dump(build_info, f)

        pfad = os.path.join(build_dir, "locales")
        projekt = ["zh-CN.pak", "en-US.pak"]
        liste = os.listdir(pfad)
        for f in liste:

            if f in projekt:
                continue
            os.remove(os.path.join(pfad, f))
                
        # 重命名主程序
        if target[1] == "win32":
            os.chmod(os.path.join(build_dir, "electron.exe"), 0o755)
            shutil.move(os.path.join(build_dir, "electron.exe"), os.path.join(build_dir, f"{project_name}.exe"))
        else:
            os.chmod(os.path.join(build_dir, "electron"), 0o755)
            shutil.move(os.path.join(build_dir, "electron"), os.path.join(build_dir, project_name))

        # 创建压缩包
        with zipfile.ZipFile(f"build/{project_name}-v{version}-{target[3]}-{target[2]}.zip", "w") as zip_ref:
            for root, dirs, files in os.walk(build_dir):
                for file in files:
                    zip_ref.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), build_dir))
        