class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 可验证的状态信号
    this.skillUsedCount = 0;
    this.isOnCooldown = false;
    this.lastCooldownProgress = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化全局信号对象
    window.__signals__ = {
      skillUsedCount: 0,
      isOnCooldown: false,
      cooldownProgress: 0,
      logs: []
    };

    // 添加标题
    this.add.text(400, 50, '技能冷却系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, '点击鼠标左键释放技能', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建技能图标容器
    const iconX = 400;
    const iconY = 300;
    const iconSize = 120;

    // 1. 绘制技能图标背景（深蓝色）
    const iconBg = this.add.graphics();
    iconBg.fillStyle(0x1a1a2e, 1);
    iconBg.fillRoundedRect(iconX - iconSize/2, iconY - iconSize/2, iconSize, iconSize, 10);

    // 2. 绘制技能图标主体（渐变效果用多层模拟）
    const iconMain = this.add.graphics();
    iconMain.fillStyle(0x0f4c81, 1);
    iconMain.fillRoundedRect(iconX - iconSize/2 + 5, iconY - iconSize/2 + 5, iconSize - 10, iconSize - 10, 8);
    
    iconMain.fillStyle(0x3282b8, 1);
    iconMain.fillCircle(iconX, iconY, 35);
    
    iconMain.fillStyle(0x4da6ff, 1);
    iconMain.fillCircle(iconX, iconY - 5, 25);

    // 3. 创建冷却遮罩层（灰色半透明）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setDepth(10);
    this.cooldownMask.setVisible(false);

    // 4. 创建冷却进度文本
    this.cooldownText = this.add.text(iconX, iconY, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.cooldownText.setVisible(false);

    // 5. 创建状态显示文本
    this.statusText = this.add.text(400, 450, '状态: 就绪', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.usageText = this.add.text(400, 490, '使用次数: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 6. 冷却计时器引用
    this.cooldownTimer = null;
    this.cooldownDuration = 1500; // 1.5秒（毫秒）

    // 7. 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.useSkill();
      }
    });

    // 添加提示文本
    this.add.text(400, 550, '冷却时间: 1.5秒', {
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);

    // 记录初始状态
    this.logSignal('游戏初始化完成');
  }

  useSkill() {
    // 检查是否在冷却中
    if (this.isOnCooldown) {
      this.logSignal('技能冷却中，无法使用');
      return;
    }

    // 释放技能
    this.skillUsedCount++;
    this.isOnCooldown = true;

    // 更新全局信号
    window.__signals__.skillUsedCount = this.skillUsedCount;
    window.__signals__.isOnCooldown = true;

    // 更新UI
    this.statusText.setText('状态: 冷却中');
    this.statusText.setColor('#ff6b6b');
    this.usageText.setText(`使用次数: ${this.skillUsedCount}`);

    // 显示冷却效果
    this.cooldownMask.setVisible(true);
    this.cooldownText.setVisible(true);

    // 记录日志
    this.logSignal(`技能释放 #${this.skillUsedCount}`);

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });

    // 播放技能效果动画（简单的闪光效果）
    this.playSkillEffect();
  }

  playSkillEffect() {
    // 创建技能释放的视觉效果
    const effect = this.add.graphics();
    effect.setDepth(5);
    
    let alpha = 1;
    const effectTween = this.tweens.add({
      targets: { value: 0 },
      value: 1,
      duration: 300,
      onUpdate: (tween) => {
        effect.clear();
        alpha = 1 - tween.getValue();
        effect.fillStyle(0x4da6ff, alpha * 0.5);
        effect.fillCircle(400, 300, 60 + tween.getValue() * 40);
      },
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  onCooldownComplete() {
    // 冷却结束
    this.isOnCooldown = false;
    this.cooldownTimer = null;

    // 更新全局信号
    window.__signals__.isOnCooldown = false;
    window.__signals__.cooldownProgress = 0;

    // 隐藏冷却效果
    this.cooldownMask.setVisible(false);
    this.cooldownText.setVisible(false);

    // 更新状态文本
    this.statusText.setText('状态: 就绪');
    this.statusText.setColor('#00ff00');

    // 记录日志
    this.logSignal('技能冷却完成');
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.isOnCooldown && this.cooldownTimer) {
      // 获取冷却进度（0到1）
      const progress = this.cooldownTimer.getProgress();
      this.lastCooldownProgress = progress;

      // 更新全局信号
      window.__signals__.cooldownProgress = Math.round(progress * 100);

      // 绘制灰色遮罩（从下到上减少）
      this.cooldownMask.clear();
      this.cooldownMask.fillStyle(0x000000, 0.7);
      
      const iconX = 400;
      const iconY = 300;
      const iconSize = 120;
      const maskHeight = iconSize * (1 - progress);
      
      this.cooldownMask.fillRoundedRect(
        iconX - iconSize/2,
        iconY - iconSize/2,
        iconSize,
        maskHeight,
        10
      );

      // 更新冷却百分比文本
      const remainingPercent = Math.ceil((1 - progress) * 100);
      this.cooldownText.setText(`${remainingPercent}%`);

      // 更新剩余时间显示
      const remainingTime = ((1 - progress) * this.cooldownDuration / 1000).toFixed(1);
      this.statusText.setText(`状态: 冷却中 (${remainingTime}s)`);
    }
  }

  logSignal(message) {
    const log = {
      timestamp: Date.now(),
      message: message,
      skillUsedCount: this.skillUsedCount,
      isOnCooldown: this.isOnCooldown,
      cooldownProgress: Math.round(this.lastCooldownProgress * 100)
    };
    
    window.__signals__.logs.push(log);
    console.log('[SIGNAL]', JSON.stringify(log));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d44',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);