class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillUsageCount = [0, 0, 0, 0, 0, 0, 0, 0]; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 70, 'Click skills to activate (each has different cooldown)', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建8个技能
    const skillColors = [
      0xff0000, // 红色
      0xff8800, // 橙色
      0xffff00, // 黄色
      0x00ff00, // 绿色
      0x00ffff, // 青色
      0x0088ff, // 蓝色
      0x8800ff, // 紫色
      0xff00ff  // 品红
    ];

    const baseCooldown = 2500; // 2.5秒基准
    const startX = 150;
    const startY = 150;
    const spacing = 150;

    for (let i = 0; i < 8; i++) {
      const x = startX + (i % 4) * spacing;
      const y = startY + Math.floor(i / 4) * spacing;
      const cooldownTime = baseCooldown * (i + 1); // 递增冷却时间

      this.createSkill(i, x, y, skillColors[i], cooldownTime);
    }

    // 添加统计信息显示
    this.statsText = this.add.text(400, 500, this.getStatsText(), {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  createSkill(index, x, y, color, cooldownTime) {
    const skill = {
      index: index,
      x: x,
      y: y,
      color: color,
      cooldownTime: cooldownTime,
      isOnCooldown: false,
      cooldownTimer: null,
      startTime: 0,
      container: this.add.container(x, y)
    };

    // 背景圆形
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillCircle(0, 0, 50);
    skill.container.add(bg);

    // 技能图标（使用颜色填充的圆形）
    const icon = this.add.graphics();
    icon.fillStyle(color, 1);
    icon.fillCircle(0, 0, 40);
    skill.container.add(icon);
    skill.icon = icon;

    // 冷却遮罩（半透明黑色扇形）
    const cooldownMask = this.add.graphics();
    skill.container.add(cooldownMask);
    skill.cooldownMask = cooldownMask;

    // 技能编号文本
    const numberText = this.add.text(0, -5, `${index + 1}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    skill.container.add(numberText);

    // 冷却时间文本
    const cooldownText = this.add.text(0, 70, `CD: ${cooldownTime / 1000}s`, {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    skill.container.add(cooldownText);

    // 剩余时间文本
    const remainingText = this.add.text(0, 20, '', {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    skill.container.add(remainingText);
    skill.remainingText = remainingText;

    // 使用次数文本
    const usageText = this.add.text(0, 90, `Used: 0`, {
      fontSize: '12px',
      color: '#00ff00'
    }).setOrigin(0.5);
    skill.container.add(usageText);
    skill.usageText = usageText;

    // 添加交互区域
    const hitArea = new Phaser.Geom.Circle(0, 0, 50);
    skill.container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    skill.container.on('pointerdown', () => this.useSkill(skill));
    skill.container.on('pointerover', () => {
      if (!skill.isOnCooldown) {
        icon.clear();
        icon.fillStyle(color, 1);
        icon.lineStyle(3, 0xffffff, 1);
        icon.fillCircle(0, 0, 40);
        icon.strokeCircle(0, 0, 40);
      }
    });
    skill.container.on('pointerout', () => {
      icon.clear();
      icon.fillStyle(color, 1);
      icon.fillCircle(0, 0, 40);
    });

    this.skills.push(skill);
  }

  useSkill(skill) {
    if (skill.isOnCooldown) {
      // 技能正在冷却中，无法使用
      this.showFeedback(skill, 'ON COOLDOWN!', 0xff0000);
      return;
    }

    // 使用技能
    skill.isOnCooldown = true;
    skill.startTime = this.time.now;
    this.skillUsageCount[skill.index]++;

    // 更新使用次数显示
    skill.usageText.setText(`Used: ${this.skillUsageCount[skill.index]}`);

    // 显示使用反馈
    this.showFeedback(skill, 'ACTIVATED!', 0x00ff00);

    // 创建冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.cooldownTime,
      callback: () => {
        skill.isOnCooldown = false;
        skill.cooldownTimer = null;
        skill.remainingText.setText('');
        skill.cooldownMask.clear();
        this.showFeedback(skill, 'READY!', 0x00ffff);
      },
      callbackScope: this
    });

    // 更新统计信息
    this.statsText.setText(this.getStatsText());
  }

  showFeedback(skill, text, color) {
    const feedback = this.add.text(skill.x, skill.y - 80, text, {
      fontSize: '14px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: skill.y - 120,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => feedback.destroy()
    });
  }

  update(time, delta) {
    // 更新每个技能的冷却显示
    this.skills.forEach(skill => {
      if (skill.isOnCooldown && skill.cooldownTimer) {
        const elapsed = time - skill.startTime;
        const progress = Math.min(elapsed / skill.cooldownTime, 1);
        const remaining = Math.max(0, skill.cooldownTime - elapsed);

        // 更新剩余时间文本
        skill.remainingText.setText(`${(remaining / 1000).toFixed(1)}s`);

        // 绘制冷却遮罩（扇形从上方顺时针填充）
        skill.cooldownMask.clear();
        skill.cooldownMask.fillStyle(0x000000, 0.7);
        skill.cooldownMask.beginPath();
        skill.cooldownMask.moveTo(0, 0);
        
        // 计算扇形角度（从-90度开始，顺时针）
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (1 - progress) * Math.PI * 2;
        
        skill.cooldownMask.arc(0, 0, 40, startAngle, endAngle, false);
        skill.cooldownMask.lineTo(0, 0);
        skill.cooldownMask.closePath();
        skill.cooldownMask.fillPath();
      }
    });
  }

  getStatsText() {
    const totalUsage = this.skillUsageCount.reduce((a, b) => a + b, 0);
    const skillStats = this.skillUsageCount
      .map((count, i) => `S${i + 1}:${count}`)
      .join('  ');
    return `Total Skills Used: ${totalUsage}\n${skillStats}`;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystemScene,
  parent: 'game-container'
};

new Phaser.Game(config);