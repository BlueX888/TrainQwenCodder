class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0;
    this.cooldownDuration = 1500; // 1.5秒
    this.cooldownStartTime = 0;
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 标题文本
    this.add.text(centerX, 50, 'Purple Skill Cooldown Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文本
    this.instructionText = this.add.text(centerX, 120, 'Press SPACE to use skill', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 技能使用次数显示
    this.skillCountText = this.add.text(centerX, 160, 'Skills Used: 0', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 技能按钮背景（紫色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = centerX;
    this.skillButtonY = centerY;
    this.skillButtonRadius = 60;
    this.drawSkillButton();

    // 技能图标（内部紫色星形装饰）
    this.skillIcon = this.add.graphics();
    this.drawSkillIcon();

    // 冷却遮罩层
    this.cooldownMask = this.add.graphics();

    // 冷却进度条容器
    const barWidth = 300;
    const barHeight = 30;
    const barX = centerX - barWidth / 2;
    const barY = centerY + 120;

    // 进度条背景
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);
    barBg.lineStyle(2, 0x666666, 1);
    barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 5);

    // 进度条填充
    this.cooldownBar = this.add.graphics();
    this.barX = barX;
    this.barY = barY;
    this.barWidth = barWidth;
    this.barHeight = barHeight;

    // 冷却时间文本
    this.cooldownText = this.add.text(centerX, barY + barHeight / 2, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(centerX, centerY + 180, 'Ready!', {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.useSkill());

    // 技能效果粒子容器
    this.skillEffects = [];
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    if (this.skillOnCooldown) {
      // 冷却中显示灰色
      this.skillButton.fillStyle(0x666666, 1);
      this.skillButton.lineStyle(4, 0x444444, 1);
    } else {
      // 可用时显示紫色并带光晕
      this.skillButton.fillStyle(0x9b59b6, 1);
      this.skillButton.lineStyle(4, 0xd7a2f0, 1);
      
      // 添加外层光晕
      this.skillButton.fillStyle(0x9b59b6, 0.3);
      this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius + 10);
    }
    
    this.skillButton.fillStyle(this.skillOnCooldown ? 0x666666 : 0x9b59b6, 1);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
  }

  drawSkillIcon() {
    this.skillIcon.clear();
    this.skillIcon.lineStyle(3, this.skillOnCooldown ? 0x999999 : 0xffffff, 1);
    
    // 绘制星形图标
    const points = [];
    const spikes = 5;
    const outerRadius = 25;
    const innerRadius = 12;
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      points.push(
        this.skillButtonX + Math.cos(angle) * radius,
        this.skillButtonY + Math.sin(angle) * radius
      );
    }
    
    this.skillIcon.beginPath();
    this.skillIcon.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      this.skillIcon.lineTo(points[i], points[i + 1]);
    }
    this.skillIcon.closePath();
    this.skillIcon.strokePath();
  }

  drawCooldownMask() {
    this.cooldownMask.clear();
    
    if (this.skillOnCooldown && this.cooldownProgress < 1) {
      // 绘制扇形遮罩显示冷却进度
      this.cooldownMask.fillStyle(0x000000, 0.6);
      this.cooldownMask.slice(
        this.skillButtonX,
        this.skillButtonY,
        this.skillButtonRadius,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + 360 * (1 - this.cooldownProgress)),
        false
      );
      this.cooldownMask.fillPath();
    }
  }

  useSkill() {
    if (this.skillOnCooldown) {
      // 冷却中，显示抖动效果
      this.cameras.main.shake(100, 0.002);
      return;
    }

    // 释放技能
    this.skillOnCooldown = true;
    this.cooldownStartTime = this.time.now;
    this.cooldownProgress = 0;
    this.skillUseCount++;

    // 更新显示
    this.skillCountText.setText(`Skills Used: ${this.skillUseCount}`);
    this.statusText.setText('Cooling Down...');
    this.statusText.setColor('#ff6b6b');
    this.instructionText.setText('Skill on cooldown!');

    // 技能释放视觉效果
    this.createSkillEffect();

    // 设置冷却计时器
    this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.skillOnCooldown = false;
        this.cooldownProgress = 1;
        this.statusText.setText('Ready!');
        this.statusText.setColor('#00ff00');
        this.instructionText.setText('Press SPACE to use skill');
        this.cooldownText.setText('');
        this.drawSkillButton();
        this.drawSkillIcon();
        this.drawCooldownMask();
        this.updateCooldownBar();
      }
    });
  }

  createSkillEffect() {
    // 创建紫色爆发效果
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 200 + Math.random() * 100;
      const particle = {
        x: this.skillButtonX,
        y: this.skillButtonY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        graphics: this.add.graphics()
      };
      
      this.skillEffects.push(particle);
    }

    // 屏幕闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0x9b59b6, 0.5);
    flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  updateCooldownBar() {
    this.cooldownBar.clear();
    
    if (this.cooldownProgress > 0) {
      const fillWidth = this.barWidth * this.cooldownProgress;
      
      // 渐变色效果：从红到紫
      const color = this.cooldownProgress < 0.5 
        ? Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0xff6b6b),
            Phaser.Display.Color.ValueToColor(0x9b59b6),
            100,
            this.cooldownProgress * 200
          )
        : Phaser.Display.Color.ValueToColor(0x9b59b6);
      
      this.cooldownBar.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      this.cooldownBar.fillRoundedRect(this.barX, this.barY, fillWidth, this.barHeight, 5);
    }
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.skillOnCooldown) {
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);
      
      // 更新冷却时间文本
      const remaining = Math.max(0, (this.cooldownDuration - elapsed) / 1000);
      this.cooldownText.setText(remaining > 0 ? `${remaining.toFixed(1)}s` : '');
      
      // 更新视觉元素
      this.drawSkillButton();
      this.drawSkillIcon();
      this.drawCooldownMask();
      this.updateCooldownBar();
    }

    // 更新技能效果粒子
    for (let i = this.skillEffects.length - 1; i >= 0; i--) {
      const particle = this.skillEffects[i];
      
      particle.x += particle.vx * delta / 1000;
      particle.y += particle.vy * delta / 1000;
      particle.life -= delta / 1000;
      
      if (particle.life <= 0) {
        particle.graphics.destroy();
        this.skillEffects.splice(i, 1);
      } else {
        particle.graphics.clear();
        particle.graphics.fillStyle(0x9b59b6, particle.life);
        particle.graphics.fillCircle(particle.x, particle.y, 5 * particle.life);
      }
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