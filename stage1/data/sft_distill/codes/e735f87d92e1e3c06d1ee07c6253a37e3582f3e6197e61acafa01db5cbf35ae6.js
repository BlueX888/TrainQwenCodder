class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = false; // 技能是否在冷却中
    this.cooldownTimer = null; // 冷却计时器
    this.cooldownDuration = 1500; // 冷却时间（毫秒）
    this.cooldownElapsed = 0; // 已经过的冷却时间
    this.skillUseCount = 0; // 技能使用次数（可验证状态）
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建标题文本
    this.add.text(width / 2, 50, '紫色技能冷却系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(width / 2, 100, '按 [空格键] 释放技能', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建技能使用次数显示
    this.skillCountText = this.add.text(width / 2, 140, '技能使用次数: 0', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建技能按钮背景
    this.skillButton = this.add.graphics();
    this.skillButtonX = width / 2;
    this.skillButtonY = height / 2;
    this.skillButtonRadius = 60;
    this.drawSkillButton();

    // 创建技能按钮文本
    this.skillButtonText = this.add.text(this.skillButtonX, this.skillButtonY, '空格键\n释放技能', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRoundedRect(width / 2 - 150, height / 2 + 120, 300, 30, 15);

    // 创建冷却进度条
    this.cooldownBar = this.add.graphics();

    // 创建冷却文本
    this.cooldownText = this.add.text(width / 2, height / 2 + 135, '就绪', {
      fontSize: '16px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建技能效果容器（用于显示释放效果）
    this.skillEffects = this.add.graphics();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.activateSkill();
    });

    // 创建状态显示
    this.statusText = this.add.text(20, height - 40, '状态: 就绪', {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    if (this.skillCooldown) {
      // 冷却中 - 灰色
      this.skillButton.fillStyle(0x666666, 0.8);
      this.skillButton.lineStyle(4, 0x444444, 1);
    } else {
      // 就绪 - 紫色
      this.skillButton.fillStyle(0x8b00ff, 0.9);
      this.skillButton.lineStyle(4, 0xaa00ff, 1);
      
      // 添加发光效果
      this.skillButton.fillStyle(0xaa00ff, 0.3);
      this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius + 10);
    }
    
    this.skillButton.fillStyle(this.skillCooldown ? 0x666666 : 0x8b00ff, 0.9);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
  }

  activateSkill() {
    // 如果技能在冷却中，不能使用
    if (this.skillCooldown) {
      this.showCooldownWarning();
      return;
    }

    // 技能使用次数增加
    this.skillUseCount++;
    this.skillCountText.setText(`技能使用次数: ${this.skillUseCount}`);

    // 播放技能释放效果
    this.playSkillEffect();

    // 开始冷却
    this.startCooldown();

    // 更新状态
    this.statusText.setText('状态: 技能释放！');
  }

  playSkillEffect() {
    // 清除之前的效果
    this.skillEffects.clear();

    // 创建紫色扩散光环效果
    let radius = this.skillButtonRadius;
    const maxRadius = 150;
    const duration = 500;

    this.tweens.add({
      targets: { radius: radius },
      radius: maxRadius,
      duration: duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        const progress = tween.progress;
        const currentRadius = Phaser.Math.Linear(radius, maxRadius, progress);
        const alpha = 1 - progress;

        this.skillEffects.clear();
        this.skillEffects.lineStyle(8, 0x8b00ff, alpha);
        this.skillEffects.strokeCircle(this.skillButtonX, this.skillButtonY, currentRadius);
        
        this.skillEffects.lineStyle(4, 0xaa00ff, alpha * 0.7);
        this.skillEffects.strokeCircle(this.skillButtonX, this.skillButtonY, currentRadius - 10);
      },
      onComplete: () => {
        this.skillEffects.clear();
      }
    });

    // 按钮闪烁效果
    this.tweens.add({
      targets: this.skillButtonText,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  startCooldown() {
    this.skillCooldown = true;
    this.cooldownElapsed = 0;

    // 更新按钮外观
    this.drawSkillButton();
    this.skillButtonText.setColor('#888888');

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });

    // 更新状态
    this.statusText.setText('状态: 冷却中...');
  }

  onCooldownComplete() {
    this.skillCooldown = false;
    this.cooldownElapsed = 0;

    // 恢复按钮外观
    this.drawSkillButton();
    this.skillButtonText.setColor('#ffffff');

    // 更新冷却文本
    this.cooldownText.setText('就绪');
    this.cooldownText.setColor('#00ff00');

    // 清空进度条
    this.cooldownBar.clear();

    // 更新状态
    this.statusText.setText('状态: 就绪');

    // 播放就绪提示动画
    this.tweens.add({
      targets: this.skillButton,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 1
    });
  }

  showCooldownWarning() {
    // 显示冷却中的警告效果
    this.tweens.add({
      targets: this.cooldownText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });

    // 按钮震动效果
    const originalX = this.skillButtonX;
    this.tweens.add({
      targets: this.skillButton,
      x: originalX - 5,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.skillButton.x = 0;
      }
    });
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.skillCooldown && this.cooldownTimer) {
      this.cooldownElapsed += delta;
      const progress = Math.min(this.cooldownElapsed / this.cooldownDuration, 1);
      const remainingProgress = 1 - progress;

      // 绘制冷却进度条
      this.cooldownBar.clear();
      this.cooldownBar.fillStyle(0x8b00ff, 0.8);
      this.cooldownBar.fillRoundedRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 120,
        300 * remainingProgress,
        30,
        15
      );

      // 更新冷却文本
      const remainingTime = ((this.cooldownDuration - this.cooldownElapsed) / 1000).toFixed(1);
      this.cooldownText.setText(`冷却中: ${remainingTime}s`);
      this.cooldownText.setColor('#ff6600');
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

new Phaser.Game(config);