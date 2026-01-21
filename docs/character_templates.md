# 各种角色模板的设计方式

为了系统化地构建多样化的角色阵容，我们定义了四种基础的角色模板：**坦克 (Tank)**、**输出 (DPS)**、**辅助 (Support)** 和 **斗士 (Bruiser)**。本文档将详细阐述各种模板的设计理念，并提供基于现有 `Character` 基类的代码实现指导。

## 一、角色模板定义

### 1. 输出 (DPS - Damage Per Second)

- **核心定位**: 队伍的主要伤害来源，专注于高效地对敌方单体或群体造成伤害。
- **设计要点**:
  - **高ATK成长**: 其ATK数值应显著高于“黄金比例”基准。
  - **纯粹的伤害技能**: 技能和绝招通常是直接的、高倍率的伤害技能，附加效果较少。
  - **生存能力**: HP和DEF可以略低于基准，依赖辅助角色保护。
- **代码实现示例 (Fairy)**:
  ```typescript
  // src/js/characters/definitions.ts

  import { Character } from './base';

  export class Fairy extends Character {
    constructor(id: number, name: string, level: number = 1) {
      super(id, name, level);
      this.initial_icon = 'icon-fairy.png';
      this.initial_skill_icon = 'skill-fairy.png';
      this.initial_super_icon = 'super-fairy.png';
    }

    skill(targets: Character[]): void {
      super.skill(targets);
      const target = targets[0];
      const damage = this.atk_ * 2.2; // 技能拥有高于标准的伤害倍率
      this.cause_damage(target, damage);
    }

    super(targets: Character[]): void {
      super.super(targets);
      const target = targets[0];
      const damage = this.atk_ * 4.5; // 绝招是纯粹的高额单体伤害
      this.cause_damage(target, damage);
    }
  }
  ```

### 2. 辅助 (Support)

- **核心定位**: 通过治疗、增益（Buff）、减益（Debuff）等手段为团队提供支援，提升队伍的整体战斗效能和生存能力。
- **设计要点**:
  - **数值非核心**: 其三维数值可能不遵循黄金比例，核心价值在于技能效果。
  - **团队增益**: 技能通常作用于 `all_allies`，提供攻击、防御、速度等加成。
  - **治疗能力**: 能够为队友恢复生命值。
- **代码实现示例 (ChenGe - 光环辅助)**:
  ```typescript
  // src/js/characters/definitions.ts

  export class ChenGe extends Character {
    public halo_count: number = 0; // 独特的资源系统

    general(targets: Character[]): void {
      super.general(targets);
      // ... 造成伤害 ...
      this.halo_count = Math.min(12, this.halo_count + 1); // 普攻积攒资源
    }

    skill(targets: Character[]): void {
      super.skill(targets);
      if (this.halo_count > 0) {
        const buffValue = Math.floor(this.halo_count * 0.03 * this.atk_);
        // 消耗资源，为全体队友提供基于自身属性的攻击力加成
        this.allies.forEach(ally => {
          this.apply_effect(ally, 'chenge-atk-buff', '陈哥光环', 'buff', 'atk', buffValue, 2);
        });
        this.halo_count -= 1;
      }
    }
    // ... 绝招逻辑 ...
  }
  ```

### 3. 坦克 (Tank)

- **核心定位**: 吸收伤害，保护队友。拥有高生命值和高防御力。
- **设计要点**:
  - **高HP和DEF**: 显著高于黄金比例基准。
  - **生存技能**: 可能拥有自我治疗、护盾或减伤技能。
  - **混合缩放**: 为了弥补输出不足，其伤害可以基于HP或DEF进行计算。
- **代码实现示例 (基于混合缩放的设计思路)**:
  ```typescript
  // src/js/characters/definitions.ts

  export class TankCharacter extends Character {
    // ... constructor ...

    general(targets: Character[]): void {
      super.general(targets);
      const target = targets[0];
      // 伤害同时受益于ATK和HP，让坦克在堆砌生命值时也能有输出
      const damage = this.atk_ * 0.5 + this.hp_ * 0.1; 
      this.cause_damage(target, damage);
    }

    skill(targets: Character[]): void {
      super.skill(targets);
      // 为自身施加一个持续2回合的防御增益
      this.apply_effect(this, 'tank-def-buff', '坚守', 'buff', 'def', this.def_ * 0.5, 2);
    }
  }
  ```

### 4. 斗士 (Bruiser)

- **核心定位**: 介于坦克和输出之间，既有可观的伤害能力，也具备一定的生存能力。
- **设计要点**:
  - **均衡的数值**: 属性上接近黄金比例，但ATK和HP/DEF都略有上浮。
  - **代价权衡**: 常常通过自我伤害或消耗资源来换取爆发输出。
- **代码实现示例 (FanShiFu - 卖血斗士)**:
  ```typescript
  // src/js/characters/definitions.ts

  export class FanShiFu extends Character {
    // ... constructor ...

    skill(targets: Character[]): void {
      super.skill(targets);
      const target = targets[0];
      // 消耗20%当前生命值
      const cost = this.hp_ * 0.2;
      this.hp_ -= cost;
      // 造成200%攻击力的高额伤害
      const damage = this.atk_ * 2.0; 
      this.cause_damage(target, damage);
    }
    
    super(targets: Character[]): void {
      super.super(targets);
      const target = targets[0];
      // 消耗75%当前生命值
      const cost = this.hp_ * 0.75;
      this.hp_ -= cost;
      // 造成350%的毁灭性伤害
      const damage = this.atk_ * 3.5;
      this.cause_damage(target, damage);
    }
  }
  ```

## 二、利用独特属性设计复杂机制

通过在角色类中添加自定义属性（如 `halo_count`, `pine_nut_count`），我们可以构建出超越基础模板的、独一无二的战斗机制。

- **`halo_count` (陈哥)**: 典型的“积攒-消耗”模型。普攻是资源的生产者，技能和绝招是资源的消费者。玩家需要在“何时消耗资源以获取最大收益”上做出策略抉择。
- **`pine_nut_count` (松)**: 另一种资源模型，用于解锁更强大的技能版本。当“松果”数量达到3个或以上时，其绝招会从一个普通版本升级为一个消耗所有松果的强化版本，伤害倍率大幅提升。

在设计新角色时，应积极思考如何通过引入新的自定义属性来创造新颖的玩法，这正是游戏深度和可玩性的关键所在。
