import random
import time

# 角色类
class Character:
    def __init__(self, name, hp, attack_power):
        self.name = name
        self.hp = hp
        self.attack_power = attack_power
        self.atb = 0  # ATB 条的当前进度（0到100）
        self.atb_speed = random.uniform(1.5, 3.0)  # ATB 条填充速度

    def is_alive(self):
        return self.hp > 0

    def attack(self, target):
        damage = random.randint(self.attack_power - 5, self.attack_power + 5)
        target.hp -= damage
        print(f"{self.name} 攻击 {target.name}，造成 {damage} 点伤害！")

    def update_atb(self, delta_time):
        # 根据时间更新 ATB 条
        self.atb += self.atb_speed * delta_time
        if self.atb > 100:
            self.atb = 100

    def reset_atb(self):
        # ATB 条填满后，进行动作并重置
        self.atb = 0


# 战斗类
class Battle:
    def __init__(self, player, enemy):
        self.player = player
        self.enemy = enemy

    def turn(self):
        # 每回合处理 ATB 条的更新
        delta_time = 0.5  # 假设每次循环代表半秒
        self.player.update_atb(delta_time)
        self.enemy.update_atb(delta_time)

        print(f"{self.player.name} 的 ATB: {self.player.atb:.1f}%")
        print(f"{self.enemy.name} 的 ATB: {self.enemy.atb:.1f}%")

        # 玩家和敌人判断是否可以行动
        if self.player.atb >= 100:
            self.player.attack(self.enemy)
            self.player.reset_atb()
        if self.enemy.atb >= 100:
            self.enemy.attack(self.player)
            self.enemy.reset_atb()

    def is_battle_over(self):
        # 检查战斗是否结束
        if not self.player.is_alive():
            print(f"{self.player.name} 被击败了！敌人获胜！")
            return True
        if not self.enemy.is_alive():
            print(f"{self.enemy.name} 被击败了！你获胜了！")
            return True
        return False

    def start(self):
        while not self.is_battle_over():
            self.turn()
            #time.sleep(1)  # 每回合间隔一秒
            print('-' * 30)


# 创建角色
player = Character("玩家", 100, 20)
enemy = Character("敌人", 100, 15)

# 开始战斗
battle = Battle(player, enemy)
battle.start()
