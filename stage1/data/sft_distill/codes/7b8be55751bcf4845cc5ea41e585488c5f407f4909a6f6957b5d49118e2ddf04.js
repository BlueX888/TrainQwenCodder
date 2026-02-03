class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0; // 0-1之间，0表示冷却完成，1表示刚开始冷却
    this.cooldownDuration = 1000; // 1秒冷却时间
    this.cooldownTimer = null;
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能按钮（红色圆形）
    this.skillButton = this.add.graphics();
    this.drawSkillButton(false);

    // 创建冷却遮罩（半透明黑色扇形）
    this.cooldownMask = this.add.graphics();

    // 创建冷却进度条
    this.createCooldownBar();

    // 创建技能效果容器
    this.skillEffect = this.add.graphics();

    // 创建文本提示
    this.instructionText = this.add.text(400, 50, '点击鼠标左键释放技能', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.statusText = this.add.text(400, 100, '技能状态: 就绪', {
      fontSize: '20px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    this.useCountText = this.add.text(400, 130, '使用次数: 0', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryUseSkill();
      }
    });

    // 添加键盘快捷键（空格键）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.tryUseSkill();
    });
  }

  createCooldownBar() {
    // 进度条背景
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRect(250, 500, 300, 30);
    this.progressBarBg.lineStyle(2, 0x666666, 1);
    this.progressBarBg.strokeRect(250, 500, 300, 30);

    // 进度条前景
    this.progressBarFg = this.add.graphics();

    // 进度条文本
    this.progressText = this.add.text(400, 515, '冷却: 0%', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  drawSkillButton(isActive) {
    this.skillButton.clear();
    
    // 技能按钮主体（红色圆形）
    const buttonX = 400;
    const buttonY = 300;
    const buttonRadius = 60;

    if (isActive) {
      // 激活状态：亮红色
      this.skillButton.fillStyle(0xff0000, 1);
      this.skillButton.lineStyle(4, 0xff6666, 1);
    } else {
      // 就绪状态：深红色
      this.skillButton.fillStyle(0xcc0000, 1);
      this.skillButton.lineStyle(4, 0xff0000, 1);
    }

    this.skillButton.fillCircle(buttonX, buttonY, buttonRadius);
    this.skillButton.strokeCircle(buttonX, buttonY, buttonRadius);

    // 绘制技能图标（简单的闪电符号）
    this.skillButton.lineStyle(6, 0xffffff, 1);
    this.skillButton.beginPath();
    this.skillButton.moveTo(buttonX - 10, buttonY - 25);
    this.skillButton.lineTo(buttonX + 5, buttonY);
    this.skillButton.lineTo(buttonX - 5, buttonY);
    this.skillButton.lineTo(buttonX + 10, buttonY + 25);
    this.skillButton.strokePath();
  }

  tryUseSkill() {
    if (this.skillOnCooldown) {
      // 技能在冷却中，无法使用
      this.shakeButton();
      return;
    }

    // 使用技能
    this.useSkill();
  }

  useSkill() {
    this.skillUseCount++;
    this.useCountText.setText(`使用次数: ${this.skillUseCount}`);

    // 播放技能效果
    this.playSkillEffect();

    // 进入冷却状态
    this.startCooldown();

    // 更新状态文本
    this.statusText.setText('技能状态: 冷却中');
    this.statusText.setColor('#ff0000');
  }

  playSkillEffect() {
    // 红色闪光效果
    this.skillEffect.clear();
    this.skillEffect.fillStyle(0xff0000, 0.6);
    this.skillEffect.fillCircle(400, 300, 100);

    // 按钮激活状态
    this.drawSkillButton(true);

    // 渐隐效果
    this.tweens.add({
      targets: this.skillEffect,
      alpha: { from: 1, to: 0 },
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.skillEffect.clear();
      }
    });

    // 扩散圆环效果
    const ring = this.add.graphics();
    ring.lineStyle(4, 0xff0000, 1);
    ring.strokeCircle(400, 300, 60);

    this.tweens.add({
      targets: ring,
      alpha: { from: 1, to: 0 },
      scaleX: { from: 1, to: 2 },
      scaleY: { from: 1, to: 2 },
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        ring.destroy();
      }
    });
  }

  startCooldown() {
    this.skillOnCooldown = true;
    this.cooldownProgress = 1;

    const startTime = this.time.now;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.endCooldown();
      },
      callbackScope: this
    });

    // 记录开始时间用于update中计算进度
    this.cooldownStartTime = startTime;
  }

  endCooldown() {
    this.skillOnCooldown = false;
    this.cooldownProgress = 0;
    this.cooldownTimer = null;

    // 清除冷却遮罩
    this.cooldownMask.clear();

    // 恢复按钮状态
    this.drawSkillButton(false);

    // 更新状态文本
    this.statusText.setText('技能状态: 就绪');
    this.statusText.setColor('#00ff00');

    // 就绪提示动画
    this.tweens.add({
      targets: this.skillButton,
      scaleX: { from: 1.2, to: 1 },
      scaleY: { from: 1.2, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  shakeButton() {
    // 按钮抖动效果，表示技能不可用
    this.tweens.add({
      targets: this.skillButton,
      x: { from: 0, to: 5 },
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power1'
    });
  }

  update(time, delta) {
    if (this.skillOnCooldown && this.cooldownTimer) {
      // 计算冷却进度
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = 1 - Math.min(elapsed / this.cooldownDuration, 1);

      // 更新冷却遮罩（扇形）
      this.updateCooldownMask();

      // 更新进度条
      this.updateProgressBar();
    }
  }

  updateCooldownMask() {
    this.cooldownMask.clear();
    
    if (this.cooldownProgress > 0) {
      // 绘制半透明黑色扇形遮罩
      this.cooldownMask.fillStyle(0x000000, 0.6);
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(400, 300);
      this.cooldownMask.arc(
        400, 
        300, 
        60, 
        Phaser.Math.DegToRad(-90), 
        Phaser.Math.DegToRad(-90 + 360 * this.cooldownProgress),
        false
      );
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
    }
  }

  updateProgressBar() {
    this.progressBarFg.clear();

    const progress = 1 - this.cooldownProgress;
    const barWidth = 300 * progress;

    // 进度条颜色渐变（红色到绿色）
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      100,
      progress * 100
    );

    const colorHex = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

    this.progressBarFg.fillStyle(colorHex, 1);
    this.progressBarFg.fillRect(250, 500, barWidth, 30);

    // 更新进度文本
    const percentage = Math.floor(progress * 100);
    this.progressText.setText(`冷却: ${percentage}%`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: SkillCooldownScene
};

new Phaser.Game(config);