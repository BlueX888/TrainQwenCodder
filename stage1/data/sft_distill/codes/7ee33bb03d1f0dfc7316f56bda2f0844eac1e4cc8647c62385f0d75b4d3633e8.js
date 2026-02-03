class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillUsageCount = [0, 0, 0, 0, 0]; // 状态信号：记录每个技能使用次数
    this.totalSkillsUsed = 0; // 总技能使用次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 技能配置
    const skillConfigs = [
      { key: '1', name: 'Skill 1', cooldown: 2000, color: 0xff0000 },
      { key: '2', name: 'Skill 2', cooldown: 4000, color: 0x00ff00 },
      { key: '3', name: 'Skill 3', cooldown: 6000, color: 0x0000ff },
      { key: '4', name: 'Skill 4', cooldown: 8000, color: 0xffff00 },
      { key: '5', name: 'Skill 5', cooldown: 10000, color: 0xff00ff }
    ];

    // 创建标题
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 70, 'Press 1-5 to use skills', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建技能显示
    const startX = 100;
    const startY = 150;
    const spacing = 140;

    skillConfigs.forEach((config, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // 创建技能对象
      const skill = {
        config: config,
        isOnCooldown: false,
        cooldownTimer: null,
        graphics: {
          container: this.add.container(x, y),
          background: this.add.graphics(),
          cooldownMask: this.add.graphics(),
          border: this.add.graphics()
        },
        texts: {
          name: null,
          key: null,
          cooldown: null,
          usage: null
        }
      };

      // 绘制技能背景
      skill.graphics.background.fillStyle(config.color, 0.3);
      skill.graphics.background.fillRoundedRect(-50, -50, 100, 100, 10);

      // 绘制技能边框
      skill.graphics.border.lineStyle(3, config.color, 1);
      skill.graphics.border.strokeRoundedRect(-50, -50, 100, 100, 10);

      // 冷却遮罩（初始不可见）
      skill.graphics.cooldownMask.setAlpha(0.7);

      // 添加到容器
      skill.graphics.container.add(skill.graphics.background);
      skill.graphics.container.add(skill.graphics.cooldownMask);
      skill.graphics.container.add(skill.graphics.border);

      // 技能名称
      skill.texts.name = this.add.text(x, y - 80, config.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 按键提示
      skill.texts.key = this.add.text(x, y, `[${config.key}]`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 冷却时间文本
      skill.texts.cooldown = this.add.text(x, y + 70, `CD: ${config.cooldown / 1000}s`, {
        fontSize: '14px',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      // 使用次数文本
      skill.texts.usage = this.add.text(x, y + 90, 'Used: 0', {
        fontSize: '12px',
        color: '#888888'
      }).setOrigin(0.5);

      this.skills.push(skill);
    });

    // 创建状态显示
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.totalUsageText = this.add.text(400, 530, 'Total Skills Used: 0', {
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 键盘输入监听
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const index = parseInt(key) - 1;
        this.useSkill(index);
      }
    });

    this.updateStatus();
  }

  useSkill(index) {
    const skill = this.skills[index];

    if (skill.isOnCooldown) {
      this.showMessage(`${skill.config.name} is on cooldown!`, 0xff0000);
      return;
    }

    // 使用技能
    skill.isOnCooldown = true;
    this.skillUsageCount[index]++;
    this.totalSkillsUsed++;

    // 更新使用次数显示
    skill.texts.usage.setText(`Used: ${this.skillUsageCount[index]}`);
    this.totalUsageText.setText(`Total Skills Used: ${this.totalSkillsUsed}`);

    // 显示成功消息
    this.showMessage(`${skill.config.name} activated!`, 0x00ff00);

    // 技能效果动画
    this.tweens.add({
      targets: skill.graphics.container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 创建冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.config.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.cooldownTimer = null;
        this.showMessage(`${skill.config.name} ready!`, 0x00ffff);
      },
      callbackScope: this
    });

    this.updateStatus();
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    this.skills.forEach((skill, index) => {
      if (skill.isOnCooldown && skill.cooldownTimer) {
        // 计算冷却进度
        const progress = skill.cooldownTimer.getProgress();
        const remaining = skill.cooldownTimer.getRemaining();

        // 更新冷却遮罩
        skill.graphics.cooldownMask.clear();
        skill.graphics.cooldownMask.fillStyle(0x000000, 0.7);

        // 绘制冷却扇形
        const angle = (1 - progress) * Math.PI * 2;
        skill.graphics.cooldownMask.beginPath();
        skill.graphics.cooldownMask.moveTo(0, 0);
        skill.graphics.cooldownMask.arc(0, 0, 50, -Math.PI / 2, -Math.PI / 2 + angle, false);
        skill.graphics.cooldownMask.closePath();
        skill.graphics.cooldownMask.fillPath();

        // 更新冷却时间文本
        skill.texts.cooldown.setText(`CD: ${(remaining / 1000).toFixed(1)}s`);
        skill.texts.cooldown.setColor('#ff6666');

        // 按键提示变暗
        skill.texts.key.setAlpha(0.3);
      } else {
        // 技能可用
        skill.graphics.cooldownMask.clear();
        skill.texts.cooldown.setText(`CD: ${skill.config.cooldown / 1000}s`);
        skill.texts.cooldown.setColor('#aaaaaa');
        skill.texts.key.setAlpha(1);
      }
    });
  }

  showMessage(text, color) {
    this.statusText.setText(text);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));

    // 消息淡出效果
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.statusText.setAlpha(1);
      }
    });
  }

  updateStatus() {
    const onCooldownCount = this.skills.filter(s => s.isOnCooldown).length;
    const readyCount = this.skills.length - onCooldownCount;
    console.log(`Skills Ready: ${readyCount}, On Cooldown: ${onCooldownCount}`);
    console.log('Usage Count:', this.skillUsageCount);
    console.log('Total Used:', this.totalSkillsUsed);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SkillSystemScene
};

new Phaser.Game(config);