class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 可验证状态变量
    this.skillUsedCount = 0;  // 技能使用次数
    this.isSkillOnCooldown = false;  // 技能是否在冷却中
    this.cooldownProgress = 0;  // 冷却进度 0-1
    this.cooldownDuration = 2500;  // 冷却时长（毫秒）
    this.cooldownStartTime = 0;  // 冷却开始时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 标题文本
    this.add.text(width / 2, 50, 'Purple Skill Cooldown System', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 提示文本
    this.instructionText = this.add.text(width / 2, 100, 'Press SPACE to use skill', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // 创建技能按钮（紫色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = width / 2;
    this.skillButtonY = height / 2;
    this.skillButtonRadius = 60;
    this.drawSkillButton(false);
    
    // 技能图标（内部符号）
    this.skillIcon = this.add.graphics();
    this.drawSkillIcon();
    
    // 冷却遮罩层
    this.cooldownMask = this.add.graphics();
    
    // 冷却进度条背景
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRoundedRect(width / 2 - 150, height / 2 + 120, 300, 30, 15);
    
    // 冷却进度条
    this.progressBar = this.add.graphics();
    
    // 冷却文本
    this.cooldownText = this.add.text(width / 2, height / 2 + 135, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 状态信息文本
    this.statusText = this.add.text(width / 2, height - 80, 'Skills Used: 0', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    // 技能效果容器
    this.skillEffects = [];
    
    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 键盘事件监听
    this.spaceKey.on('down', () => {
      this.tryUseSkill();
    });
    
    // 添加鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        this.skillButtonX, this.skillButtonY
      );
      
      if (distance <= this.skillButtonRadius) {
        this.tryUseSkill();
      }
    });
  }

  drawSkillButton(isActive) {
    this.skillButton.clear();
    
    // 外圈光晕（激活时）
    if (isActive && !this.isSkillOnCooldown) {
      this.skillButton.fillStyle(0x9d4edd, 0.3);
      this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius + 10);
    }
    
    // 主按钮
    if (this.isSkillOnCooldown) {
      this.skillButton.fillStyle(0x555555, 1);
    } else {
      this.skillButton.fillStyle(0x9d4edd, 1);
    }
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    // 边框
    this.skillButton.lineStyle(4, 0xc77dff, 1);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
  }

  drawSkillIcon() {
    this.skillIcon.clear();
    this.skillIcon.lineStyle(6, 0xffffff, 1);
    
    // 绘制闪电图标
    const centerX = this.skillButtonX;
    const centerY = this.skillButtonY;
    const size = 30;
    
    this.skillIcon.beginPath();
    this.skillIcon.moveTo(centerX + 5, centerY - size);
    this.skillIcon.lineTo(centerX - 10, centerY);
    this.skillIcon.lineTo(centerX, centerY);
    this.skillIcon.lineTo(centerX - 5, centerY + size);
    this.skillIcon.lineTo(centerX + 10, centerY);
    this.skillIcon.lineTo(centerX, centerY);
    this.skillIcon.closePath();
    this.skillIcon.strokePath();
  }

  tryUseSkill() {
    if (this.isSkillOnCooldown) {
      // 技能在冷却中，显示抖动效果
      this.shakeButton();
      return;
    }
    
    // 使用技能
    this.useSkill();
  }

  useSkill() {
    // 更新状态
    this.skillUsedCount++;
    this.isSkillOnCooldown = true;
    this.cooldownStartTime = this.time.now;
    this.cooldownProgress = 0;
    
    // 更新UI
    this.statusText.setText(`Skills Used: ${this.skillUsedCount}`);
    this.instructionText.setText('Skill on cooldown...');
    this.instructionText.setColor('#ff6b6b');
    this.drawSkillButton(false);
    
    // 创建技能释放效果
    this.createSkillEffect();
    
    // 启动冷却计时器
    this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.onCooldownComplete,
      callbackScope: this
    });
  }

  createSkillEffect() {
    const { width, height } = this.cameras.main;
    
    // 创建多个紫色粒子效果
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const distance = 80;
      const startX = this.skillButtonX + Math.cos(angle) * 20;
      const startY = this.skillButtonY + Math.sin(angle) * 20;
      const endX = this.skillButtonX + Math.cos(angle) * distance;
      const endY = this.skillButtonY + Math.sin(angle) * distance;
      
      const particle = this.add.graphics();
      particle.fillStyle(0xc77dff, 1);
      particle.fillCircle(0, 0, 8);
      particle.setPosition(startX, startY);
      
      this.skillEffects.push(particle);
      
      // 动画：向外扩散并淡出
      this.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
          const index = this.skillEffects.indexOf(particle);
          if (index > -1) {
            this.skillEffects.splice(index, 1);
          }
        }
      });
    }
    
    // 中心闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  shakeButton() {
    // 按钮抖动效果
    this.tweens.add({
      targets: this.skillButton,
      x: this.skillButtonX + 5,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.skillButton.x = 0;
      }
    });
    
    this.tweens.add({
      targets: this.skillIcon,
      x: 5,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.skillIcon.x = 0;
      }
    });
  }

  onCooldownComplete() {
    // 冷却完成
    this.isSkillOnCooldown = false;
    this.cooldownProgress = 1;
    
    // 更新UI
    this.instructionText.setText('Press SPACE to use skill');
    this.instructionText.setColor('#aaaaaa');
    this.drawSkillButton(false);
    this.cooldownText.setText('');
    
    // 清空进度条
    this.progressBar.clear();
    this.cooldownMask.clear();
    
    // 技能就绪闪烁效果
    this.tweens.add({
      targets: this.skillButton,
      alpha: 0.6,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    if (this.isSkillOnCooldown) {
      // 计算冷却进度
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);
      
      // 更新进度条
      this.updateProgressBar();
      
      // 更新冷却遮罩（扇形遮罩）
      this.updateCooldownMask();
      
      // 更新冷却文本
      const remaining = Math.max(0, this.cooldownDuration - elapsed);
      this.cooldownText.setText(`Cooldown: ${(remaining / 1000).toFixed(1)}s`);
    }
  }

  updateProgressBar() {
    const { width, height } = this.cameras.main;
    const barWidth = 300;
    const barHeight = 30;
    const barX = width / 2 - 150;
    const barY = height / 2 + 120;
    
    this.progressBar.clear();
    
    // 绘制进度
    if (this.cooldownProgress < 1) {
      this.progressBar.fillStyle(0x9d4edd, 1);
      this.progressBar.fillRoundedRect(
        barX,
        barY,
        barWidth * this.cooldownProgress,
        barHeight,
        15
      );
    }
  }

  updateCooldownMask() {
    this.cooldownMask.clear();
    
    if (this.cooldownProgress >= 1) {
      return;
    }
    
    // 绘制扇形遮罩（从上方顺时针）
    const startAngle = -Math.PI / 2;  // 从顶部开始
    const endAngle = startAngle + (Math.PI * 2 * this.cooldownProgress);
    
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

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);