class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    
    // 状态信号变量
    this.skillUsageCount = [0, 0, 0, 0, 0]; // 每个技能使用次数
    this.totalSkillsUsed = 0; // 总技能使用次数
    this.activeCooldowns = 0; // 当前冷却中的技能数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 技能配置
    this.skills = [
      { id: 0, name: 'Skill 1', cooldown: 2000, key: 'ONE', color: 0xff4444, ready: true, progress: 0 },
      { id: 1, name: 'Skill 2', cooldown: 4000, key: 'TWO', color: 0x44ff44, ready: true, progress: 0 },
      { id: 2, name: 'Skill 3', cooldown: 6000, key: 'THREE', color: 0x4444ff, ready: true, progress: 0 },
      { id: 3, name: 'Skill 4', cooldown: 8000, key: 'FOUR', color: 0xffff44, ready: true, progress: 0 },
      { id: 4, name: 'Skill 5', cooldown: 10000, key: 'FIVE', color: 0xff44ff, ready: true, progress: 0 }
    ];

    // 创建技能 UI
    this.createSkillUI();

    // 绑定键盘输入
    this.setupInput();

    // 创建信息文本
    this.createInfoText();

    // 添加说明文字
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 70, 'Press 1-5 to use skills | Cooldowns: 2s, 4s, 6s, 8s, 10s', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  createSkillUI() {
    this.skillGraphics = [];
    this.skillTexts = [];
    this.cooldownTexts = [];

    const startX = 150;
    const startY = 200;
    const spacing = 120;
    const skillSize = 80;

    this.skills.forEach((skill, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // 创建技能图标背景
      const graphics = this.add.graphics();
      this.skillGraphics.push(graphics);

      // 绘制技能框
      this.drawSkillIcon(graphics, x, y, skillSize, skill.color, skill.ready, 0);

      // 技能名称
      const nameText = this.add.text(x, y + skillSize / 2 + 30, skill.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.skillTexts.push(nameText);

      // 快捷键提示
      this.add.text(x, y + skillSize / 2 + 50, `[${index + 1}]`, {
        fontSize: '14px',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      // 冷却时间文本
      const cooldownText = this.add.text(x, y, '', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      cooldownText.setVisible(false);
      this.cooldownTexts.push(cooldownText);
    });
  }

  drawSkillIcon(graphics, x, y, size, color, ready, progress) {
    graphics.clear();

    const halfSize = size / 2;
    const centerX = x;
    const centerY = y;

    // 绘制背景圆
    graphics.fillStyle(0x333333, 1);
    graphics.fillCircle(centerX, centerY, halfSize);

    // 绘制技能图标（内圆）
    if (ready) {
      graphics.fillStyle(color, 1);
      graphics.fillCircle(centerX, centerY, halfSize - 5);
    } else {
      // 冷却中显示暗色
      graphics.fillStyle(color, 0.3);
      graphics.fillCircle(centerX, centerY, halfSize - 5);

      // 绘制冷却进度（扇形遮罩）
      if (progress > 0) {
        graphics.fillStyle(0x000000, 0.7);
        graphics.slice(centerX, centerY, halfSize - 5, 
          Phaser.Math.DegToRad(270), 
          Phaser.Math.DegToRad(270 + 360 * progress), 
          false);
        graphics.fillPath();
      }
    }

    // 绘制边框
    graphics.lineStyle(3, ready ? 0xffffff : 0x666666, 1);
    graphics.strokeCircle(centerX, centerY, halfSize);

    // 绘制装饰图案
    if (ready) {
      graphics.fillStyle(0xffffff, 0.8);
      const pattern = [
        [0, -15], [10, 0], [0, 15], [-10, 0]
      ];
      graphics.fillPoints(pattern.map(p => ({ x: centerX + p[0], y: centerY + p[1] })), true);
    }
  }

  setupInput() {
    // 绑定数字键 1-5
    this.input.keyboard.on('keydown-ONE', () => this.useSkill(0));
    this.input.keyboard.on('keydown-TWO', () => this.useSkill(1));
    this.input.keyboard.on('keydown-THREE', () => this.useSkill(2));
    this.input.keyboard.on('keydown-FOUR', () => this.useSkill(3));
    this.input.keyboard.on('keydown-FIVE', () => this.useSkill(4));
  }

  useSkill(skillId) {
    const skill = this.skills[skillId];

    if (!skill.ready) {
      // 技能冷却中，显示提示
      this.showCooldownWarning(skillId);
      return;
    }

    // 使用技能
    skill.ready = false;
    skill.progress = 1;
    this.activeCooldowns++;

    // 更新状态信号
    this.skillUsageCount[skillId]++;
    this.totalSkillsUsed++;
    this.updateInfoText();

    // 显示技能使用效果
    this.showSkillEffect(skillId);

    // 创建冷却计时器
    const startTime = this.time.now;
    const timerEvent = this.time.addEvent({
      delay: 50, // 每 50ms 更新一次进度
      repeat: skill.cooldown / 50 - 1,
      callback: () => {
        const elapsed = this.time.now - startTime;
        skill.progress = 1 - (elapsed / skill.cooldown);
        
        // 更新显示
        this.updateSkillDisplay(skillId);
        
        // 更新冷却时间文本
        const remaining = Math.ceil((skill.cooldown - elapsed) / 1000 * 10) / 10;
        this.cooldownTexts[skillId].setText(remaining.toFixed(1) + 's');
      },
      callbackScope: this
    });

    // 冷却结束
    this.time.delayedCall(skill.cooldown, () => {
      skill.ready = true;
      skill.progress = 0;
      this.activeCooldowns--;
      this.updateSkillDisplay(skillId);
      this.cooldownTexts[skillId].setVisible(false);
      this.updateInfoText();
    }, [], this);

    // 显示冷却文本
    this.cooldownTexts[skillId].setVisible(true);
    this.updateSkillDisplay(skillId);
  }

  updateSkillDisplay(skillId) {
    const skill = this.skills[skillId];
    const startX = 150;
    const spacing = 120;
    const x = startX + skillId * spacing;
    const y = 200;
    const skillSize = 80;

    this.drawSkillIcon(
      this.skillGraphics[skillId],
      x, y, skillSize,
      skill.color,
      skill.ready,
      skill.progress
    );
  }

  showSkillEffect(skillId) {
    const skill = this.skills[skillId];
    const startX = 150;
    const spacing = 120;
    const x = startX + skillId * spacing;
    const y = 200;

    // 创建技能使用特效（扩散圆环）
    const effectGraphics = this.add.graphics();
    let radius = 0;
    let alpha = 1;

    const effectTimer = this.time.addEvent({
      delay: 16,
      repeat: 30,
      callback: () => {
        effectGraphics.clear();
        effectGraphics.lineStyle(3, skill.color, alpha);
        effectGraphics.strokeCircle(x, y, radius);
        
        radius += 3;
        alpha -= 0.033;
        
        if (alpha <= 0) {
          effectGraphics.destroy();
        }
      },
      callbackScope: this
    });

    // 显示技能使用提示
    const useText = this.add.text(x, y - 60, `${skill.name} Used!`, {
      fontSize: '16px',
      color: '#' + skill.color.toString(16).padStart(6, '0'),
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: useText,
      y: y - 100,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => useText.destroy()
    });
  }

  showCooldownWarning(skillId) {
    const startX = 150;
    const spacing = 120;
    const x = startX + skillId * spacing;
    const y = 200;

    const warningText = this.add.text(x, y - 60, 'On Cooldown!', {
      fontSize: '14px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => warningText.destroy()
    });
  }

  createInfoText() {
    this.infoText = this.add.text(400, 400, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.updateInfoText();
  }

  updateInfoText() {
    const usageInfo = this.skillUsageCount.map((count, i) => `S${i + 1}:${count}`).join('  ');
    this.infoText.setText(
      `Total Skills Used: ${this.totalSkillsUsed}\n` +
      `Active Cooldowns: ${this.activeCooldowns}\n` +
      `Usage Count: ${usageInfo}`
    );
  }

  update(time, delta) {
    // 持续更新显示（如果需要更平滑的动画）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#2d2d2d',
  scene: SkillSystemScene
};

new Phaser.Game(config);