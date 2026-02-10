class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 可验证的状态信号
    this.skillUsedCount = 0;  // 技能使用次数
    this.isOnCooldown = false;  // 冷却状态
    this.cooldownRemaining = 0;  // 剩余冷却时间
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题文本
    this.add.text(width / 2, 50, '粉色技能冷却系统', {
      fontSize: '32px',
      color: '#ff69b4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文本
    this.instructionText = this.add.text(width / 2, 120, '按 [空格键] 释放技能', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 技能按钮（粉色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = width / 2;
    this.skillButtonY = height / 2;
    this.skillButtonRadius = 60;
    this.drawSkillButton(false);

    // 技能按钮文本
    this.skillButtonText = this.add.text(this.skillButtonX, this.skillButtonY, '技能\n就绪', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRoundedRect(width / 2 - 200, height / 2 + 120, 400, 30, 15);

    // 冷却进度条
    this.cooldownBar = this.add.graphics();

    // 冷却时间文本
    this.cooldownText = this.add.text(width / 2, height / 2 + 135, '', {
      fontSize: '18px',
      color: '#ff69b4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 状态信息文本
    this.statusText = this.add.text(width / 2, height - 100, '技能使用次数: 0', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 技能效果容器
    this.skillEffects = [];

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.useSkill());

    // 冷却计时器
    this.cooldownTimer = null;
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.isOnCooldown && this.cooldownTimer) {
      this.cooldownRemaining = this.cooldownTimer.getRemaining() / 1000;
      const progress = 1 - this.cooldownTimer.getProgress();
      
      // 更新进度条
      this.updateCooldownBar(progress);
      
      // 更新冷却时间文本
      this.cooldownText.setText(`冷却中: ${this.cooldownRemaining.toFixed(1)}秒`);
    }

    // 更新技能效果动画
    for (let i = this.skillEffects.length - 1; i >= 0; i--) {
      const effect = this.skillEffects[i];
      effect.alpha -= delta * 0.001;
      effect.scale += delta * 0.002;
      
      if (effect.alpha <= 0) {
        effect.destroy();
        this.skillEffects.splice(i, 1);
      }
    }
  }

  drawSkillButton(isOnCooldown) {
    this.skillButton.clear();
    
    if (isOnCooldown) {
      // 冷却状态 - 灰色
      this.skillButton.fillStyle(0x666666, 0.8);
      this.skillButton.lineStyle(4, 0x444444, 1);
    } else {
      // 就绪状态 - 粉色发光
      this.skillButton.fillStyle(0xff69b4, 1);
      this.skillButton.lineStyle(4, 0xff1493, 1);
    }
    
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
  }

  useSkill() {
    // 检查是否在冷却中
    if (this.isOnCooldown) {
      // 播放错误提示动画
      this.tweens.add({
        targets: this.skillButton,
        x: this.skillButtonX - 10,
        duration: 50,
        yoyo: true,
        repeat: 2
      });
      return;
    }

    // 释放技能
    this.skillUsedCount++;
    this.isOnCooldown = true;

    // 更新状态文本
    this.statusText.setText(`技能使用次数: ${this.skillUsedCount}`);

    // 更新按钮状态
    this.drawSkillButton(true);
    this.skillButtonText.setText('冷却中');
    this.instructionText.setText('技能冷却中...');

    // 创建粉色技能效果
    this.createSkillEffect();

    // 启动冷却计时器（4秒）
    this.cooldownTimer = this.time.addEvent({
      delay: 4000,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });

    // 初始化进度条
    this.updateCooldownBar(1);
  }

  createSkillEffect() {
    // 创建多个粉色波纹效果
    for (let i = 0; i < 3; i++) {
      const effect = this.add.graphics();
      effect.lineStyle(4, 0xff69b4, 1);
      effect.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
      effect.alpha = 1;
      effect.scale = 1;
      this.skillEffects.push(effect);

      // 延迟创建效果
      this.time.delayedCall(i * 150, () => {
        const delayedEffect = this.add.graphics();
        delayedEffect.lineStyle(3, 0xff1493, 1);
        delayedEffect.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
        delayedEffect.alpha = 1;
        delayedEffect.scale = 1;
        this.skillEffects.push(delayedEffect);
      });
    }

    // 创建中心闪光
    const flash = this.add.graphics();
    flash.fillStyle(0xff69b4, 0.8);
    flash.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius * 1.5);
    flash.alpha = 1;
    flash.scale = 0.5;
    this.skillEffects.push(flash);

    // 屏幕闪光效果
    const screenFlash = this.add.graphics();
    screenFlash.fillStyle(0xff69b4, 0.3);
    screenFlash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.tweens.add({
      targets: screenFlash,
      alpha: 0,
      duration: 300,
      onComplete: () => screenFlash.destroy()
    });
  }

  updateCooldownBar(progress) {
    const width = this.cameras.main.width;
    const barWidth = 400;
    const barHeight = 30;
    const barX = width / 2 - 200;
    const barY = this.skillButtonY + 120;

    this.cooldownBar.clear();
    
    if (progress > 0) {
      // 根据进度显示不同颜色
      let color;
      if (progress > 0.66) {
        color = 0xff1493;  // 深粉色
      } else if (progress > 0.33) {
        color = 0xff69b4;  // 粉色
      } else {
        color = 0xffb6c1;  // 浅粉色
      }
      
      this.cooldownBar.fillStyle(color, 0.8);
      this.cooldownBar.fillRoundedRect(barX, barY, barWidth * progress, barHeight, 15);
    }
  }

  onCooldownComplete() {
    // 冷却完成
    this.isOnCooldown = false;
    this.cooldownRemaining = 0;

    // 更新UI
    this.drawSkillButton(false);
    this.skillButtonText.setText('技能\n就绪');
    this.instructionText.setText('按 [空格键] 释放技能');
    this.cooldownText.setText('');

    // 清空进度条
    this.cooldownBar.clear();

    // 播放就绪动画
    this.tweens.add({
      targets: this.skillButton,
      scale: 1.1,
      duration: 200,
      yoyo: true,
      repeat: 1
    });

    // 就绪提示闪烁
    this.tweens.add({
      targets: this.skillButtonText,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);