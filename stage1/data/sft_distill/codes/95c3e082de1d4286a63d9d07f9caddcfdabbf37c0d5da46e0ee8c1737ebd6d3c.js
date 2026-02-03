class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.skillUsageCount = [0, 0, 0, 0, 0]; // 状态信号：每个技能使用次数
    this.totalSkillsUsed = 0; // 状态信号：总技能使用次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 70, 'Press 1-5 to use skills | Each skill has increasing cooldown', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 状态显示
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建5个技能
    const skillColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    const skillNames = ['Fireball', 'Heal', 'Shield', 'Lightning', 'Meteor'];
    const baseCooldown = 1500; // 1.5秒基准

    for (let i = 0; i < 5; i++) {
      const skill = this.createSkill(
        150 + i * 130,
        250,
        skillColors[i],
        skillNames[i],
        baseCooldown * (i + 1), // 递增冷却时间
        i + 1 // 技能编号
      );
      this.skills.push(skill);
    }

    // 绑定键盘输入
    this.input.keyboard.on('keydown-ONE', () => this.useSkill(0));
    this.input.keyboard.on('keydown-TWO', () => this.useSkill(1));
    this.input.keyboard.on('keydown-THREE', () => this.useSkill(2));
    this.input.keyboard.on('keydown-FOUR', () => this.useSkill(3));
    this.input.keyboard.on('keydown-FIVE', () => this.useSkill(4));

    // 添加鼠标点击支持
    this.skills.forEach((skill, index) => {
      skill.container.setInteractive(
        new Phaser.Geom.Rectangle(-40, -40, 80, 80),
        Phaser.Geom.Rectangle.Contains
      );
      skill.container.on('pointerdown', () => this.useSkill(index));
    });

    this.updateStatusText();
  }

  createSkill(x, y, color, name, cooldownTime, keyNumber) {
    const container = this.add.container(x, y);

    // 背景圆
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x333333, 1);
    bgGraphics.fillCircle(0, 0, 40);
    container.add(bgGraphics);

    // 技能图标（彩色圆）
    const iconGraphics = this.add.graphics();
    iconGraphics.fillStyle(color, 1);
    iconGraphics.fillCircle(0, 0, 35);
    container.add(iconGraphics);

    // 冷却遮罩
    const cooldownMask = this.add.graphics();
    container.add(cooldownMask);

    // 技能边框
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(3, 0xffffff, 1);
    borderGraphics.strokeCircle(0, 0, 40);
    container.add(borderGraphics);

    // 技能名称
    const nameText = this.add.text(0, 60, name, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(nameText);

    // 按键提示
    const keyText = this.add.text(0, -55, `[${keyNumber}]`, {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(keyText);

    // 冷却时间文本
    const cooldownText = this.add.text(0, 0, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    cooldownText.setVisible(false);
    container.add(cooldownText);

    // 使用次数文本
    const usageText = this.add.text(0, 80, 'Used: 0', {
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    container.add(usageText);

    return {
      container,
      iconGraphics,
      cooldownMask,
      cooldownText,
      usageText,
      borderGraphics,
      cooldownTime,
      isOnCooldown: false,
      cooldownTimer: null,
      cooldownStartTime: 0,
      name,
      color
    };
  }

  useSkill(index) {
    const skill = this.skills[index];

    if (skill.isOnCooldown) {
      // 技能在冷却中，显示提示
      this.showCooldownWarning(skill);
      return;
    }

    // 使用技能
    skill.isOnCooldown = true;
    skill.cooldownStartTime = this.time.now;
    this.skillUsageCount[index]++;
    this.totalSkillsUsed++;

    // 更新使用次数显示
    skill.usageText.setText(`Used: ${this.skillUsageCount[index]}`);

    // 显示技能效果
    this.showSkillEffect(skill);

    // 显示冷却文本
    skill.cooldownText.setVisible(true);

    // 设置冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.cooldownTime,
      callback: () => {
        skill.isOnCooldown = false;
        skill.cooldownText.setVisible(false);
        skill.cooldownMask.clear();
        skill.borderGraphics.clear();
        skill.borderGraphics.lineStyle(3, 0xffffff, 1);
        skill.borderGraphics.strokeCircle(0, 0, 40);
        
        // 技能准备好的视觉反馈
        this.tweens.add({
          targets: skill.iconGraphics,
          alpha: 0.5,
          duration: 200,
          yoyo: true,
          repeat: 1
        });
      }
    });

    this.updateStatusText();
  }

  showSkillEffect(skill) {
    // 创建技能释放特效
    const effectGraphics = this.add.graphics();
    effectGraphics.fillStyle(skill.color, 0.6);
    effectGraphics.fillCircle(skill.container.x, skill.container.y, 40);

    this.tweens.add({
      targets: effectGraphics,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        effectGraphics.destroy();
      }
    });

    // 技能图标缩放动画
    this.tweens.add({
      targets: skill.container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }

  showCooldownWarning(skill) {
    // 冷却中的警告效果
    this.tweens.add({
      targets: skill.container,
      x: skill.container.x - 5,
      duration: 50,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    this.skills.forEach(skill => {
      if (skill.isOnCooldown && skill.cooldownTimer) {
        const elapsed = time - skill.cooldownStartTime;
        const progress = elapsed / skill.cooldownTime;
        const remaining = Math.max(0, skill.cooldownTime - elapsed);

        // 更新冷却文本
        skill.cooldownText.setText(Math.ceil(remaining / 1000).toString());

        // 绘制冷却遮罩（扇形）
        skill.cooldownMask.clear();
        skill.cooldownMask.fillStyle(0x000000, 0.7);
        
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (1 - progress) * Math.PI * 2;
        
        skill.cooldownMask.beginPath();
        skill.cooldownMask.moveTo(0, 0);
        skill.cooldownMask.arc(0, 0, 40, startAngle, endAngle, false);
        skill.cooldownMask.closePath();
        skill.cooldownMask.fillPath();

        // 更新边框颜色（冷却中显示红色）
        skill.borderGraphics.clear();
        skill.borderGraphics.lineStyle(3, 0xff0000, 1);
        skill.borderGraphics.strokeCircle(0, 0, 40);
      }
    });
  }

  updateStatusText() {
    const cooldownSkills = this.skills.filter(s => s.isOnCooldown).length;
    const readySkills = 5 - cooldownSkills;
    
    this.statusText.setText(
      `Total Skills Used: ${this.totalSkillsUsed} | Ready: ${readySkills}/5 | On Cooldown: ${cooldownSkills}/5`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SkillSystem
};

new Phaser.Game(config);