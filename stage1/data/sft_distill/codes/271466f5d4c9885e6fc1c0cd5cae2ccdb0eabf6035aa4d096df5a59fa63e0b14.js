class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 技能状态变量（可验证的状态信号）
    this.skillUsageCount = 0;  // 技能使用次数
    this.isCooldown = false;   // 是否在冷却中
    this.cooldownDuration = 1500; // 冷却时长（毫秒）
    this.cooldownTimer = null;
    this.cooldownStartTime = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能图标（蓝色圆形）
    this.skillIcon = this.add.graphics();
    this.skillIcon.x = 400;
    this.skillIcon.y = 300;
    this.drawSkillIcon(false);

    // 创建冷却遮罩层
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.x = 400;
    this.cooldownMask.y = 300;

    // 创建冷却进度条背景
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x333333, 1);
    progressBarBg.fillRect(250, 400, 300, 30);

    // 创建冷却进度条
    this.progressBar = this.add.graphics();

    // 创建文本提示
    this.statusText = this.add.text(400, 150, '按 [空格键] 释放技能', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.cooldownText = this.add.text(400, 450, '', {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 技能使用统计
    this.statsText = this.add.text(400, 500, '技能使用次数: 0', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 技能特效容器
    this.skillEffects = [];

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.useSkill());

    // 说明文本
    this.add.text(400, 550, '冷却时间: 1.5秒', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  drawSkillIcon(isActive) {
    this.skillIcon.clear();
    
    // 外圈光晕
    if (isActive) {
      this.skillIcon.fillStyle(0x00ffff, 0.3);
      this.skillIcon.fillCircle(0, 0, 70);
    }
    
    // 主图标
    const color = isActive ? 0x0099ff : 0x0066cc;
    this.skillIcon.fillStyle(color, 1);
    this.skillIcon.fillCircle(0, 0, 50);
    
    // 内圈装饰
    this.skillIcon.fillStyle(0xffffff, 0.3);
    this.skillIcon.fillCircle(0, 0, 35);
    
    // 中心点
    this.skillIcon.fillStyle(0xffffff, 0.8);
    this.skillIcon.fillCircle(0, 0, 15);
  }

  useSkill() {
    // 检查是否在冷却中
    if (this.isCooldown) {
      // 摇晃提示
      this.tweens.add({
        targets: this.skillIcon,
        x: 390,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.skillIcon.x = 400;
        }
      });
      return;
    }

    // 释放技能
    this.skillUsageCount++;
    this.statsText.setText(`技能使用次数: ${this.skillUsageCount}`);
    
    // 显示技能特效
    this.showSkillEffect();
    
    // 进入冷却状态
    this.startCooldown();
  }

  showSkillEffect() {
    // 创建蓝色波纹特效
    const effect = this.add.graphics();
    effect.x = 400;
    effect.y = 300;
    this.skillEffects.push(effect);

    let radius = 50;
    let alpha = 1;

    const effectTimer = this.time.addEvent({
      delay: 16,
      repeat: 60,
      callback: () => {
        effect.clear();
        effect.lineStyle(4, 0x00ffff, alpha);
        effect.strokeCircle(0, 0, radius);
        
        radius += 5;
        alpha -= 0.016;
        
        if (alpha <= 0) {
          effect.destroy();
          this.skillEffects = this.skillEffects.filter(e => e !== effect);
        }
      }
    });

    // 技能图标闪光效果
    this.drawSkillIcon(true);
    this.time.delayedCall(200, () => {
      if (!this.isCooldown) {
        this.drawSkillIcon(false);
      }
    });
  }

  startCooldown() {
    this.isCooldown = true;
    this.cooldownStartTime = this.time.now;
    
    // 更新状态文本
    this.statusText.setText('技能冷却中...');
    this.statusText.setColor('#ff6666');
    
    // 绘制冷却图标
    this.drawSkillIcon(false);
    
    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => this.endCooldown()
    });
  }

  endCooldown() {
    this.isCooldown = false;
    this.cooldownTimer = null;
    
    // 更新状态文本
    this.statusText.setText('按 [空格键] 释放技能');
    this.statusText.setColor('#ffffff');
    this.cooldownText.setText('');
    
    // 清除冷却遮罩
    this.cooldownMask.clear();
    
    // 清除进度条
    this.progressBar.clear();
    
    // 技能就绪闪烁效果
    this.tweens.add({
      targets: this.skillIcon,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.skillIcon.alpha = 1;
      }
    });
  }

  update(time, delta) {
    // 更新冷却进度
    if (this.isCooldown && this.cooldownTimer) {
      const elapsed = time - this.cooldownStartTime;
      const progress = Math.min(elapsed / this.cooldownDuration, 1);
      const remaining = Math.max(this.cooldownDuration - elapsed, 0);
      
      // 更新冷却文本
      this.cooldownText.setText(`冷却剩余: ${(remaining / 1000).toFixed(2)}秒`);
      
      // 更新进度条
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ffff, 0.8);
      this.progressBar.fillRect(250, 400, 300 * progress, 30);
      
      // 更新冷却遮罩（扇形遮罩）
      this.cooldownMask.clear();
      this.cooldownMask.fillStyle(0x000000, 0.6);
      
      // 绘制扇形遮罩（从顶部顺时针）
      const angle = (1 - progress) * Math.PI * 2;
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(0, 0);
      this.cooldownMask.arc(0, 0, 50, -Math.PI / 2, -Math.PI / 2 + angle, false);
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
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