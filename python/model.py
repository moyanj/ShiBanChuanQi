from enum import StrEnum, IntEnum


class MsgType(StrEnum):
    INIT = "ii"  # 初始化
    UPLOAD_SAVE = "us"  # 上传存档
    DOWN_SAVE = "ds"  # 下载存档
    REG = "reg"  # 注册账号
    DEL_SAVE = "Ds"  # 删除存档
    UNDEFINED = "ud"  # 未定义类型
    RET = "ret"  # 服务器返回


class MsgCode(IntEnum):
    OK = 200
    ClientError = 400
    ServerError = 500


class ToClass:
    """
    字典转class

    Attributes:
        _conf_Dict (dict):原始字典
    """

    def __init__(self, conf: dict):
        self._conf_Dict = conf
        self.__name__ = "<Standard Dictionary>"
        self._update()

    def __getattr__(self, name):
        if name in self._conf_Dict:
            return self._conf_Dict[name]
        else:
            raise AttributeError(
                f"'{self.__class__.__name__}' object has no attribute '{name}'"
            )

    def _update(self):
        """
        更新字典内容
        """
        # 更新字典
        for k, v in self._conf_Dict.items():
            if isinstance(v, dict):
                setattr(self, k, ToClass(v))
            elif isinstance(v, list):
                setattr(
                    self,
                    k,
                    [ToClass(item) if isinstance(item, dict) else item for item in v],
                )
            else:
                setattr(self, k, v)

    def __str__(self):
        return str(self._conf_Dict)

    def __repr__(self):
        return str(self._conf_Dict)
