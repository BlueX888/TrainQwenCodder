class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = false;
    this.cooldownProgress = 0;
    this.skillUseCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能按钮（红色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = 400;
    this.skillButtonY = 300;
    this.skillRadius = 60;
    this.drawSkillButton();

    // 创建冷却遮罩
    this.cooldownMask = this.add.graphics();

    // 创建技能特效容器
    this.effectsContainer = this.add.container(0, 0);

    // 创建状态文本
    this.statusText = this.add.text(400, 150, '点击红色圆形释放技能', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建计数文本
    this.countText = this.add.text(400, 200, '技能使用次数: 0', {
      fontSize: '20px',
      color: '#ffff00'
    });
    this.countText.setOrigin(0.5);

    // 创建冷却时间文本
    this.cooldownText = this.add.text(400, 300, '', {
      fontSize: '32px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.cooldownText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(400, 500, '按鼠标左键释放技能\n冷却时间：1秒', {
      fontSize: '18px',
      color: '#888888',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryUseSkill(pointer);
      }
    });

    // 添加鼠标悬停效果
    this.input.on('pointermove', (pointer) => {
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        this.skillButtonX, this.skillButtonY
      );
      
      if (distance <= this.skillRadius) {
        this.input.setDefaultCursor('pointer');
      } else {
        this.input.setDefaultCursor('default');
      }
    });
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    // 绘制外圈光晕
    this.skillButton.fillStyle(0xff0000, 0.3);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillRadius + 10);
    
    // 绘制主体
    this.skillButton.fillStyle(0xff0000, 1);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillRadius);
    
    // 绘制高光
    this.skillButton.fillStyle(0xff6666, 0.6);
    this.skillButton.fillCircle(
      this.skillButtonX - 15,
      this.skillButtonY - 15,
      20
    );
    
    // 绘制边框
    this.skillButton.lineStyle(3, 0xffffff, 0.8);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillRadius);
  }

  tryUseSkill(pointer) {
    // 检查是否点击在技能按钮上
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.skillButtonX, this.skillButtonY
    );

    if (distance > this.skillRadius) {
      return;
    }

    // 检查是否在冷却中
    if (this.skillCooldown) {
      this.statusText.setText('技能冷却中...');
      this.statusText.setColor('#ff0000');
      
      // 抖动效果
      this.tweens.add({
        targets: this.skillButton,
        x: this.skillButtonX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3
      });
      
      return;
    }

    // 释放技能
    this.useSkill();
  }

  useSkill() {
    this.skillUseCount++;
    this.countText.setText(`技能使用次数: ${this.skillUseCount}`);
    this.statusText.setText('技能释放！');
    this.statusText.setColor('#00ff00');

    // 播放技能特效
    this.playSkillEffect();

    // 开始冷却
    this.startCooldown();
  }

  playSkillEffect() {
    // 创建扩散波纹效果
    for (let i = 0; i < 3; i++) {
      const wave = this.add.graphics();
      wave.lineStyle(4, 0xff0000, 1);
      wave.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillRadius);
      
      this.tweens.add({
        targets: wave,
        alpha: 0,
        scaleX: 3,
        scaleY: 3,
        duration: 800,
        delay: i * 150,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          wave.destroy();
        }
      });
    }

    // 按钮闪烁效果
    this.tweens.add({
      targets: this.skillButton,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // 创建粒子效果
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.add.graphics();
      particle.fillStyle(0xff0000, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(this.skillButtonX, this.skillButtonY);

      this.tweens.add({
        targets: particle,
        x: this.skillButtonX + Math.cos(angle) * 120,
        y: this.skillButtonY + Math.sin(angle) * 120,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  startCooldown() {
    this.skillCooldown = true;
    this.cooldownProgress = 0;

    const cooldownDuration = 1000; // 1秒
    const startTime = this.time.now;

    // 创建冷却计时器
    const cooldownTimer = this.time.addEvent({
      delay: cooldownDuration,
      callback: () => {
        this.skillCooldown = false;
        this.cooldownProgress = 0;
        this.statusText.setText('技能已就绪');
        this.statusText.setColor('#00ff00');
        this.cooldownText.setText('');
        this.cooldownMask.clear();
      }
    });

    // 更新冷却进度（每帧）
    this.cooldownUpdateEvent = this.time.addEvent({
      delay: 16, // 约60fps
      callback: () => {
        const elapsed = this.time.now - startTime;
        this.cooldownProgress = Math.min(elapsed / cooldownDuration, 1);
        
        // 更新冷却遮罩
        this.updateCooldownMask();
        
        // 更新冷却时间文本
        const remaining = Math.ceil((cooldownDuration - elapsed) / 1000 * 10) / 10;
        if (remaining > 0) {
          this.cooldownText.setText(remaining.toFixed(1) + 's');
        }
      },
      loop: true
    });

    // 在冷却结束时停止更新事件
    cooldownTimer.callback = () => {
      this.skillCooldown = false;
      this.cooldownProgress = 0;
      this.statusText.setText('技能已就绪');
      this.statusText.setColor('#00ff00');
      this.cooldownText.setText('');
      this.cooldownMask.clear();
      
      if (this.cooldownUpdateEvent) {
        this.cooldownUpdateEvent.destroy();
        this.cooldownUpdateEvent = null;
      }
    };
  }

  updateCooldownMask() {
    this.cooldownMask.clear();

    if (this.cooldownProgress >= 1) {
      return;
    }

    // 绘制扇形遮罩（从上方开始，顺时针）
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (1 - this.cooldownProgress) * Math.PI * 2;

    this.cooldownMask.fillStyle(0x000000, 0.7);
    this.cooldownMask.beginPath();
    this.cooldownMask.moveTo(this.skillButtonX, this.skillButtonY);
    this.cooldownMask.arc(
      this.skillButtonX,
      this.skillButtonY,
      this.skillRadius,
      startAngle,
      endAngle,
      false
    );
    this.cooldownMask.closePath();
    this.cooldownMask.fillPath();

    // 绘制进度圆环
    this.cooldownMask.lineStyle(4, 0xffff00, 1);
    this.cooldownMask.beginPath();
    this.cooldownMask.arc(
      this.skillButtonX,
      this.skillButtonY,
      this.skillRadius + 5,
      startAngle,
      startAngle + this.cooldownProgress * Math.PI * 2,
      false
    );
    this.cooldownMask.strokePath();
  }

  update(time, delta) {
    // 主循环逻辑（如果需要）
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
const game = new Phaser.Game(config);