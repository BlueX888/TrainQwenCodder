class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 可验证的状态信号
    this.skillUsedCount = 0;  // 技能使用次数
    this.isCooldown = false;   // 是否在冷却中
    this.cooldownProgress = 0; // 冷却进度 0-1
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;

    // 创建背景
    this.add.rectangle(centerX, centerY, 800, 600, 0x1a1a2e);

    // 创建标题文本
    this.add.text(centerX, 50, 'Purple Skill Cooldown System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(centerX, 100, 'Press SPACE to use skill', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能图标容器
    this.skillIcon = this.add.graphics();
    this.drawSkillIcon(false);

    // 创建冷却遮罩层（灰色半透明）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setVisible(false);

    // 创建冷却进度条背景
    const barX = centerX - 150;
    const barY = 420;
    const barWidth = 300;
    const barHeight = 30;

    this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333)
      .setOrigin(0, 0.5);

    // 创建冷却进度条
    this.cooldownBar = this.add.rectangle(barX, barY, 0, barHeight, 0x9b59b6)
      .setOrigin(0, 0.5);

    // 创建进度条边框
    const border = this.add.graphics();
    border.lineStyle(3, 0x666666, 1);
    border.strokeRect(barX - 1.5, barY - barHeight / 2 - 1.5, barWidth + 3, barHeight + 3);

    // 创建状态文本
    this.statusText = this.add.text(centerX, 480, 'Skill Ready!', {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建冷却时间文本
    this.cooldownText = this.add.text(centerX, barY, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建使用计数文本
    this.countText = this.add.text(centerX, 530, 'Skills Used: 0', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 冷却定时器
    this.cooldownTimer = null;
    this.cooldownDuration = 2500; // 2.5秒
    this.cooldownStartTime = 0;

    // 技能释放效果粒子
    this.particles = [];
  }

  update(time, delta) {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.tryUseSkill();
    }

    // 更新冷却进度
    if (this.isCooldown && this.cooldownTimer) {
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);
      
      // 更新进度条
      this.cooldownBar.width = 300 * this.cooldownProgress;
      
      // 更新冷却遮罩（从上到下消失）
      this.updateCooldownMask(1 - this.cooldownProgress);
      
      // 更新冷却时间文本
      const remaining = Math.max(0, this.cooldownDuration - elapsed);
      this.cooldownText.setText(`${(remaining / 1000).toFixed(1)}s`);
      
      // 冷却结束
      if (this.cooldownProgress >= 1) {
        this.endCooldown();
      }
    }

    // 更新技能释放粒子效果
    this.updateParticles(delta);
  }

  tryUseSkill() {
    if (this.isCooldown) {
      // 技能冷却中，显示提示
      this.statusText.setText('Skill on Cooldown!');
      this.statusText.setColor('#ff0000');
      
      // 抖动效果
      this.tweens.add({
        targets: this.skillIcon,
        x: 400 + 10,
        duration: 50,
        yoyo: true,
        repeat: 3
      });
      
      return;
    }

    // 使用技能
    this.useSkill();
  }

  useSkill() {
    this.skillUsedCount++;
    this.isCooldown = true;
    this.cooldownProgress = 0;
    this.cooldownStartTime = this.time.now;

    // 更新计数
    this.countText.setText(`Skills Used: ${this.skillUsedCount}`);

    // 更新状态文本
    this.statusText.setText('Skill Used!');
    this.statusText.setColor('#ffff00');

    // 技能图标变暗
    this.drawSkillIcon(true);
    this.cooldownMask.setVisible(true);

    // 创建技能释放效果
    this.createSkillEffect();

    // 重置进度条
    this.cooldownBar.width = 0;

    // 启动冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.endCooldown,
      callbackScope: this
    });

    console.log(`Skill used! Count: ${this.skillUsedCount}, Cooldown started.`);
  }

  endCooldown() {
    this.isCooldown = false;
    this.cooldownProgress = 1;
    
    // 更新状态文本
    this.statusText.setText('Skill Ready!');
    this.statusText.setColor('#00ff00');
    
    // 恢复技能图标
    this.drawSkillIcon(false);
    this.cooldownMask.setVisible(false);
    
    // 清空冷却时间文本
    this.cooldownText.setText('');
    
    // 完成动画
    this.tweens.add({
      targets: this.skillIcon,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    });

    console.log(`Cooldown ended. Ready to use skill again.`);
  }

  drawSkillIcon(isDimmed) {
    this.skillIcon.clear();
    
    const centerX = 400;
    const centerY = 250;
    const radius = 60;

    // 绘制外圈发光效果
    if (!isDimmed) {
      this.skillIcon.fillStyle(0x9b59b6, 0.3);
      this.skillIcon.fillCircle(centerX, centerY, radius + 15);
    }

    // 绘制主圆形
    const color = isDimmed ? 0x4a2c5e : 0x9b59b6;
    const alpha = isDimmed ? 0.5 : 1;
    this.skillIcon.fillStyle(color, alpha);
    this.skillIcon.fillCircle(centerX, centerY, radius);

    // 绘制内部装饰
    this.skillIcon.fillStyle(0xffffff, isDimmed ? 0.3 : 0.8);
    this.skillIcon.fillCircle(centerX, centerY, radius * 0.4);

    // 绘制闪电图案
    this.skillIcon.lineStyle(6, 0xffffff, isDimmed ? 0.3 : 0.9);
    this.skillIcon.beginPath();
    this.skillIcon.moveTo(centerX, centerY - 30);
    this.skillIcon.lineTo(centerX - 10, centerY);
    this.skillIcon.lineTo(centerX + 5, centerY);
    this.skillIcon.lineTo(centerX - 5, centerY + 30);
    this.skillIcon.strokePath();
  }

  updateCooldownMask(progress) {
    this.cooldownMask.clear();
    
    const centerX = 400;
    const centerY = 250;
    const radius = 60;

    if (progress > 0) {
      // 绘制扇形遮罩（从顶部顺时针）
      this.cooldownMask.fillStyle(0x000000, 0.6);
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(centerX, centerY);
      
      const startAngle = -Math.PI / 2; // 从顶部开始
      const endAngle = startAngle + (Math.PI * 2 * progress);
      
      this.cooldownMask.arc(centerX, centerY, radius, startAngle, endAngle, false);
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
    }
  }

  createSkillEffect() {
    // 创建爆发粒子效果
    const centerX = 400;
    const centerY = 250;
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const speed = 200 + Math.random() * 100;
      
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 5 + Math.random() * 5,
        graphics: this.add.graphics()
      });
    }
  }

  updateParticles(delta) {
    const deltaSeconds = delta / 1000;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx * deltaSeconds;
      p.y += p.vy * deltaSeconds;
      p.life -= deltaSeconds * 2;
      
      if (p.life <= 0) {
        p.graphics.destroy();
        this.particles.splice(i, 1);
      } else {
        p.graphics.clear();
        p.graphics.fillStyle(0x9b59b6, p.life);
        p.graphics.fillCircle(p.x, p.y, p.size * p.life);
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