class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 可验证的状态信号
    this.skillUsageCount = 0;  // 技能使用次数
    this.isCooldown = false;   // 是否在冷却中
    this.cooldownProgress = 0; // 冷却进度 0-1
    this.cooldownRemaining = 0; // 剩余冷却时间（秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const iconRadius = 50;
    const cooldownDuration = 1500; // 1.5秒

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题文本
    this.add.text(400, 50, '紫色技能冷却系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文本
    this.add.text(400, 100, '按 [空格键] 释放技能', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 技能图标底层（紫色圆形）
    this.skillIcon = this.add.graphics();
    this.skillIcon.fillStyle(0x9b59b6, 1);
    this.skillIcon.fillCircle(centerX, centerY, iconRadius);
    this.skillIcon.lineStyle(4, 0xffffff, 1);
    this.skillIcon.strokeCircle(centerX, centerY, iconRadius);

    // 技能图标内的符号（闪电形状）
    const lightning = this.add.graphics();
    lightning.lineStyle(6, 0xffffff, 1);
    lightning.beginPath();
    lightning.moveTo(centerX + 5, centerY - 25);
    lightning.lineTo(centerX - 5, centerY);
    lightning.lineTo(centerX + 10, centerY);
    lightning.lineTo(centerX - 5, centerY + 25);
    lightning.strokePath();

    // 冷却遮罩层（扇形）
    this.cooldownMask = this.add.graphics();
    
    // 冷却时间文本
    this.cooldownText = this.add.text(centerX, centerY, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(400, 450, '技能就绪', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 使用次数统计
    this.usageText = this.add.text(400, 500, '使用次数: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 冷却进度条
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRect(250, 380, 300, 20);

    this.progressBar = this.add.graphics();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 冷却计时器引用
    this.cooldownTimer = null;

    // 存储技能中心坐标和半径供 update 使用
    this.skillCenterX = centerX;
    this.skillCenterY = centerY;
    this.skillRadius = iconRadius;
    this.cooldownDuration = cooldownDuration;
  }

  update(time, delta) {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.tryUseSkill();
    }

    // 更新冷却显示
    if (this.isCooldown && this.cooldownTimer) {
      // 计算冷却进度
      const elapsed = this.cooldownTimer.getElapsed();
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);
      this.cooldownRemaining = Math.max((this.cooldownDuration - elapsed) / 1000, 0);

      // 绘制扇形遮罩（从上方开始，顺时针）
      this.cooldownMask.clear();
      this.cooldownMask.fillStyle(0x000000, 0.6);
      
      const startAngle = -Math.PI / 2; // 从顶部开始
      const endAngle = startAngle + (1 - this.cooldownProgress) * Math.PI * 2;
      
      this.cooldownMask.slice(
        this.skillCenterX,
        this.skillCenterY,
        this.skillRadius,
        startAngle,
        endAngle,
        false
      );
      this.cooldownMask.fillPath();

      // 更新冷却时间文本
      this.cooldownText.setText(this.cooldownRemaining.toFixed(1) + 's');

      // 更新进度条
      this.progressBar.clear();
      this.progressBar.fillStyle(0x9b59b6, 1);
      this.progressBar.fillRect(250, 380, 300 * this.cooldownProgress, 20);
    }
  }

  tryUseSkill() {
    if (this.isCooldown) {
      // 冷却中，无法使用
      this.statusText.setText('冷却中...');
      this.statusText.setColor('#ff0000');
      
      // 技能图标抖动效果
      this.tweens.add({
        targets: this.skillIcon,
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 3
      });
      
      return;
    }

    // 释放技能
    this.skillUsageCount++;
    this.isCooldown = true;
    this.cooldownProgress = 0;
    this.cooldownRemaining = this.cooldownDuration / 1000;

    // 更新状态文本
    this.statusText.setText('技能释放！');
    this.statusText.setColor('#ffff00');
    this.usageText.setText('使用次数: ' + this.skillUsageCount);

    // 技能释放特效（紫色波纹）
    const ripple = this.add.graphics();
    ripple.lineStyle(4, 0x9b59b6, 1);
    
    this.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onUpdate: () => {
        ripple.clear();
        ripple.lineStyle(4, 0x9b59b6, ripple.alpha);
        ripple.strokeCircle(this.skillCenterX, this.skillCenterY, this.skillRadius * ripple.scaleX);
      },
      onComplete: () => {
        ripple.destroy();
      }
    });

    // 启动冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.onCooldownComplete,
      callbackScope: this
    });

    // 输出状态日志
    console.log(`[Skill] Usage #${this.skillUsageCount} - Cooldown started`);
  }

  onCooldownComplete() {
    // 冷却完成
    this.isCooldown = false;
    this.cooldownProgress = 1;
    this.cooldownRemaining = 0;

    // 清除遮罩和文本
    this.cooldownMask.clear();
    this.cooldownText.setText('');

    // 更新状态文本
    this.statusText.setText('技能就绪');
    this.statusText.setColor('#00ff00');

    // 清空进度条
    this.progressBar.clear();

    // 就绪闪烁效果
    this.tweens.add({
      targets: this.skillIcon,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 2
    });

    console.log('[Skill] Cooldown complete - Ready to use');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillCooldownScene
};

new Phaser.Game(config);