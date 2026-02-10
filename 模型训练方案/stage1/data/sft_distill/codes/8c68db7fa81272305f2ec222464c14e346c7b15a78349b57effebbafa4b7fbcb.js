class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillReady = true;
    this.cooldownDuration = 2500; // 2.5秒
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(centerX, 100, 'Purple Skill Cooldown System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(centerX, 150, 'Press SPACE to use skill', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能按钮背景（紫色方块）
    this.skillButton = this.add.graphics();
    this.skillButton.fillStyle(0x9b59b6, 1);
    this.skillButton.fillRect(centerX - 75, centerY - 75, 150, 150);

    // 创建技能按钮边框
    this.skillBorder = this.add.graphics();
    this.skillBorder.lineStyle(4, 0xffffff, 1);
    this.skillBorder.strokeRect(centerX - 75, centerY - 75, 150, 150);

    // 创建冷却遮罩（半透明黑色）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setVisible(false);

    // 创建技能图标文本
    this.skillIcon = this.add.text(centerX, centerY, 'SKILL', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建冷却时间文本
    this.cooldownText = this.add.text(centerX, centerY, '', {
      fontSize: '36px',
      color: '#ff6b6b',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建状态文本
    this.statusText = this.add.text(centerX, 450, 'Status: Ready', {
      fontSize: '24px',
      color: '#2ecc71'
    }).setOrigin(0.5);

    // 创建使用次数统计
    this.useCountText = this.add.text(centerX, 500, 'Skills Used: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建冷却进度条背景
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x333333, 1);
    progressBarBg.fillRect(centerX - 150, 520, 300, 30);

    // 创建冷却进度条
    this.progressBar = this.add.graphics();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.useSkill());

    // 冷却计时器引用
    this.cooldownTimer = null;
  }

  useSkill() {
    if (!this.skillReady) {
      // 技能冷却中，无法使用
      this.cameras.main.shake(100, 0.002);
      return;
    }

    // 释放技能
    this.skillReady = false;
    this.skillUseCount++;

    // 更新使用次数
    this.useCountText.setText(`Skills Used: ${this.skillUseCount}`);

    // 技能特效：紫色闪光
    this.createSkillEffect();

    // 更新状态文本
    this.statusText.setText('Status: Cooling Down');
    this.statusText.setColor('#e74c3c');

    // 隐藏技能图标，显示冷却文本
    this.skillIcon.setVisible(false);
    this.cooldownText.setVisible(true);
    this.cooldownMask.setVisible(true);

    // 启动冷却计时器
    this.startCooldown();
  }

  startCooldown() {
    const startTime = this.time.now;
    const centerX = 400;
    const centerY = 300;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: () => {
        const elapsed = this.time.now - startTime;
        const remaining = this.cooldownDuration - elapsed;
        const progress = elapsed / this.cooldownDuration;

        if (remaining > 0) {
          // 更新冷却时间显示
          const seconds = (remaining / 1000).toFixed(1);
          this.cooldownText.setText(seconds + 's');

          // 绘制冷却遮罩（从上到下消失）
          this.cooldownMask.clear();
          this.cooldownMask.fillStyle(0x000000, 0.7);
          const maskHeight = 150 * (1 - progress);
          this.cooldownMask.fillRect(
            centerX - 75,
            centerY - 75,
            150,
            maskHeight
          );

          // 更新进度条
          this.progressBar.clear();
          this.progressBar.fillStyle(0x9b59b6, 1);
          this.progressBar.fillRect(
            centerX - 150,
            520,
            300 * progress,
            30
          );
        } else {
          // 冷却结束
          this.resetSkill();
        }
      },
      loop: true
    });
  }

  resetSkill() {
    // 停止计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
      this.cooldownTimer = null;
    }

    // 重置技能状态
    this.skillReady = true;

    // 隐藏冷却显示
    this.cooldownText.setVisible(false);
    this.cooldownMask.setVisible(false);
    this.skillIcon.setVisible(true);

    // 清空进度条
    this.progressBar.clear();

    // 更新状态文本
    this.statusText.setText('Status: Ready');
    this.statusText.setColor('#2ecc71');

    // 技能就绪特效
    this.tweens.add({
      targets: this.skillButton,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 1
    });
  }

  createSkillEffect() {
    const centerX = 400;
    const centerY = 300;

    // 创建紫色爆炸效果
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 100;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      const particle = this.add.graphics();
      particle.fillStyle(0x9b59b6, 1);
      particle.fillCircle(0, 0, 8);
      particle.setPosition(centerX, centerY);

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });

      particles.push(particle);
    }

    // 中心闪光
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(centerX, centerY, 50);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }

  update(time, delta) {
    // 主循环更新（本例中主要逻辑在事件回调中）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene
};

new Phaser.Game(config);