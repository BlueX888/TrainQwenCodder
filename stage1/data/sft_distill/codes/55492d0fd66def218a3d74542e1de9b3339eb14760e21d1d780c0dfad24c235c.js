class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0;
    this.cooldownDuration = 3000; // 3秒
    this.skillUseCount = 0; // 可验证状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    this.add.text(400, 50, '青色技能冷却系统', {
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文字
    this.add.text(400, 100, '点击鼠标左键释放技能（冷却时间3秒）', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建技能按钮（青色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = 400;
    this.skillButtonY = 300;
    this.skillButtonRadius = 60;
    this.drawSkillButton();

    // 冷却遮罩（灰色半透明圆形）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setVisible(false);

    // 冷却进度条背景
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRoundedRect(250, 400, 300, 30, 15);

    // 冷却进度条
    this.progressBar = this.add.graphics();

    // 冷却文本
    this.cooldownText = this.add.text(400, 450, '', {
      fontSize: '20px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 状态显示
    this.statusText = this.add.text(400, 500, '状态: 就绪', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 使用次数显示
    this.useCountText = this.add.text(400, 540, '技能使用次数: 0', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 技能效果粒子容器
    this.skillEffects = this.add.container();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryUseSkill(pointer);
      }
    });

    // 冷却计时器引用
    this.cooldownTimer = null;
    this.cooldownStartTime = 0;
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    // 外圈光晕
    this.skillButton.fillStyle(0x00ffff, 0.3);
    this.skillButton.fillCircle(
      this.skillButtonX, 
      this.skillButtonY, 
      this.skillButtonRadius + 10
    );

    // 主体圆形
    this.skillButton.fillStyle(0x00ffff, 1);
    this.skillButton.fillCircle(
      this.skillButtonX, 
      this.skillButtonY, 
      this.skillButtonRadius
    );

    // 内圈装饰
    this.skillButton.fillStyle(0x00cccc, 1);
    this.skillButton.fillCircle(
      this.skillButtonX, 
      this.skillButtonY, 
      this.skillButtonRadius - 15
    );

    // 技能图标（简单的闪电形状）
    this.skillButton.fillStyle(0xffffff, 1);
    this.skillButton.fillTriangle(
      this.skillButtonX - 10, this.skillButtonY - 20,
      this.skillButtonX + 15, this.skillButtonY,
      this.skillButtonX - 10, this.skillButtonY + 20
    );
  }

  tryUseSkill(pointer) {
    // 检查是否在冷却中
    if (this.skillOnCooldown) {
      this.showCooldownWarning();
      return;
    }

    // 检查是否点击在技能按钮上
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.skillButtonX, this.skillButtonY
    );

    if (distance <= this.skillButtonRadius) {
      this.useSkill();
    }
  }

  useSkill() {
    // 增加使用次数
    this.skillUseCount++;
    this.useCountText.setText(`技能使用次数: ${this.skillUseCount}`);

    // 播放技能效果
    this.playSkillEffect();

    // 开始冷却
    this.startCooldown();

    // 更新状态
    this.statusText.setText('状态: 冷却中...');
    this.statusText.setColor('#ff0000');
  }

  playSkillEffect() {
    // 创建技能释放的视觉效果
    const effectDuration = 500;
    
    // 创建扩散圆环
    for (let i = 0; i < 3; i++) {
      const ring = this.add.graphics();
      ring.lineStyle(4, 0x00ffff, 1);
      ring.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
      
      this.skillEffects.add(ring);

      this.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 2 + i * 0.5,
        duration: effectDuration,
        delay: i * 100,
        onComplete: () => {
          ring.destroy();
        }
      });
    }

    // 创建爆发粒子
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const particle = this.add.graphics();
      particle.fillStyle(0x00ffff, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(this.skillButtonX, this.skillButtonY);

      this.tweens.add({
        targets: particle,
        x: this.skillButtonX + Math.cos(angle) * 100,
        y: this.skillButtonY + Math.sin(angle) * 100,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  startCooldown() {
    this.skillOnCooldown = true;
    this.cooldownProgress = 0;
    this.cooldownStartTime = this.time.now;

    // 显示冷却遮罩
    this.cooldownMask.setVisible(true);

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
    this.cooldownProgress = 0;
    this.cooldownMask.setVisible(false);
    this.cooldownText.setText('');
    this.statusText.setText('状态: 就绪');
    this.statusText.setColor('#00ff00');

    // 清空进度条
    this.progressBar.clear();
  }

  showCooldownWarning() {
    // 抖动效果
    this.tweens.add({
      targets: this.skillButton,
      x: this.skillButtonX + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.skillButton.x = 0;
      }
    });
  }

  update(time, delta) {
    if (this.skillOnCooldown) {
      // 计算冷却进度
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);

      // 更新冷却遮罩（扇形遮罩效果）
      this.updateCooldownMask();

      // 更新进度条
      this.updateProgressBar();

      // 更新冷却文本
      const remainingTime = Math.ceil((this.cooldownDuration - elapsed) / 1000);
      this.cooldownText.setText(`冷却剩余: ${remainingTime}秒`);
    }
  }

  updateCooldownMask() {
    this.cooldownMask.clear();
    
    // 绘制灰色半透明扇形遮罩
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (Math.PI * 2 * (1 - this.cooldownProgress));

    this.cooldownMask.fillStyle(0x000000, 0.6);
    this.cooldownMask.slice(
      this.skillButtonX,
      this.skillButtonY,
      this.skillButtonRadius,
      startAngle,
      endAngle,
      false
    );
    this.cooldownMask.fillPath();

    // 绘制边框
    this.cooldownMask.lineStyle(3, 0xff0000, 1);
    this.cooldownMask.strokeCircle(
      this.skillButtonX,
      this.skillButtonY,
      this.skillButtonRadius
    );
  }

  updateProgressBar() {
    this.progressBar.clear();
    
    // 绘制进度条
    const barWidth = 300 * this.cooldownProgress;
    const gradient = this.cooldownProgress;
    
    // 使用渐变色效果（从红到青）
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 255 },
      100,
      gradient * 100
    );
    
    const hexColor = Phaser.Display.Color.GetColor(
      Math.floor(color.r),
      Math.floor(color.g),
      Math.floor(color.b)
    );

    this.progressBar.fillStyle(hexColor, 1);
    this.progressBar.fillRoundedRect(250, 400, barWidth, 30, 15);
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