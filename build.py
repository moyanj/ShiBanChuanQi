import json
import os
import shutil
import zipfile
import argparse
import subprocess
try:
    import requests
    import tqdm
except ImportError:
    import pip
    pip.main(["install", "requests", "tqdm"])
    import requests
    import tqdm

parser = argparse.ArgumentParser()
parser.add_argument("system", help="system name", default=-1, )
parser.add_argument("arch", help="arch name", default=-1)
parser.add_argument("--electron-version", help="electron version", default="33.0.1")
parser.add_argument("--no-compile-html", action="store_true", help="not build html")
args = parser.parse_args()

project_name = 'ShiBanChuanQi'
electron_version = args.electron_version

if args.system == "all":
    # 平台列表
    platforms = ["win32", "linux"]
else:
    platforms = [args.system]

if args.arch == "all":
    # 架构列表
    archs = ["x64", "arm64"]
else:
    archs = [args.arch]

url = "https://npmmirror.com/mirrors/electron/{version}/electron-v{version}-{system}-{arch}.zip"

package_json = {
  "name": project_name,
  "version": "1.0.0",
  "main": "main.js"
}


os.makedirs("build", exist_ok=True)
os.makedirs(".cache", exist_ok=True)
if args.no_compile_html:
    print("Skipping HTML build...")
else:
    print("Building HTML...")
    shutil.rmtree("html", ignore_errors=True)
    subprocess.run(["pnpm", "run", "build"], check=True)

# 下载
for platform in platforms:
    for arch in archs:
        if os.path.exists(".cache/electron-{}-{}.zip".format(platform, arch)):
            print("{} {} already exists, skipping...".format(platform, arch))
            continue

        print("Downloading {} {} SDK ...".format(platform, arch))
        url_str = url.format(version=electron_version, system=platform, arch=arch)
        print(url_str)
        r = requests.get(url_str, stream=True)

        # 获取文件大小
        total_size = int(r.headers.get("content-length"))

        f = open(".cache/electron-{}-{}.zip".format(platform, arch), "wb")

        with tqdm.tqdm(total=total_size, unit="B", unit_scale=True) as pbar:
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    pbar.update(len(chunk))

        f.close()

for platform in platforms:
    for arch in archs:
        print("Building {} {} App...".format(platform, arch))
        build_dir = f"build/{platform}-{arch}"
        shutil.rmtree(build_dir, ignore_errors=True)
        # 解压zip
        with zipfile.ZipFile(".cache/electron-{}-{}.zip".format(platform, arch), "r") as zip_ref:
            zip_ref.extractall(build_dir)

        os.remove(os.path.join(build_dir, "resources", "default_app.asar"))
        os.mkdir(os.path.join(build_dir, "resources", "app"))
        shutil.copytree("html", os.path.join(build_dir, "resources", "app", "html"))
        shutil.copy("main.js", os.path.join(build_dir, "resources", "app"))
        # 创建package.json
        with open(os.path.join(build_dir, "resources", "app", "package.json"), "w") as f:
            json.dump(package_json, f)

        # 重命名主程序
        if platform == "win32":
            os.chmod(os.path.join(build_dir, "electron.exe"), 0o755)
            shutil.move(os.path.join(build_dir, "electron.exe"), os.path.join(build_dir, f"{project_name}.exe"))
        else:
            os.chmod(os.path.join(build_dir, "electron"), 0o755)
            shutil.move(os.path.join(build_dir, "electron"), os.path.join(build_dir, project_name))