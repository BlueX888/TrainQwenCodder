class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownDuration = 1500; // 1.5秒
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

    // 标题
    this.add.text(400, 50, 'Skill Cooldown System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文字
    this.add.text(400, 100, 'Right Click to use skill (1.5s cooldown)', {
      fontSize: '18px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // 技能使用次数显示
    this.useCountText = this.add.text(400, 150, `Skills Used: ${this.skillUseCount}`, {
      fontSize: '20px',
      color: '#3498db',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建技能按钮容器
    this.createSkillButton();

    // 创建冷却遮罩层（初始隐藏）
    this.createCooldownOverlay();

    // 创建进度条
    this.createProgressBar();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.useSkill();
      }
    });

    // 状态文本
    this.statusText = this.add.text(400, 500, 'Ready', {
      fontSize: '24px',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  createSkillButton() {
    // 技能按钮背景
    this.skillButton = this.add.graphics();
    this.skillButton.fillStyle(0x3498db, 1);
    this.skillButton.fillCircle(400, 300, 80);
    
    // 按钮边框
    this.skillButton.lineStyle(4, 0x2980b9, 1);
    this.skillButton.strokeCircle(400, 300, 80);

    // 技能图标（简单的闪电符号）
    const icon = this.add.graphics();
    icon.lineStyle(6, 0xf1c40f, 1);
    icon.beginPath();
    icon.moveTo(400, 260);
    icon.lineTo(380, 300);
    icon.lineTo(395, 300);
    icon.lineTo(380, 340);
    icon.lineTo(420, 290);
    icon.lineTo(405, 290);
    icon.closePath();
    icon.strokePath();
    icon.fillStyle(0xf39c12, 1);
    icon.fillPath();

    // 技能文字
    this.add.text(400, 390, 'Ultimate Skill', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createCooldownOverlay() {
    // 灰色遮罩
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.fillStyle(0x000000, 0.7);
    this.cooldownMask.fillCircle(400, 300, 80);
    this.cooldownMask.setVisible(false);

    // 冷却时间文字
    this.cooldownText = this.add.text(400, 300, '', {
      fontSize: '28px',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.cooldownText.setVisible(false);
  }

  createProgressBar() {
    // 进度条背景
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x34495e, 1);
    this.progressBg.fillRoundedRect(250, 430, 300, 30, 15);
    this.progressBg.setVisible(false);

    // 进度条填充
    this.progressBar = this.add.graphics();
    this.progressBar.setVisible(false);

    // 进度条文字
    this.progressText = this.add.text(400, 445, '', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.progressText.setVisible(false);
  }

  useSkill() {
    // 如果正在冷却，不能使用
    if (this.skillOnCooldown) {
      // 震动效果提示
      this.cameras.main.shake(100, 0.005);
      return;
    }

    // 使用技能
    this.skillOnCooldown = true;
    this.skillUseCount++;
    this.useCountText.setText(`Skills Used: ${this.skillUseCount}`);

    // 技能释放特效
    this.createSkillEffect();

    // 更新状态
    this.statusText.setText('On Cooldown!');
    this.statusText.setColor('#e74c3c');

    // 显示冷却UI
    this.cooldownMask.setVisible(true);
    this.cooldownText.setVisible(true);
    this.progressBg.setVisible(true);
    this.progressBar.setVisible(true);
    this.progressText.setVisible(true);

    // 创建冷却计时器
    const startTime = this.time.now;
    
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.onCooldownComplete();
      },
      callbackScope: this
    });

    // 更新进度条（在update中处理）
    this.cooldownStartTime = startTime;
  }

  createSkillEffect() {
    // 技能释放的视觉效果
    const effect = this.add.graphics();
    effect.lineStyle(4, 0xf1c40f, 1);
    
    // 创建扩散圆环
    let radius = 80;
    const effectTween = this.tweens.add({
      targets: { r: radius },
      r: 150,
      duration: 500,
      ease: 'Power2',
      onUpdate: (tween) => {
        effect.clear();
        const alpha = 1 - tween.progress;
        effect.lineStyle(4, 0xf1c40f, alpha);
        effect.strokeCircle(400, 300, tween.targets[0].r);
      },
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.skillOnCooldown && this.cooldownStartTime) {
      const elapsed = time - this.cooldownStartTime;
      const remaining = Math.max(0, this.cooldownDuration - elapsed);
      const progress = 1 - (remaining / this.cooldownDuration);

      // 更新进度条
      this.progressBar.clear();
      this.progressBar.fillStyle(0x3498db, 1);
      const barWidth = 300 * progress;
      this.progressBar.fillRoundedRect(250, 430, barWidth, 30, 15);

      // 更新冷却时间文字
      const remainingSeconds = (remaining / 1000).toFixed(1);
      this.cooldownText.setText(remainingSeconds + 's');

      // 更新进度百分比
      this.progressText.setText(`${Math.floor(progress * 100)}%`);
    }
  }

  onCooldownComplete() {
    // 冷却完成
    this.skillOnCooldown = false;
    
    // 隐藏冷却UI
    this.cooldownMask.setVisible(false);
    this.cooldownText.setVisible(false);
    this.progressBg.setVisible(false);
    this.progressBar.setVisible(false);
    this.progressText.setVisible(false);

    // 更新状态
    this.statusText.setText('Ready');
    this.statusText.setColor('#2ecc71');

    // 恢复动画
    this.tweens.add({
      targets: this.skillButton,
      alpha: { from: 0.5, to: 1 },
      duration: 300,
      ease: 'Power2'
    });

    // 清理计时器引用
    this.cooldownStartTime = null;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 启动游戏
new Phaser.Game(config);