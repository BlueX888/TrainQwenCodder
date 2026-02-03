class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.isCooldown = false;
    this.cooldownTimer = null;
    this.cooldownDuration = 3000; // 3秒
    this.cooldownStartTime = 0;
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能按钮容器
    this.skillButton = this.add.container(400, 300);

    // 技能按钮底层（正常状态 - 蓝色）
    this.skillBase = this.add.graphics();
    this.skillBase.fillStyle(0x3498db, 1);
    this.skillBase.fillCircle(0, 0, 60);
    this.skillBase.lineStyle(4, 0x2980b9, 1);
    this.skillBase.strokeCircle(0, 0, 60);
    this.skillButton.add(this.skillBase);

    // 技能图标（简单的闪电形状）
    this.skillIcon = this.add.graphics();
    this.skillIcon.fillStyle(0xffffff, 1);
    this.skillIcon.fillTriangle(-15, -30, 15, 0, -5, 0);
    this.skillIcon.fillTriangle(-5, 0, 20, 30, 5, 30);
    this.skillButton.add(this.skillIcon);

    // 冷却遮罩（灰色半透明圆形）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.visible = false;
    this.skillButton.add(this.cooldownMask);

    // 冷却进度条（圆环）
    this.progressRing = this.add.graphics();
    this.progressRing.visible = false;
    this.skillButton.add(this.progressRing);

    // 冷却时间文本
    this.cooldownText = this.add.text(0, 0, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.cooldownText.setOrigin(0.5);
    this.cooldownText.visible = false;
    this.skillButton.add(this.cooldownText);

    // 提示文本
    this.hintText = this.add.text(400, 450, '点击技能按钮释放技能', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.hintText.setOrigin(0.5);

    // 状态显示
    this.statusText = this.add.text(400, 500, '技能使用次数: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.statusText.setOrigin(0.5);

    // 设置技能按钮可交互
    this.skillButton.setSize(120, 120);
    this.skillButton.setInteractive(
      new Phaser.Geom.Circle(0, 0, 60),
      Phaser.Geom.Circle.Contains
    );

    // 鼠标悬停效果
    this.skillButton.on('pointerover', () => {
      if (!this.isCooldown) {
        this.skillBase.clear();
        this.skillBase.fillStyle(0x5dade2, 1);
        this.skillBase.fillCircle(0, 0, 60);
        this.skillBase.lineStyle(4, 0x2980b9, 1);
        this.skillBase.strokeCircle(0, 0, 60);
      }
    });

    this.skillButton.on('pointerout', () => {
      if (!this.isCooldown) {
        this.skillBase.clear();
        this.skillBase.fillStyle(0x3498db, 1);
        this.skillBase.fillCircle(0, 0, 60);
        this.skillBase.lineStyle(4, 0x2980b9, 1);
        this.skillBase.strokeCircle(0, 0, 60);
      }
    });

    // 点击事件
    this.skillButton.on('pointerdown', () => {
      this.useSkill();
    });

    // 添加说明文字
    const instructionText = this.add.text(400, 100, 
      '技能冷却系统演示\n点击蓝色圆形按钮释放技能\n冷却时间: 3秒', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      align: 'center'
    });
    instructionText.setOrigin(0.5);
  }

  useSkill() {
    // 如果正在冷却中，不能使用技能
    if (this.isCooldown) {
      this.hintText.setText('技能冷却中...');
      this.hintText.setColor('#ff6b6b');
      this.time.delayedCall(500, () => {
        this.hintText.setColor('#ffffff');
      });
      return;
    }

    // 释放技能
    this.isCooldown = true;
    this.cooldownStartTime = this.time.now;
    this.skillUseCount++;

    // 更新状态显示
    this.statusText.setText(`技能使用次数: ${this.skillUseCount}`);
    this.hintText.setText('技能已释放！');
    this.hintText.setColor('#2ecc71');

    // 技能释放动画效果
    this.tweens.add({
      targets: this.skillButton,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 显示冷却效果
    this.showCooldown();

    // 设置冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.endCooldown,
      callbackScope: this,
      loop: false
    });
  }

  showCooldown() {
    // 显示灰色遮罩
    this.cooldownMask.visible = true;
    this.progressRing.visible = true;
    this.cooldownText.visible = true;

    // 改变按钮底色为灰色
    this.skillBase.clear();
    this.skillBase.fillStyle(0x7f8c8d, 1);
    this.skillBase.fillCircle(0, 0, 60);
    this.skillBase.lineStyle(4, 0x95a5a6, 1);
    this.skillBase.strokeCircle(0, 0, 60);

    // 图标变灰
    this.skillIcon.clear();
    this.skillIcon.fillStyle(0xbdc3c7, 1);
    this.skillIcon.fillTriangle(-15, -30, 15, 0, -5, 0);
    this.skillIcon.fillTriangle(-5, 0, 20, 30, 5, 30);
  }

  endCooldown() {
    this.isCooldown = false;
    this.cooldownMask.visible = false;
    this.progressRing.visible = false;
    this.cooldownText.visible = false;

    // 恢复按钮颜色
    this.skillBase.clear();
    this.skillBase.fillStyle(0x3498db, 1);
    this.skillBase.fillCircle(0, 0, 60);
    this.skillBase.lineStyle(4, 0x2980b9, 1);
    this.skillBase.strokeCircle(0, 0, 60);

    // 恢复图标颜色
    this.skillIcon.clear();
    this.skillIcon.fillStyle(0xffffff, 1);
    this.skillIcon.fillTriangle(-15, -30, 15, 0, -5, 0);
    this.skillIcon.fillTriangle(-5, 0, 20, 30, 5, 30);

    // 更新提示文本
    this.hintText.setText('技能已就绪！');
    this.hintText.setColor('#2ecc71');

    this.time.delayedCall(1000, () => {
      this.hintText.setText('点击技能按钮释放技能');
      this.hintText.setColor('#ffffff');
    });
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.isCooldown) {
      const elapsed = time - this.cooldownStartTime;
      const progress = Math.min(elapsed / this.cooldownDuration, 1);
      const remaining = Math.max(0, this.cooldownDuration - elapsed);

      // 更新冷却时间文本
      const remainingSeconds = (remaining / 1000).toFixed(1);
      this.cooldownText.setText(remainingSeconds);

      // 绘制灰色遮罩（扇形，从上方开始顺时针减少）
      this.cooldownMask.clear();
      this.cooldownMask.fillStyle(0x000000, 0.6);
      
      const startAngle = -90; // 从顶部开始
      const sweepAngle = 360 * (1 - progress); // 剩余角度
      
      if (sweepAngle > 0) {
        this.cooldownMask.slice(
          0, 0, 60,
          Phaser.Math.DegToRad(startAngle),
          Phaser.Math.DegToRad(startAngle + sweepAngle),
          false
        );
        this.cooldownMask.fillPath();
      }

      // 绘制进度环
      this.progressRing.clear();
      this.progressRing.lineStyle(5, 0xe74c3c, 1);
      this.progressRing.beginPath();
      this.progressRing.arc(
        0, 0, 65,
        Phaser.Math.DegToRad(startAngle),
        Phaser.Math.DegToRad(startAngle + sweepAngle),
        false
      );
      this.progressRing.strokePath();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene
};

new Phaser.Game(config);