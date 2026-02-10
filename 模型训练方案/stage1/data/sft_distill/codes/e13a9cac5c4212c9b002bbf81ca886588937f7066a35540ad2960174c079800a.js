class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillKeys = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 技能配置
    const skillConfigs = [
      { name: 'Skill 1', key: 'Q', cooldown: 1000, color: 0xff4444, x: 100 },
      { name: 'Skill 2', key: 'W', cooldown: 2000, color: 0x44ff44, x: 300 },
      { name: 'Skill 3', key: 'E', cooldown: 3000, color: 0x4444ff, x: 500 }
    ];

    // 创建技能对象
    skillConfigs.forEach((config, index) => {
      const skill = this.createSkill(config, index);
      this.skills.push(skill);
    });

    // 设置键盘输入
    this.skillKeys = this.input.keyboard.addKeys({
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      E: Phaser.Input.Keyboard.KeyCodes.E
    });

    // 添加标题
    this.add.text(400, 50, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加说明文字
    this.add.text(400, 100, 'Press Q, W, E to use skills', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 验证状态变量
    this.totalSkillsUsed = 0;
    this.skillUsageCount = [0, 0, 0]; // 每个技能的使用次数
  }

  createSkill(config, index) {
    const skill = {
      name: config.name,
      key: config.key,
      cooldown: config.cooldown,
      color: config.color,
      x: config.x,
      y: 300,
      ready: true,
      cooldownTimer: null,
      remainingTime: 0,
      usageCount: 0
    };

    // 创建技能按钮背景
    skill.background = this.add.graphics();
    skill.background.fillStyle(0x333333, 1);
    skill.background.fillRoundedRect(skill.x - 60, skill.y - 60, 120, 120, 10);

    // 创建技能图标（使用颜色填充的圆形）
    skill.icon = this.add.graphics();
    skill.icon.fillStyle(skill.color, 1);
    skill.icon.fillCircle(skill.x, skill.y, 40);

    // 创建冷却遮罩
    skill.cooldownMask = this.add.graphics();
    skill.cooldownMask.setDepth(1);

    // 创建冷却进度条背景
    skill.progressBg = this.add.graphics();
    skill.progressBg.fillStyle(0x222222, 1);
    skill.progressBg.fillRect(skill.x - 50, skill.y + 60, 100, 10);

    // 创建冷却进度条
    skill.progressBar = this.add.graphics();
    skill.progressBar.setDepth(2);

    // 创建技能名称文本
    skill.nameText = this.add.text(skill.x, skill.y - 80, skill.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建快捷键文本
    skill.keyText = this.add.text(skill.x, skill.y, skill.key, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    // 创建冷却时间文本
    skill.cooldownText = this.add.text(skill.x, skill.y + 85, '', {
      fontSize: '14px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建状态文本
    skill.statusText = this.add.text(skill.x, skill.y + 105, 'READY', {
      fontSize: '16px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    return skill;
  }

  update(time, delta) {
    // 检查技能按键
    if (Phaser.Input.Keyboard.JustDown(this.skillKeys.Q)) {
      this.useSkill(0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.skillKeys.W)) {
      this.useSkill(1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.skillKeys.E)) {
      this.useSkill(2);
    }

    // 更新所有技能的冷却显示
    this.skills.forEach(skill => {
      this.updateSkillCooldown(skill, delta);
    });

    // 更新状态文本
    this.statusText.setText(
      `Total Skills Used: ${this.totalSkillsUsed} | ` +
      `S1: ${this.skillUsageCount[0]} | ` +
      `S2: ${this.skillUsageCount[1]} | ` +
      `S3: ${this.skillUsageCount[2]}`
    );
  }

  useSkill(index) {
    const skill = this.skills[index];

    if (!skill.ready) {
      // 技能冷却中，无法使用
      this.flashSkill(skill, 0xff0000);
      return;
    }

    // 使用技能
    skill.ready = false;
    skill.remainingTime = skill.cooldown;
    skill.usageCount++;
    this.totalSkillsUsed++;
    this.skillUsageCount[index]++;

    // 视觉反馈
    this.flashSkill(skill, 0xffff00);

    // 更新状态文本
    skill.statusText.setText('COOLING');
    skill.statusText.setColor('#ff0000');

    // 创建冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        this.onSkillReady(skill);
      },
      callbackScope: this
    });
  }

  onSkillReady(skill) {
    skill.ready = true;
    skill.remainingTime = 0;
    skill.cooldownTimer = null;

    // 更新状态文本
    skill.statusText.setText('READY');
    skill.statusText.setColor('#00ff00');

    // 清除冷却显示
    skill.cooldownMask.clear();
    skill.progressBar.clear();
    skill.cooldownText.setText('');

    // 视觉反馈
    this.flashSkill(skill, 0x00ff00);
  }

  updateSkillCooldown(skill, delta) {
    if (!skill.ready && skill.cooldownTimer) {
      // 更新剩余时间
      skill.remainingTime = skill.cooldown - skill.cooldownTimer.getElapsed();
      
      if (skill.remainingTime < 0) {
        skill.remainingTime = 0;
      }

      // 计算冷却进度（0到1）
      const progress = skill.remainingTime / skill.cooldown;

      // 绘制冷却遮罩（半透明黑色覆盖）
      skill.cooldownMask.clear();
      skill.cooldownMask.fillStyle(0x000000, 0.6);
      
      // 使用扇形绘制冷却进度
      if (progress > 0) {
        skill.cooldownMask.slice(
          skill.x,
          skill.y,
          40,
          Phaser.Math.DegToRad(270), // 从顶部开始
          Phaser.Math.DegToRad(270 + 360 * progress),
          false
        );
        skill.cooldownMask.fillPath();
      }

      // 绘制进度条
      skill.progressBar.clear();
      skill.progressBar.fillStyle(skill.color, 1);
      const barWidth = 100 * (1 - progress);
      skill.progressBar.fillRect(skill.x - 50, skill.y + 60, barWidth, 10);

      // 更新冷却时间文本
      const remainingSeconds = (skill.remainingTime / 1000).toFixed(1);
      skill.cooldownText.setText(`${remainingSeconds}s`);
    }
  }

  flashSkill(skill, color) {
    // 创建闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(color, 0.5);
    flash.fillCircle(skill.x, skill.y, 50);
    flash.setDepth(4);

    // 淡出动画
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillSystemScene,
  parent: 'game-container'
};

new Phaser.Game(config);