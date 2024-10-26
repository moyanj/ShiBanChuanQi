from dataclasses import dataclass, field
import os
import subprocess
import json
import time
import shutil
import zipfile
import hashlib

try:
    import requests
    import tqdm
except ImportError:
    import pip

    pip.main(["install", "requests", "tqdm"])
    import requests
    import tqdm


@dataclass
class Target:
    system: str
    arch: str
    version: str
    name: str
    url_list: list = field(default_factory=list)

    def __post_init__(self):
        self.url_list.extend(
            [
                "https://npmmirror.com/mirrors/electron/{version}/electron-v{version}-{system}-{arch}.zip",
                "https://ghproxy.cn/https://github.com/electron/electron/releases/download/v{version}/electron-v{version}-{system}-{arch}.zip",
                "https://github.com/electron/electron/releases/download/v{version}/electron-v{version}-{system}-{arch}.zip",
            ]
        )

    def __str__(self):
        return f"{self.name}-{self.arch}-{self.version}"

    def make_url(self):
        for url in self.url_list:
            yield url.format(**self.__dict__)

    def get_file_name(self):
        return f"electron-v{self.version}-{self.system}-{self.arch}.zip"

    def get_save_name(self):
        return f"ele-{self}.zip"


class ProjectInfo:
    def __init__(self):
        p = json.load(open("package.json"))
        self.name = p["name"]
        self.version = p["version"]

    def make_json(self):
        return json.dumps(
            {"name": self.name, "version": self.version, "main": "main.js"}
        )


