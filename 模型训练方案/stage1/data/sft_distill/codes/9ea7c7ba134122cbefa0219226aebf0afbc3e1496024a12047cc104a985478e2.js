class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = 1500; // 1.5秒冷却时间（毫秒）
    this.isOnCooldown = false;
    this.cooldownProgress = 0;
    this.skillUsedCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能按钮（圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = 400;
    this.skillButtonY = 300;
    this.skillButtonRadius = 60;
    
    this.drawSkillButton();

    // 创建冷却遮罩层
    this.cooldownMask = this.add.graphics();
    
    // 创建冷却进度环
    this.cooldownRing = this.add.graphics();

    // 创建文本提示
    this.instructionText = this.add.text(400, 150, '右键点击释放技能', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建状态文本
    this.statusText = this.add.text(400, 450, '技能就绪', {
      fontSize: '20px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 创建使用次数文本
    this.countText = this.add.text(400, 500, `技能使用次数: ${this.skillUsedCount}`, {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.tryUseSkill();
      }
    });

    // 添加鼠标悬停效果
    this.input.on('pointermove', (pointer) => {
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        this.skillButtonX, this.skillButtonY
      );
      
      if (distance <= this.skillButtonRadius) {
        this.input.setDefaultCursor('pointer');
      } else {
        this.input.setDefaultCursor('default');
      }
    });

    // 冷却计时器引用
    this.cooldownTimer = null;
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    // 绘制外圈
    this.skillButton.lineStyle(4, 0x4444ff, 1);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    // 绘制内部填充
    this.skillButton.fillStyle(0x6666ff, 1);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius - 4);
    
    // 绘制技能图标（简单的闪电符号）
    this.skillButton.lineStyle(3, 0xffff00, 1);
    this.skillButton.beginPath();
    this.skillButton.moveTo(this.skillButtonX - 10, this.skillButtonY - 20);
    this.skillButton.lineTo(this.skillButtonX + 5, this.skillButtonY);
    this.skillButton.lineTo(this.skillButtonX - 5, this.skillButtonY);
    this.skillButton.lineTo(this.skillButtonX + 10, this.skillButtonY + 20);
    this.skillButton.strokePath();
  }

  tryUseSkill() {
    if (this.isOnCooldown) {
      // 技能在冷却中，无法使用
      this.statusText.setText('技能冷却中...');
      this.statusText.setColor('#ff0000');
      return;
    }

    // 使用技能
    this.useSkill();
  }

  useSkill() {
    // 增加使用次数
    this.skillUsedCount++;
    this.countText.setText(`技能使用次数: ${this.skillUsedCount}`);

    // 技能效果：创建一个扩散的圆环特效
    this.createSkillEffect();

    // 开始冷却
    this.startCooldown();
  }

  createSkillEffect() {
    const effectGraphics = this.add.graphics();
    let radius = 0;
    const maxRadius = 150;
    
    // 创建扩散动画
    this.tweens.add({
      targets: { r: 0 },
      r: maxRadius,
      duration: 500,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = tween.getValue();
        effectGraphics.clear();
        effectGraphics.lineStyle(3, 0xffff00, 1 - value / maxRadius);
        effectGraphics.strokeCircle(this.skillButtonX, this.skillButtonY, value);
      },
      onComplete: () => {
        effectGraphics.destroy();
      }
    });
  }

  startCooldown() {
    this.isOnCooldown = true;
    this.cooldownProgress = 0;
    this.statusText.setText('冷却中...');
    this.statusText.setColor('#ff6600');

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.skillCooldown,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });
  }

  onCooldownComplete() {
    this.isOnCooldown = false;
    this.cooldownProgress = 1;
    this.statusText.setText('技能就绪');
    this.statusText.setColor('#00ff00');
    
    // 清除冷却遮罩
    this.cooldownMask.clear();
    this.cooldownRing.clear();
  }

  update(time, delta) {
    if (this.isOnCooldown && this.cooldownTimer) {
      // 计算冷却进度
      const elapsed = this.cooldownTimer.getElapsed();
      this.cooldownProgress = elapsed / this.skillCooldown;
      
      // 绘制灰色遮罩（扇形）
      this.drawCooldownMask();
      
      // 绘制冷却进度环
      this.drawCooldownRing();
    }
  }

  drawCooldownMask() {
    this.cooldownMask.clear();
    
    // 绘制灰色半透明遮罩（扇形，从上方开始逆时针减少）
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (1 - this.cooldownProgress) * Math.PI * 2;
    
    this.cooldownMask.fillStyle(0x888888, 0.7);
    this.cooldownMask.beginPath();
    this.cooldownMask.moveTo(this.skillButtonX, this.skillButtonY);
    this.cooldownMask.arc(
      this.skillButtonX,
      this.skillButtonY,
      this.skillButtonRadius - 4,
      startAngle,
      endAngle,
      false
    );
    this.cooldownMask.closePath();
    this.cooldownMask.fillPath();
  }

  drawCooldownRing() {
    this.cooldownRing.clear();
    
    // 绘制进度环（从上方开始顺时针增长）
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + this.cooldownProgress * Math.PI * 2;
    
    this.cooldownRing.lineStyle(4, 0x00ff00, 1);
    this.cooldownRing.beginPath();
    this.cooldownRing.arc(
      this.skillButtonX,
      this.skillButtonY,
      this.skillButtonRadius + 8,
      startAngle,
      endAngle,
      false
    );
    this.cooldownRing.strokePath();
    
    // 显示剩余时间文本
    const remainingTime = ((1 - this.cooldownProgress) * this.skillCooldown / 1000).toFixed(1);
    
    if (!this.cooldownTimeText) {
      this.cooldownTimeText = this.add.text(
        this.skillButtonX,
        this.skillButtonY,
        remainingTime + 's',
        {
          fontSize: '28px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
    } else {
      this.cooldownTimeText.setText(remainingTime + 's');
    }
    
    // 冷却完成后移除时间文本
    if (this.cooldownProgress >= 1 && this.cooldownTimeText) {
      this.cooldownTimeText.destroy();
      this.cooldownTimeText = null;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: SkillCooldownScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

new Phaser.Game(config);