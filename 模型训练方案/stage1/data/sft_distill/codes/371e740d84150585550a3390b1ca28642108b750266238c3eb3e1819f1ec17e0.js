class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownTimer = null;
    this.skillUseCount = 0;
    this.cooldownDuration = 1500; // 1.5秒
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      skillUseCount: 0,
      isOnCooldown: false,
      cooldownProgress: 0,
      lastSkillUseTime: 0
    };

    // 创建背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 创建标题文本
    this.add.text(400, 50, '技能冷却系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '点击鼠标左键释放技能（冷却时间：1.5秒）', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能按钮背景（使用Graphics生成纹理）
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x4a90e2, 1);
    buttonGraphics.fillRoundedRect(0, 0, 150, 150, 10);
    buttonGraphics.generateTexture('skillButton', 150, 150);
    buttonGraphics.destroy();

    // 创建技能按钮
    this.skillButton = this.add.image(400, 300, 'skillButton');
    this.skillButton.setInteractive({ useHandCursor: true });

    // 创建技能图标（简单的星形）
    const iconGraphics = this.add.graphics();
    iconGraphics.fillStyle(0xffdd57, 1);
    iconGraphics.beginPath();
    const centerX = 75;
    const centerY = 75;
    const outerRadius = 40;
    const innerRadius = 20;
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        iconGraphics.moveTo(x, y);
      } else {
        iconGraphics.lineTo(x, y);
      }
    }
    iconGraphics.closePath();
    iconGraphics.fillPath();
    iconGraphics.generateTexture('skillIcon', 150, 150);
    iconGraphics.destroy();

    this.skillIcon = this.add.image(400, 300, 'skillIcon');

    // 创建冷却遮罩图形
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setDepth(1);

    // 创建冷却进度文本
    this.cooldownText = this.add.text(400, 300, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(2);

    // 创建技能使用计数文本
    this.useCountText = this.add.text(400, 480, '技能使用次数: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态文本
    this.statusText = this.add.text(400, 520, '状态: 就绪', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 监听技能按钮点击
    this.skillButton.on('pointerdown', () => this.useSkill());

    // 监听全局鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.useSkill();
      }
    });

    // 添加悬停效果
    this.skillButton.on('pointerover', () => {
      if (!this.skillOnCooldown) {
        this.skillButton.setTint(0xcccccc);
      }
    });

    this.skillButton.on('pointerout', () => {
      this.skillButton.clearTint();
    });

    console.log('[SkillCooldown] Scene created');
  }

  useSkill() {
    if (this.skillOnCooldown) {
      console.log('[SkillCooldown] Skill on cooldown, cannot use');
      return;
    }

    // 释放技能
    this.skillUseCount++;
    console.log(`[SkillCooldown] Skill used! Count: ${this.skillUseCount}`);

    // 更新信号
    window.__signals__.skillUseCount = this.skillUseCount;
    window.__signals__.lastSkillUseTime = Date.now();
    window.__signals__.isOnCooldown = true;

    // 更新计数文本
    this.useCountText.setText(`技能使用次数: ${this.skillUseCount}`);

    // 技能效果：按钮缩放动画
    this.tweens.add({
      targets: [this.skillButton, this.skillIcon],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 创建技能释放特效
    this.createSkillEffect();

    // 开始冷却
    this.startCooldown();
  }

  createSkillEffect() {
    // 创建扩散圆圈特效
    const effectCircle = this.add.graphics();
    effectCircle.lineStyle(4, 0xffdd57, 1);
    effectCircle.strokeCircle(400, 300, 75);
    effectCircle.setDepth(3);

    this.tweens.add({
      targets: effectCircle,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        effectCircle.destroy();
      }
    });
  }

  startCooldown() {
    this.skillOnCooldown = true;
    this.statusText.setText('状态: 冷却中');
    this.statusText.setColor('#ff0000');

    // 使技能按钮变灰
    this.skillButton.setTint(0x666666);
    this.skillIcon.setTint(0x666666);

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.endCooldown,
      callbackScope: this,
      loop: false
    });
  }

  endCooldown() {
    this.skillOnCooldown = false;
    this.cooldownTimer = null;
    
    console.log('[SkillCooldown] Cooldown finished');

    // 更新信号
    window.__signals__.isOnCooldown = false;
    window.__signals__.cooldownProgress = 0;

    // 恢复按钮颜色
    this.skillButton.clearTint();
    this.skillIcon.clearTint();

    // 更新状态文本
    this.statusText.setText('状态: 就绪');
    this.statusText.setColor('#00ff00');

    // 清除冷却显示
    this.cooldownMask.clear();
    this.cooldownText.setText('');

    // 就绪动画
    this.tweens.add({
      targets: [this.skillButton, this.skillIcon],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    if (this.skillOnCooldown && this.cooldownTimer) {
      // 计算冷却进度 (0到1)
      const progress = this.cooldownTimer.getProgress();
      const remainingProgress = 1 - progress;

      // 更新信号
      window.__signals__.cooldownProgress = progress;

      // 绘制冷却遮罩（扇形）
      this.cooldownMask.clear();
      this.cooldownMask.fillStyle(0x000000, 0.6);
      
      const centerX = 400;
      const centerY = 300;
      const radius = 75;
      const startAngle = -Math.PI / 2; // 从顶部开始
      const endAngle = startAngle + (2 * Math.PI * remainingProgress);

      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(centerX, centerY);
      this.cooldownMask.arc(centerX, centerY, radius, startAngle, endAngle, false);
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();

      // 显示剩余时间
      const remainingTime = (this.cooldownTimer.getRemaining() / 1000).toFixed(1);
      this.cooldownText.setText(`${remainingTime}s`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 输出验证信号
console.log('[SkillCooldown] Game initialized. Signals available at window.__signals__');