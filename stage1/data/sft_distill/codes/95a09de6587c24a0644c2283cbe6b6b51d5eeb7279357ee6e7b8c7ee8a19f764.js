class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillReady = true;
    this.cooldownTime = 3000; // 3秒冷却
    this.cooldownTimer = null;
    this.cooldownProgress = 0; // 0-1 表示冷却进度
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 标题文本
    this.add.text(400, 50, '青色技能冷却系统', {
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文本
    this.add.text(400, 100, '点击鼠标左键释放技能（冷却时间：3秒）', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建技能图标容器（中心位置）
    const skillX = 400;
    const skillY = 300;
    const skillRadius = 60;

    // 技能图标背景（深灰色圆形）
    this.skillBg = this.add.graphics();
    this.skillBg.fillStyle(0x2a2a3e, 1);
    this.skillBg.fillCircle(skillX, skillY, skillRadius);

    // 技能图标主体（青色圆形）
    this.skillIcon = this.add.graphics();
    this.skillIcon.fillStyle(0x00ffff, 1);
    this.skillIcon.fillCircle(skillX, skillY, skillRadius - 5);

    // 技能边框（青色描边）
    this.skillBorder = this.add.graphics();
    this.skillBorder.lineStyle(3, 0x00ffff, 1);
    this.skillBorder.strokeCircle(skillX, skillY, skillRadius);

    // 冷却遮罩（半透明黑色扇形）
    this.cooldownMask = this.add.graphics();

    // 冷却进度条（环形进度条）
    this.progressBar = this.add.graphics();

    // 状态文本
    this.statusText = this.add.text(skillX, skillY, '就绪', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 冷却时间文本
    this.cooldownText = this.add.text(skillX, skillY + 40, '', {
      fontSize: '18px',
      color: '#ffaa00'
    }).setOrigin(0.5);

    // 使用次数显示
    this.useCountText = this.add.text(400, 450, '技能使用次数: 0', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 提示文本
    this.hintText = this.add.text(400, 500, '技能准备就绪！点击释放', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.useSkill();
      }
    });

    // 添加视觉反馈区域
    this.effectGraphics = this.add.graphics();
  }

  useSkill() {
    if (!this.skillReady) {
      // 技能冷却中，显示提示
      this.hintText.setText('技能冷却中，请稍候...');
      this.hintText.setColor('#ff0000');
      
      // 抖动效果
      this.tweens.add({
        targets: this.skillIcon,
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 3
      });
      
      return;
    }

    // 技能释放成功
    this.skillReady = false;
    this.cooldownProgress = 0;
    this.skillUseCount++;

    // 更新使用次数
    this.useCountText.setText(`技能使用次数: ${this.skillUseCount}`);

    // 更新状态文本
    this.statusText.setText('冷却中');
    this.statusText.setColor('#ff6600');

    // 更新提示文本
    this.hintText.setText('技能冷却中...');
    this.hintText.setColor('#ff6600');

    // 释放技能视觉效果（青色波纹扩散）
    this.showSkillEffect();

    // 启动冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownTime,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });
  }

  showSkillEffect() {
    // 清除之前的效果
    this.effectGraphics.clear();

    // 创建扩散波纹效果
    const effectCircle = { radius: 60, alpha: 1 };
    
    this.tweens.add({
      targets: effectCircle,
      radius: 150,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onUpdate: () => {
        this.effectGraphics.clear();
        this.effectGraphics.lineStyle(4, 0x00ffff, effectCircle.alpha);
        this.effectGraphics.strokeCircle(400, 300, effectCircle.radius);
      },
      onComplete: () => {
        this.effectGraphics.clear();
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

  onCooldownComplete() {
    // 冷却完成
    this.skillReady = true;
    this.cooldownProgress = 1;

    // 更新状态文本
    this.statusText.setText('就绪');
    this.statusText.setColor('#ffffff');

    // 更新提示文本
    this.hintText.setText('技能准备就绪！点击释放');
    this.hintText.setColor('#00ff00');

    // 清除冷却显示
    this.cooldownMask.clear();
    this.progressBar.clear();
    this.cooldownText.setText('');

    // 就绪闪烁效果
    this.tweens.add({
      targets: [this.skillIcon, this.skillBorder],
      alpha: 0.6,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    if (!this.skillReady && this.cooldownTimer) {
      // 计算冷却进度 (0 到 1)
      const elapsed = this.cooldownTimer.getElapsed();
      this.cooldownProgress = Math.min(elapsed / this.cooldownTime, 1);

      // 更新冷却遮罩（扇形从上方顺时针减少）
      this.drawCooldownMask(this.cooldownProgress);

      // 更新环形进度条
      this.drawProgressBar(this.cooldownProgress);

      // 更新冷却时间文本
      const remaining = Math.ceil((this.cooldownTime - elapsed) / 1000 * 10) / 10;
      this.cooldownText.setText(`${remaining.toFixed(1)}s`);
    }
  }

  drawCooldownMask(progress) {
    this.cooldownMask.clear();
    
    if (progress >= 1) {
      return;
    }

    const skillX = 400;
    const skillY = 300;
    const skillRadius = 55;

    // 绘制扇形遮罩（从顶部开始，顺时针）
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (1 - progress) * Math.PI * 2; // 顺时针减少

    this.cooldownMask.fillStyle(0x000000, 0.7);
    this.cooldownMask.beginPath();
    this.cooldownMask.moveTo(skillX, skillY);
    this.cooldownMask.arc(skillX, skillY, skillRadius, startAngle, endAngle, false);
    this.cooldownMask.closePath();
    this.cooldownMask.fillPath();
  }

  drawProgressBar(progress) {
    this.progressBar.clear();

    const skillX = 400;
    const skillY = 300;
    const outerRadius = 70;
    const innerRadius = 62;

    // 绘制环形进度条背景（灰色）
    this.progressBar.lineStyle(8, 0x444444, 0.5);
    this.progressBar.beginPath();
    this.progressBar.arc(skillX, skillY, 66, 0, Math.PI * 2, false);
    this.progressBar.strokePath();

    // 绘制环形进度条（青色，根据进度显示）
    if (progress > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + progress * Math.PI * 2;

      // 使用渐变色效果（从橙色到青色）
      const color = progress < 0.5 
        ? Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0xff6600),
            Phaser.Display.Color.ValueToColor(0xffaa00),
            100,
            progress * 200
          )
        : Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0xffaa00),
            Phaser.Display.Color.ValueToColor(0x00ffff),
            100,
            (progress - 0.5) * 200
          );

      const colorValue = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

      this.progressBar.lineStyle(8, colorValue, 1);
      this.progressBar.beginPath();
      this.progressBar.arc(skillX, skillY, 66, startAngle, endAngle, false);
      this.progressBar.strokePath();
    }
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