class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0; // 0-1 表示冷却进度
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能图标容器
    this.skillIcon = this.add.container(400, 300);

    // 绘制技能图标底座（蓝色圆形）
    const iconBase = this.add.graphics();
    iconBase.fillStyle(0x3498db, 1);
    iconBase.fillCircle(0, 0, 60);
    iconBase.lineStyle(4, 0x2980b9, 1);
    iconBase.strokeCircle(0, 0, 60);
    this.skillIcon.add(iconBase);

    // 绘制技能图标内容（闪电符号）
    const iconSymbol = this.add.graphics();
    iconSymbol.fillStyle(0xf1c40f, 1);
    iconSymbol.fillTriangle(-15, -30, 10, 0, -5, 0);
    iconSymbol.fillTriangle(5, 0, -10, 30, 15, 0);
    this.skillIcon.add(iconSymbol);

    // 创建灰色遮罩层（初始不可见）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setAlpha(0);
    this.skillIcon.add(this.cooldownMask);

    // 创建冷却进度弧形（初始不可见）
    this.progressArc = this.add.graphics();
    this.progressArc.setAlpha(0);
    this.skillIcon.add(this.progressArc);

    // 创建冷却文本
    this.cooldownText = this.add.text(0, 0, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.cooldownText.setOrigin(0.5);
    this.cooldownText.setAlpha(0);
    this.skillIcon.add(this.cooldownText);

    // 添加提示文本
    this.instructionText = this.add.text(400, 450, '右键点击释放技能', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });
    this.instructionText.setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 100, '技能状态: 就绪', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#2ecc71',
      fontStyle: 'bold'
    });
    this.statusText.setOrigin(0.5);

    // 添加使用次数显示
    this.countText = this.add.text(400, 140, '使用次数: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    this.countText.setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.useSkill();
      }
    });

    // 添加技能图标悬停效果
    this.input.on('pointermove', (pointer) => {
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y, 400, 300
      );
      
      if (distance <= 60 && !this.skillOnCooldown) {
        iconBase.clear();
        iconBase.fillStyle(0x5dade2, 1);
        iconBase.fillCircle(0, 0, 60);
        iconBase.lineStyle(4, 0x2980b9, 1);
        iconBase.strokeCircle(0, 0, 60);
      } else if (!this.skillOnCooldown) {
        iconBase.clear();
        iconBase.fillStyle(0x3498db, 1);
        iconBase.fillCircle(0, 0, 60);
        iconBase.lineStyle(4, 0x2980b9, 1);
        iconBase.strokeCircle(0, 0, 60);
      }
    });

    // 定时器引用
    this.cooldownTimer = null;
  }

  useSkill() {
    // 如果技能正在冷却，则无法使用
    if (this.skillOnCooldown) {
      // 添加抖动效果提示
      this.tweens.add({
        targets: this.skillIcon,
        x: 395,
        duration: 50,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.skillIcon.x = 400;
        }
      });
      return;
    }

    // 释放技能
    this.skillOnCooldown = true;
    this.skillUseCount++;
    this.cooldownProgress = 0;

    // 更新状态文本
    this.statusText.setText('技能状态: 冷却中');
    this.statusText.setColor('#e74c3c');
    this.countText.setText(`使用次数: ${this.skillUseCount}`);

    // 显示技能释放效果
    this.showSkillEffect();

    // 显示灰色遮罩和冷却文本
    this.cooldownMask.setAlpha(0.7);
    this.progressArc.setAlpha(1);
    this.cooldownText.setAlpha(1);

    // 开始冷却计时
    const cooldownDuration = 1500; // 1.5秒
    const startTime = this.time.now;

    this.cooldownTimer = this.time.addEvent({
      delay: 16, // 每帧更新（约60fps）
      callback: () => {
        const elapsed = this.time.now - startTime;
        this.cooldownProgress = Math.min(elapsed / cooldownDuration, 1);
        
        // 更新冷却文本
        const remaining = Math.ceil((cooldownDuration - elapsed) / 1000 * 10) / 10;
        if (remaining > 0) {
          this.cooldownText.setText(remaining.toFixed(1));
        }

        // 更新灰色遮罩和进度弧
        this.updateCooldownVisuals();

        // 冷却完成
        if (this.cooldownProgress >= 1) {
          this.cooldownTimer.destroy();
          this.cooldownTimer = null;
          this.skillOnCooldown = false;
          this.cooldownMask.setAlpha(0);
          this.progressArc.setAlpha(0);
          this.cooldownText.setAlpha(0);
          this.statusText.setText('技能状态: 就绪');
          this.statusText.setColor('#2ecc71');

          // 添加就绪闪烁效果
          this.tweens.add({
            targets: this.skillIcon,
            scale: 1.1,
            duration: 200,
            yoyo: true
          });
        }
      },
      loop: true
    });
  }

  updateCooldownVisuals() {
    // 清除并重绘灰色遮罩（扇形，从上方开始顺时针减少）
    this.cooldownMask.clear();
    
    const remainingAngle = (1 - this.cooldownProgress) * 360;
    if (remainingAngle > 0) {
      this.cooldownMask.fillStyle(0x000000, 0.7);
      this.cooldownMask.slice(
        0, 0, 60,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + remainingAngle),
        false
      );
      this.cooldownMask.fillPath();
    }

    // 绘制进度弧形边框
    this.progressArc.clear();
    this.progressArc.lineStyle(4, 0xf39c12, 1);
    this.progressArc.beginPath();
    this.progressArc.arc(
      0, 0, 64,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + this.cooldownProgress * 360),
      false
    );
    this.progressArc.strokePath();
  }

  showSkillEffect() {
    // 创建技能释放特效（扩散圆环）
    const effectGraphics = this.add.graphics();
    effectGraphics.lineStyle(6, 0xf1c40f, 1);
    effectGraphics.strokeCircle(400, 300, 60);

    this.tweens.add({
      targets: effectGraphics,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onUpdate: (tween) => {
        const progress = tween.progress;
        const radius = 60 + progress * 100;
        effectGraphics.clear();
        effectGraphics.lineStyle(6 * (1 - progress), 0xf1c40f, 1);
        effectGraphics.strokeCircle(400, 300, radius);
      },
      onComplete: () => {
        effectGraphics.destroy();
      }
    });

    // 添加粒子效果
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.add.graphics();
      particle.fillStyle(0xf1c40f, 1);
      particle.fillCircle(0, 0, 4);
      particle.setPosition(400, 300);

      this.tweens.add({
        targets: particle,
        x: 400 + Math.cos(angle) * 120,
        y: 300 + Math.sin(angle) * 120,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  update(time, delta) {
    // 主循环更新（如需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

new Phaser.Game(config);