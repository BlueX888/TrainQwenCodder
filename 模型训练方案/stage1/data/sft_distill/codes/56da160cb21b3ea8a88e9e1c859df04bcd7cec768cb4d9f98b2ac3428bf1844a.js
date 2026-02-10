class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 可验证的状态信号
    this.skillUsedCount = 0; // 技能使用次数
    this.isCooldown = false; // 是否在冷却中
    this.cooldownRemaining = 0; // 剩余冷却时间（毫秒）
    this.cooldownDuration = 4000; // 冷却时长（毫秒）
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
    this.add.text(centerX, 50, '粉色技能冷却系统', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文本
    this.instructionText = this.add.text(centerX, 100, '按 [空格键] 释放技能', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能按钮（粉色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = centerX;
    this.skillButtonY = centerY;
    this.skillButtonRadius = 60;
    this.drawSkillButton(false);

    // 技能图标文本
    this.add.text(centerX, centerY, '技能', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 冷却遮罩（灰色半透明圆形）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setDepth(1);

    // 冷却进度条背景
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRoundedRect(centerX - 150, centerY + 120, 300, 30, 15);

    // 冷却进度条（粉色填充）
    this.progressBar = this.add.graphics();
    this.progressBar.setDepth(2);

    // 冷却时间文本
    this.cooldownText = this.add.text(centerX, centerY + 135, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    // 状态信息文本
    this.statusText = this.add.text(centerX, centerY + 180, '技能就绪！', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 使用次数统计
    this.countText = this.add.text(centerX, this.cameras.main.height - 50, '技能使用次数: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffaaff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加按键按下事件
    this.spaceKey.on('down', () => {
      this.tryUseSkill();
    });

    // 技能释放特效容器
    this.effectParticles = [];
  }

  update(time, delta) {
    // 更新冷却状态
    if (this.isCooldown && this.cooldownTimer) {
      this.cooldownRemaining = this.cooldownDuration - this.cooldownTimer.getElapsed();
      
      if (this.cooldownRemaining < 0) {
        this.cooldownRemaining = 0;
      }

      // 计算进度百分比
      const progress = 1 - (this.cooldownRemaining / this.cooldownDuration);
      
      // 更新进度条
      this.updateProgressBar(progress);
      
      // 更新冷却遮罩
      this.updateCooldownMask(progress);
      
      // 更新冷却时间文本
      const seconds = (this.cooldownRemaining / 1000).toFixed(1);
      this.cooldownText.setText(`冷却中: ${seconds}s`);
      
      // 更新状态文本
      this.statusText.setText('技能冷却中...');
      this.statusText.setColor('#ff6666');
    }

    // 更新特效粒子
    this.updateEffectParticles(delta);
  }

  tryUseSkill() {
    if (this.isCooldown) {
      // 技能冷却中，无法使用
      this.shakeButton();
      return;
    }

    // 释放技能
    this.useSkill();
  }

  useSkill() {
    // 增加使用次数
    this.skillUsedCount++;
    this.countText.setText(`技能使用次数: ${this.skillUsedCount}`);

    // 播放技能释放特效
    this.playSkillEffect();

    // 进入冷却状态
    this.isCooldown = true;
    this.cooldownRemaining = this.cooldownDuration;

    // 更新状态文本
    this.statusText.setText('技能释放！');
    this.statusText.setColor('#ff00ff');

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.onCooldownComplete();
      },
      callbackScope: this
    });

    // 绘制冷却状态的按钮
    this.drawSkillButton(true);
  }

  onCooldownComplete() {
    // 冷却完成
    this.isCooldown = false;
    this.cooldownRemaining = 0;
    this.cooldownTimer = null;

    // 清空进度条
    this.progressBar.clear();
    this.cooldownMask.clear();
    this.cooldownText.setText('');

    // 更新状态文本
    this.statusText.setText('技能就绪！');
    this.statusText.setColor('#00ff00');

    // 恢复按钮样式
    this.drawSkillButton(false);

    // 按钮闪烁效果
    this.flashButton();
  }

  drawSkillButton(isCooldown) {
    this.skillButton.clear();
    
    if (isCooldown) {
      // 冷却状态：暗粉色
      this.skillButton.fillStyle(0x8b4789, 1);
    } else {
      // 就绪状态：亮粉色
      this.skillButton.fillStyle(0xff69b4, 1);
    }
    
    // 绘制圆形按钮
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    // 添加边框
    this.skillButton.lineStyle(4, 0xffffff, 0.8);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
  }

  updateProgressBar(progress) {
    this.progressBar.clear();
    
    const barWidth = 300;
    const barHeight = 30;
    const barX = this.skillButtonX - 150;
    const barY = this.skillButtonY + 120;
    const fillWidth = barWidth * progress;

    // 绘制粉色进度
    this.progressBar.fillStyle(0xff69b4, 1);
    this.progressBar.fillRoundedRect(barX, barY, fillWidth, barHeight, 15);
  }

  updateCooldownMask(progress) {
    this.cooldownMask.clear();
    
    // 绘制扇形遮罩，从顶部顺时针填充
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (2 * Math.PI * (1 - progress));
    
    if (progress < 1) {
      this.cooldownMask.fillStyle(0x000000, 0.6);
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(this.skillButtonX, this.skillButtonY);
      this.cooldownMask.arc(
        this.skillButtonX,
        this.skillButtonY,
        this.skillButtonRadius,
        startAngle,
        endAngle,
        false
      );
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
    }
  }

  playSkillEffect() {
    // 创建粉色粒子特效
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 200 + Math.random() * 100;
      
      const particle = {
        x: this.skillButtonX,
        y: this.skillButtonY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1000,
        maxLife: 1000,
        size: 5 + Math.random() * 5
      };
      
      this.effectParticles.push(particle);
    }

    // 按钮放大效果
    this.tweens.add({
      targets: this.skillButton,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  updateEffectParticles(delta) {
    const graphics = this.add.graphics();
    graphics.setDepth(10);

    for (let i = this.effectParticles.length - 1; i >= 0; i--) {
      const p = this.effectParticles[i];
      
      // 更新位置
      p.x += (p.vx * delta) / 1000;
      p.y += (p.vy * delta) / 1000;
      
      // 更新生命
      p.life -= delta;
      
      if (p.life <= 0) {
        this.effectParticles.splice(i, 1);
        continue;
      }
      
      // 绘制粒子
      const alpha = p.life / p.maxLife;
      graphics.fillStyle(0xff69b4, alpha);
      graphics.fillCircle(p.x, p.y, p.size * alpha);
    }
  }

  shakeButton() {
    // 按钮抖动效果（表示无法使用）
    this.tweens.add({
      targets: this.skillButton,
      x: this.skillButtonX - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => {
        this.skillButton.x = 0;
      }
    });
  }

  flashButton() {
    // 按钮闪烁效果（冷却完成）
    this.tweens.add({
      targets: this.skillButton,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
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