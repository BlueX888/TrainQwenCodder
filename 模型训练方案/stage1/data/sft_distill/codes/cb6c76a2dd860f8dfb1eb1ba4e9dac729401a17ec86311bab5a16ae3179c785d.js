class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    
    // 技能系统状态变量（可验证）
    this.skillsUsedCount = 0;
    this.totalCooldownTime = 0;
    this.activeSkills = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化技能数据
    this.skills = [
      { id: 1, key: 'ONE', cooldown: 1500, ready: true, timer: null, progress: 0 },
      { id: 2, key: 'TWO', cooldown: 3000, ready: true, timer: null, progress: 0 },
      { id: 3, key: 'THREE', cooldown: 4500, ready: true, timer: null, progress: 0 },
      { id: 4, key: 'FOUR', cooldown: 6000, ready: true, timer: null, progress: 0 },
      { id: 5, key: 'FIVE', cooldown: 7500, ready: true, timer: null, progress: 0 }
    ];

    // 创建标题
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 70, 'Press 1-5 to use skills', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能UI
    this.createSkillUI();

    // 创建状态显示
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 绑定键盘输入
    this.setupInput();

    // 更新状态显示
    this.updateStatusText();
  }

  createSkillUI() {
    const startX = 150;
    const startY = 200;
    const spacing = 120;

    this.skillGraphics = [];
    this.skillTexts = [];
    this.cooldownTexts = [];

    this.skills.forEach((skill, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // 创建技能图标背景
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillRoundedRect(x - 40, y - 40, 80, 80, 10);

      // 创建技能图标
      const icon = this.add.graphics();
      icon.fillStyle(0x4488ff, 1);
      icon.fillRoundedRect(x - 35, y - 35, 70, 70, 8);
      
      // 技能编号
      const numberText = this.add.text(x, y, skill.id.toString(), {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 冷却遮罩（初始不可见）
      const cooldownMask = this.add.graphics();
      cooldownMask.setDepth(1);

      // 技能名称
      const nameText = this.add.text(x, y + 55, `Skill ${skill.id}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }).setOrigin(0.5);

      // 冷却时间文本
      const cdText = this.add.text(x, y + 75, `CD: ${skill.cooldown / 1000}s`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      // 状态文本
      const statusText = this.add.text(x, y + 95, 'READY', {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.skillGraphics.push({
        bg, icon, cooldownMask, numberText, x, y
      });

      this.skillTexts.push(statusText);
      this.cooldownTexts.push(cdText);
    });
  }

  setupInput() {
    // 为每个技能绑定键盘
    this.skills.forEach((skill, index) => {
      this.input.keyboard.on(`keydown-${skill.key}`, () => {
        this.useSkill(index);
      });
    });
  }

  useSkill(index) {
    const skill = this.skills[index];

    if (!skill.ready) {
      // 技能冷却中
      this.flashSkillIcon(index, 0xff0000);
      return;
    }

    // 使用技能
    skill.ready = false;
    skill.progress = 0;
    this.skillsUsedCount++;
    this.activeSkills++;

    // 视觉反馈
    this.flashSkillIcon(index, 0x00ff00);

    // 更新状态文本
    this.skillTexts[index].setText('COOLDOWN');
    this.skillTexts[index].setColor('#ff0000');

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        this.onSkillReady(index);
      },
      callbackScope: this
    });

    // 累计冷却时间
    this.totalCooldownTime += skill.cooldown;

    // 更新状态显示
    this.updateStatusText();
  }

  onSkillReady(index) {
    const skill = this.skills[index];
    skill.ready = true;
    skill.progress = 0;
    skill.timer = null;
    this.activeSkills--;

    // 更新状态文本
    this.skillTexts[index].setText('READY');
    this.skillTexts[index].setColor('#00ff00');

    // 闪烁提示
    this.flashSkillIcon(index, 0xffff00);

    // 更新状态显示
    this.updateStatusText();
  }

  flashSkillIcon(index, color) {
    const graphics = this.skillGraphics[index];
    const originalColor = 0x4488ff;

    // 闪烁效果
    graphics.icon.clear();
    graphics.icon.fillStyle(color, 1);
    graphics.icon.fillRoundedRect(
      graphics.x - 35,
      graphics.y - 35,
      70, 70, 8
    );

    this.time.delayedCall(200, () => {
      graphics.icon.clear();
      graphics.icon.fillStyle(originalColor, 1);
      graphics.icon.fillRoundedRect(
        graphics.x - 35,
        graphics.y - 35,
        70, 70, 8
      );
    });
  }

  updateStatusText() {
    const activeCount = this.skills.filter(s => !s.ready).length;
    this.statusText.setText(
      `Skills Used: ${this.skillsUsedCount} | ` +
      `Active Cooldowns: ${activeCount} | ` +
      `Total CD Time: ${(this.totalCooldownTime / 1000).toFixed(1)}s`
    );
  }

  update(time, delta) {
    // 更新每个技能的冷却进度
    this.skills.forEach((skill, index) => {
      if (!skill.ready && skill.timer) {
        // 计算冷却进度
        const elapsed = skill.timer.getElapsed();
        skill.progress = Math.min(elapsed / skill.cooldown, 1);

        // 绘制冷却遮罩
        const graphics = this.skillGraphics[index];
        graphics.cooldownMask.clear();
        
        if (skill.progress < 1) {
          graphics.cooldownMask.fillStyle(0x000000, 0.7);
          
          const maskHeight = 70 * (1 - skill.progress);
          graphics.cooldownMask.fillRoundedRect(
            graphics.x - 35,
            graphics.y - 35,
            70,
            maskHeight,
            8
          );

          // 更新冷却时间文本
          const remaining = skill.cooldown - elapsed;
          this.cooldownTexts[index].setText(
            `CD: ${(remaining / 1000).toFixed(1)}s`
          );
        } else {
          // 冷却完成，清除遮罩
          graphics.cooldownMask.clear();
          this.cooldownTexts[index].setText(
            `CD: ${skill.cooldown / 1000}s`
          );
        }
      } else if (skill.ready) {
        // 技能就绪，清除遮罩
        const graphics = this.skillGraphics[index];
        graphics.cooldownMask.clear();
      }
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystem
};

// 创建游戏实例
new Phaser.Game(config);