class Builer:
    MAX_RETRIES = 3  # 最大重试次数
    RETRY_DELAY = 0.5  # 重试间隔（秒）

    def __init__(self, args):
        self.args = args
        self.default_version = self.args.default_version
        self.cname = {
            "win7": "win32",
            "win": "win32",
        }
        self.sha256sum = {}
        self.targets = self.make_target()
        self.info = ProjectInfo()

    def make_target(self):
        if self.args.target != "all":  # 指定目标
            name, arch = self.args.target.split("-")
            system = self.cname.get(name, name)
            return [Target(system, arch, self.default_version, name)]

        return [
            Target("linux", "x64", self.default_version, "linux"),  # Linux x64
            Target("linux", "arm64", self.default_version, "linux"),  # Linux arm64
            Target("linux", "armv7l", self.default_version, "linux"),  # Linux armv7l
            Target("win32", "x64", self.default_version, "win"),  # Windows x64
            Target("win32", "ia32", self.default_version, "win"),  # Windows x86
            Target("win32", "arm64", self.default_version, "win"),  # Windows arm64
            Target("win32", "x64", "22.3.27", "win7"),  # Windows x64 兼容版
            Target("win32", "ia32", "22.3.27", "win7"),  # Windows x86 兼容版
            Target("win32", "arm64", "22.3.27", "win7"),  # Windows arm64 兼容版
        ]

    def download_file(self, target: Target, r: requests.Response):
        # 获取文件大小
        total_size = int(r.headers.get("content-length", 0))

        # 创建缓存目录（如果不存在）
        os.makedirs(".cache", exist_ok=True)

        file_path = f".cache/ele-{target}.zip"
        with open(file_path, "wb") as f, tqdm.tqdm(
            total=total_size, unit="B", unit_scale=True
        ) as pbar:
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    pbar.update(len(chunk))

    def download_target(self, target):
        file_path = f".cache/ele-{target}.zip"
        if os.path.exists(file_path):
            print(f"{target} SDK already exists, checking integrity...")
            if not self.args.no_check:
                if not self.check_file(target):
                    print(f"{target} SDK integrity check failed, redownloading...")
                else:
                    print(f"{target} SDK integrity check passed, skipping download.")
                    return
            else:
                return

        print(f"Downloading {target} SDK ...")

        for url in target.make_url():

            for attempt in range(self.MAX_RETRIES):
                try:
                    r = requests.get(url, stream=True, timeout=5)
                    if r.status_code == 200:  # 请求成功
                        self.download_file(target, r)
                        # 进行校验
                        if not self.args.no_check:
                            if not self.check_file(target):
                                print(
                                    f"{target} SDK integrity check failed, redownloading..."
                                )
                                break  # 重新开始下载循环
                        print(f"{target} SDK downloaded successfully.")
                        return
                    else:
                        print(
                            f"Error downloading from {url}, status code: {r.status_code}"
                        )
                except requests.RequestException as e:
                    print(f"Request failed: {e}")
                finally:
                    r.close()

                # 如果请求失败，等待一段时间后重试
                if attempt < self.MAX_RETRIES - 1:
                    print(f"Retrying in {self.RETRY_DELAY} seconds...")
                    time.sleep(self.RETRY_DELAY)

    def download(self):
        for target in self.targets:
            self.download_target(target)

    def check_file(self, target):
        print(f"Checking {target}...")
        v_hash = self.sha256sum.get(target.version)
        if v_hash is None:
            print("No hash found for version.", target)
            exit(1)
        hash_value = v_hash[target.get_file_name()]

        h = hashlib.sha256()
        with open(os.path.join(".cache", target.get_save_name()), "rb") as f:
            size = os.stat(os.path.join(".cache", target.get_save_name())).st_size
            with tqdm.tqdm(total=size, unit="B", unit_scale=True) as pbar:
                for chunk in iter(lambda: f.read(4096), b""):
                    h.update(chunk)
                    pbar.update(len(chunk))

        # 校验哈希值
        is_valid = h.hexdigest() == hash_value
        if not is_valid:
            print(
                f"{target} SDK hash mismatch. Expected: {hash_value}, Got: {h.hexdigest()}"
            )
        return is_valid

    def download_sha256sum(self):
        print("Downloading SHA256SUMS...")
        url_temp = (
            "https://cdn.npmmirror.com/binaries/electron/{version}/SHASUMS256.txt"
        )
        versions = []
        for t in self.targets:
            if t.version in versions:
                continue
            versions.append(t.version)

        for v in versions:
            self.sha256sum[v] = {}
            if os.path.exists(f".cache/SHASUMS256_{v}.txt"):
                print(f"{v} SHA256SUMS already exists, skipping...")
                with open(f".cache/SHASUMS256_{v}.txt") as f:
                    text = f.read()
            else:
                print(f"Downloading {v} SHA256SUMS...")
                url = url_temp.format(version=v)
                r = requests.get(url)
                text = r.text
                with open(f".cache/SHASUMS256_{v}.txt", "w") as f:
                    f.write(text)
            for i in text.split("\n"):
                i_list = i.split(" *")
                self.sha256sum[v][i_list[1]] = i_list[0]

    def check(self):
        for target in self.targets:
            self.check_file(target)

    def build_html(self):
        print("Building HTML...")
        try:
            subprocess.run(["pnpm", "run", "build"], check=True)
        except subprocess.CalledProcessError:
            print("Error building HTML!!!")
            exit(1)
        print("Building HTML finished!")

    def make_build_info(self, target):
        data = {
            "electron_version": target.version,
            "timestamp": time.time() * 1000,
            "platform": target.system,
            "arch": target.arch,
            "time": time.strftime("%Y/%m/%d %H:%M:%S", time.localtime()),
            "type": "electron",
            "version": self.info.version,
        }
        return json.dumps(data)

    def copy(self, target):
        print("Copying files...")
        all_files = []
        for root, dirs, files in os.walk("html"):
            for file in files:
                all_files.append(os.path.join(root, file))
                
        
        for file in tqdm.tqdm(all_files):
            
            os.makedirs(
                os.path.dirname(
                    os.path.join("build", str(target), "resources", "app", file)
                ),
                exist_ok=True,
            )
            shutil.copy(
                file, os.path.join("build", str(target), "resources", "app", file)
            )
            
        for root, dirs, files in os.walk("electron"):
            for file in files:
                shutil.copy(os.path.join(root, file),os.path.join("build", str(target), "resources", "app", file))
        

        

    def after_build(self, target):
        build_dir = os.path.join("build", str(target))

        os.remove(os.path.join(build_dir, "resources", "default_app.asar"))

        # 删除不需要的资源
        pfad = os.path.join(build_dir, "locales")
        projekt = ["zh-CN.pak"]
        liste = os.listdir(pfad)
        for f in liste:

            if f in projekt:
                continue
            os.remove(os.path.join(pfad, f))

        # 重命名主程序
        if target.system == "win32":
            shutil.move(
                os.path.join(build_dir, "electron.exe"),
                os.path.join(build_dir, f"{self.info.name}.exe"),
            )
        elif target.system == "linux":
            os.chmod(os.path.join(build_dir, "electron"), 0o755)
            shutil.move(
                os.path.join(build_dir, "electron"),
                os.path.join(build_dir, self.info.name),
            )

    def make_zip(self, target):
        print("Making zip...")
        build_dir = os.path.join("build", str(target))
        with zipfile.ZipFile(
            f"build/{self.info.name}-{self.info.version}-{target.name}-{target.arch}.zip",
            "w",
        ) as zip_ref:
            for root, dirs, files in os.walk(build_dir):
                for file in files:
                    zip_ref.write(
                        os.path.join(root, file),
                        os.path.relpath(os.path.join(root, file), build_dir),
                    )

    def build(self):
        shutil.rmtree("build", ignore_errors=True)
        os.makedirs("build", exist_ok=True)
        os.makedirs(".cache", exist_ok=True)
        self.download_sha256sum()
        self.download()

        if not self.args.no_build_html:
            self.build_html()

        for target in self.targets:
            print(f"Building {target}...")

            print("Extracting SDK...")
            # 解压SDK
            with zipfile.ZipFile(f".cache/ele-{target}.zip", "r") as zip_ref:
                zip_ref.extractall(f"build/{target}")

            os.makedirs(
                os.path.join(
                    "build",
                    str(target),
                    "resources",
                    "app",
                ),
                exist_ok=True,
            )

            self.copy(target)

            with open(
                os.path.join("build", str(target), "resources", "app", "package.json"),
                "w",
            ) as f:
                f.write(self.info.make_json())

            with open(
                os.path.join(
                    "build", str(target), "resources", "app", "html", "build_info.json"
                ),
                "w",
            ) as f:
                f.write(self.make_build_info(target))

            self.after_build(target)

            if not self.args.no_zip:
                self.make_zip(target)


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("target", help="system name", default="all")

    parser.add_argument("--no-build-html", action="store_true", help="build html")
    parser.add_argument("--no-zip", action="store_true", help="no zip")
    parser.add_argument("--no-check", action="store_true", help="no check")
    parser.add_argument("--default-version", help="default version", default="33.0.2")
    args = parser.parse_args()
    builder = Builer(args)
    builder.build()
