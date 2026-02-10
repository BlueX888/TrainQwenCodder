class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillReady = true;
    this.cooldownDuration = 1500; // 1.5秒
    this.cooldownProgress = 0; // 0-1之间，用于验证
    this.skillUsedCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 创建标题文本
    this.add.text(centerX, 50, 'Skill Cooldown Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(centerX, 100, 'Press SPACE to use skill', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能图标容器
    const skillIconY = centerY - 50;

    // 技能图标背景（深蓝色圆形）
    this.skillIconBg = this.add.graphics();
    this.skillIconBg.fillStyle(0x1a3a5a, 1);
    this.skillIconBg.fillCircle(centerX, skillIconY, 60);

    // 技能图标（亮蓝色圆形）
    this.skillIcon = this.add.graphics();
    this.updateSkillIcon(centerX, skillIconY, true);

    // 冷却遮罩（灰色半透明圆形，初始不可见）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setVisible(false);

    // 冷却进度条背景
    const progressBarY = centerY + 80;
    const progressBarWidth = 300;
    const progressBarHeight = 30;
    
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRoundedRect(
      centerX - progressBarWidth / 2,
      progressBarY,
      progressBarWidth,
      progressBarHeight,
      5
    );

    // 冷却进度条（蓝色填充）
    this.progressBar = this.add.graphics();

    // 进度条边框
    const border = this.add.graphics();
    border.lineStyle(2, 0x666666, 1);
    border.strokeRoundedRect(
      centerX - progressBarWidth / 2,
      progressBarY,
      progressBarWidth,
      progressBarHeight,
      5
    );

    // 状态文本
    this.statusText = this.add.text(centerX, progressBarY - 30, 'Ready', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 冷却时间显示文本
    this.cooldownText = this.add.text(centerX, progressBarY + 15, '', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 使用次数显示
    this.usageText = this.add.text(centerX, this.cameras.main.height - 50, 
      `Skills Used: ${this.skillUsedCount}`, {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 存储进度条位置信息
    this.progressBarX = centerX - progressBarWidth / 2;
    this.progressBarY = progressBarY;
    this.progressBarWidth = progressBarWidth;
    this.progressBarHeight = progressBarHeight;
    this.skillIconX = centerX;
    this.skillIconY = skillIconY;
  }

  update(time, delta) {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.tryUseSkill();
    }
  }

  tryUseSkill() {
    if (!this.skillReady) {
      // 技能冷却中，显示反馈
      this.cameras.main.shake(100, 0.002);
      return;
    }

    // 使用技能
    this.useSkill();
  }

  useSkill() {
    this.skillReady = false;
    this.skillUsedCount++;
    
    // 更新使用次数显示
    this.usageText.setText(`Skills Used: ${this.skillUsedCount}`);

    // 更新技能图标为暗淡状态
    this.updateSkillIcon(this.skillIconX, this.skillIconY, false);

    // 显示冷却遮罩
    this.cooldownMask.setVisible(true);

    // 更新状态文本
    this.statusText.setText('Cooling Down');
    this.statusText.setColor('#ff0000');

    // 技能释放特效（蓝色波纹扩散）
    this.createSkillEffect();

    // 启动冷却计时器
    this.startCooldown();
  }

  createSkillEffect() {
    const effect = this.add.graphics();
    const centerX = this.skillIconX;
    const centerY = this.skillIconY;

    // 创建扩散动画
    this.tweens.add({
      targets: { radius: 0, alpha: 1 },
      radius: 100,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = tween.getValue();
        effect.clear();
        effect.lineStyle(4, 0x00aaff, value.alpha);
        effect.strokeCircle(centerX, centerY, value.radius);
      },
      onComplete: () => {
        effect.destroy();
      }
    });

    // 技能图标闪烁效果
    this.tweens.add({
      targets: this.skillIcon,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  startCooldown() {
    const startTime = this.time.now;
    
    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });

    // 更新进度的循环
    this.cooldownUpdateEvent = this.time.addEvent({
      delay: 16, // 约60fps
      callback: () => {
        const elapsed = this.time.now - startTime;
        const progress = Math.min(elapsed / this.cooldownDuration, 1);
        this.cooldownProgress = progress;
        this.updateCooldownDisplay(progress);
      },
      callbackScope: this,
      loop: true
    });
  }

  updateCooldownDisplay(progress) {
    // 更新进度条
    this.progressBar.clear();
    this.progressBar.fillStyle(0x0088ff, 1);
    const fillWidth = this.progressBarWidth * progress;
    this.progressBar.fillRoundedRect(
      this.progressBarX,
      this.progressBarY,
      fillWidth,
      this.progressBarHeight,
      5
    );

    // 更新冷却遮罩（使用扇形表示剩余冷却）
    const remainingProgress = 1 - progress;
    this.cooldownMask.clear();
    this.cooldownMask.fillStyle(0x000000, 0.6);
    
    if (remainingProgress > 0) {
      this.cooldownMask.slice(
        this.skillIconX,
        this.skillIconY,
        60,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + 360 * remainingProgress),
        false
      );
      this.cooldownMask.fillPath();
    }

    // 更新冷却时间文本
    const remainingTime = ((1 - progress) * this.cooldownDuration / 1000).toFixed(1);
    this.cooldownText.setText(`${remainingTime}s`);
  }

  onCooldownComplete() {
    this.skillReady = true;
    this.cooldownProgress = 1;

    // 停止更新循环
    if (this.cooldownUpdateEvent) {
      this.cooldownUpdateEvent.remove();
    }

    // 更新最终进度条（满）
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRoundedRect(
      this.progressBarX,
      this.progressBarY,
      this.progressBarWidth,
      this.progressBarHeight,
      5
    );

    // 隐藏冷却遮罩
    this.cooldownMask.setVisible(false);
    this.cooldownMask.clear();

    // 更新状态文本
    this.statusText.setText('Ready');
    this.statusText.setColor('#00ff00');
    this.cooldownText.setText('');

    // 恢复技能图标亮度
    this.updateSkillIcon(this.skillIconX, this.skillIconY, true);

    // 技能就绪提示动画
    this.tweens.add({
      targets: this.skillIcon,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // 清空进度条（延迟500ms）
    this.time.delayedCall(500, () => {
      this.progressBar.clear();
    });
  }

  updateSkillIcon(x, y, isReady) {
    this.skillIcon.clear();
    if (isReady) {
      this.skillIcon.fillStyle(0x00aaff, 1);
    } else {
      this.skillIcon.fillStyle(0x004466, 1);
    }
    this.skillIcon.fillCircle(x, y, 50);
    
    // 添加内部装饰
    this.skillIcon.fillStyle(0xffffff, isReady ? 0.8 : 0.3);
    this.skillIcon.fillCircle(x, y, 20);
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