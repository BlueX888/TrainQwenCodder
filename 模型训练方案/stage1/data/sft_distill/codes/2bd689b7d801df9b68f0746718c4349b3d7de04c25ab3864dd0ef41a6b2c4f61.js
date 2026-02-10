class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = false;
    this.cooldownProgress = 0;
    this.skillUseCount = 0;
    this.cooldownTimer = null;
    this.cooldownDuration = 500; // 0.5秒 = 500毫秒
    this.cooldownStartTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 标题
    this.add.text(centerX, 50, '粉色技能冷却系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文字
    this.add.text(centerX, 100, '按空格键释放技能', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建技能按钮背景（粉色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = centerX;
    this.skillButtonY = centerY;
    this.skillButtonRadius = 60;
    this.drawSkillButton();

    // 技能图标文字
    this.add.text(this.skillButtonX, this.skillButtonY, 'SKILL', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 冷却遮罩（半透明黑色扇形）
    this.cooldownMask = this.add.graphics();

    // 冷却进度条背景
    const barX = centerX - 150;
    const barY = centerY + 120;
    const barWidth = 300;
    const barHeight = 30;

    this.add.graphics()
      .fillStyle(0x333333, 1)
      .fillRoundedRect(barX, barY, barWidth, barHeight, 5);

    // 冷却进度条
    this.cooldownBar = this.add.graphics();
    this.barX = barX;
    this.barY = barY;
    this.barWidth = barWidth;
    this.barHeight = barHeight;

    // 进度条文字
    this.progressText = this.add.text(centerX, barY + barHeight / 2, '就绪', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 状态信息
    this.statusText = this.add.text(centerX, centerY + 180, '状态: 可用\n使用次数: 0', {
      fontSize: '18px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 技能效果容器
    this.skillEffects = this.add.graphics();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.useSkill());

    // 初始绘制
    this.updateCooldownDisplay();
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    // 外圈光晕
    this.skillButton.fillStyle(0xff69b4, 0.3);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius + 10);
    
    // 主按钮（粉色）
    const buttonColor = this.skillCooldown ? 0x996677 : 0xff1493;
    this.skillButton.fillStyle(buttonColor, 1);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    // 内圈高光
    this.skillButton.fillStyle(0xffffff, 0.3);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY - 15, this.skillButtonRadius * 0.4);
  }

  useSkill() {
    if (this.skillCooldown) {
      // 技能冷却中，无法使用
      this.cameras.main.shake(100, 0.002);
      return;
    }

    // 释放技能
    this.skillUseCount++;
    this.skillCooldown = true;
    this.cooldownStartTime = this.time.now;

    // 更新按钮外观
    this.drawSkillButton();

    // 技能释放特效
    this.playSkillEffect();

    // 启动冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.skillCooldown = false;
        this.cooldownProgress = 0;
        this.drawSkillButton();
        this.updateCooldownDisplay();
      },
      callbackScope: this
    });

    // 更新状态
    this.updateCooldownDisplay();
  }

  playSkillEffect() {
    // 清除旧特效
    this.skillEffects.clear();

    // 粉色爆炸圆环效果
    const rings = 3;
    for (let i = 0; i < rings; i++) {
      this.time.delayedCall(i * 100, () => {
        const radius = this.skillButtonRadius + 20;
        const alpha = 1 - (i * 0.3);
        
        this.skillEffects.lineStyle(4, 0xff1493, alpha);
        this.skillEffects.strokeCircle(this.skillButtonX, this.skillButtonY, radius);

        // 动画扩散
        this.tweens.add({
          targets: { r: radius },
          r: radius + 100,
          duration: 500,
          ease: 'Cubic.easeOut',
          onUpdate: (tween) => {
            const value = tween.getValue();
            this.skillEffects.clear();
            this.skillEffects.lineStyle(4, 0xff1493, alpha * (1 - tween.progress));
            this.skillEffects.strokeCircle(this.skillButtonX, this.skillButtonY, value);
          },
          onComplete: () => {
            this.skillEffects.clear();
          }
        });
      });
    }

    // 屏幕闪烁
    this.cameras.main.flash(200, 255, 20, 147, false, (camera, progress) => {
      if (progress === 1) {
        this.skillEffects.clear();
      }
    });
  }

  update(time, delta) {
    if (this.skillCooldown) {
      // 计算冷却进度 (0-1)
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);
      
      this.updateCooldownDisplay();
    }
  }

  updateCooldownDisplay() {
    // 更新进度条
    this.cooldownBar.clear();
    
    if (this.skillCooldown) {
      // 绘制冷却进度（粉色）
      const currentWidth = this.barWidth * this.cooldownProgress;
      this.cooldownBar.fillStyle(0xff1493, 1);
      this.cooldownBar.fillRoundedRect(
        this.barX, 
        this.barY, 
        currentWidth, 
        this.barHeight, 
        5
      );

      // 更新进度文字
      const remaining = ((1 - this.cooldownProgress) * this.cooldownDuration / 1000).toFixed(2);
      this.progressText.setText(`冷却中: ${remaining}s`);
      this.progressText.setColor('#ff1493');
    } else {
      // 技能就绪，绘制满进度条（绿色）
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRoundedRect(
        this.barX, 
        this.barY, 
        this.barWidth, 
        this.barHeight, 
        5
      );

      this.progressText.setText('就绪');
      this.progressText.setColor('#00ff00');
    }

    // 绘制冷却遮罩（扇形）
    this.cooldownMask.clear();
    if (this.skillCooldown && this.cooldownProgress < 1) {
      this.cooldownMask.fillStyle(0x000000, 0.6);
      this.cooldownMask.slice(
        this.skillButtonX,
        this.skillButtonY,
        this.skillButtonRadius,
        Phaser.Math.DegToRad(270), // 从顶部开始
        Phaser.Math.DegToRad(270 + 360 * this.cooldownProgress),
        false
      );
      this.cooldownMask.fillPath();
    }

    // 更新状态文字
    const status = this.skillCooldown ? '冷却中' : '可用';
    const statusColor = this.skillCooldown ? '#ff1493' : '#00ff00';
    this.statusText.setText(`状态: ${status}\n使用次数: ${this.skillUseCount}`);
    this.statusText.setColor(statusColor);
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

new Phaser.Game(config);