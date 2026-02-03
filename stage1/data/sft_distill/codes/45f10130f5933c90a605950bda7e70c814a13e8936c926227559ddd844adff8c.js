class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = false; // 技能是否在冷却中
    this.cooldownTimer = null; // 冷却计时器
    this.skillUseCount = 0; // 技能使用次数（可验证状态）
    this.COOLDOWN_DURATION = 2500; // 冷却时长（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const skillRadius = 60;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能按钮底层（橙色圆形）
    this.skillButton = this.add.graphics();
    this.skillButton.fillStyle(0xff8800, 1);
    this.skillButton.fillCircle(centerX, centerY, skillRadius);

    // 创建技能按钮边框
    this.skillBorder = this.add.graphics();
    this.skillBorder.lineStyle(4, 0xffaa44, 1);
    this.skillBorder.strokeCircle(centerX, centerY, skillRadius);

    // 创建冷却遮罩层（扇形）
    this.cooldownMask = this.add.graphics();

    // 创建技能图标（简单的闪电符号）
    this.skillIcon = this.add.graphics();
    this.skillIcon.lineStyle(6, 0xffffff, 1);
    this.skillIcon.beginPath();
    this.skillIcon.moveTo(centerX - 10, centerY - 20);
    this.skillIcon.lineTo(centerX + 5, centerY);
    this.skillIcon.lineTo(centerX - 5, centerY);
    this.skillIcon.lineTo(centerX + 10, centerY + 20);
    this.skillIcon.strokePath();

    // 创建状态文本
    this.statusText = this.add.text(centerX, centerY + 100, '点击释放技能', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建冷却时间文本
    this.cooldownText = this.add.text(centerX, centerY, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // 创建使用次数文本
    this.countText = this.add.text(400, 50, '技能使用次数: 0', {
      fontSize: '20px',
      color: '#ffaa44'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 550, '按鼠标左键释放技能', {
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryUseSkill(centerX, centerY, skillRadius);
      }
    });

    // 存储技能中心坐标和半径供 update 使用
    this.skillCenterX = centerX;
    this.skillCenterY = centerY;
    this.skillRadius = skillRadius;
  }

  tryUseSkill(centerX, centerY, radius) {
    // 检查是否在冷却中
    if (this.skillCooldown) {
      this.statusText.setText('技能冷却中！');
      this.statusText.setColor('#ff4444');
      
      // 0.5秒后恢复文本颜色
      this.time.delayedCall(500, () => {
        this.statusText.setColor('#ffffff');
      });
      return;
    }

    // 释放技能
    this.useSkill();

    // 开始冷却
    this.startCooldown(centerX, centerY, radius);
  }

  useSkill() {
    // 技能效果：创建橙色爆炸特效
    this.skillUseCount++;
    this.countText.setText(`技能使用次数: ${this.skillUseCount}`);
    
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff8800, 0.8);
    
    // 创建扩散动画
    let explosionRadius = 0;
    const maxRadius = 150;
    
    const explosionTimer = this.time.addEvent({
      delay: 16,
      repeat: 30,
      callback: () => {
        explosionRadius += 5;
        const alpha = 1 - (explosionRadius / maxRadius);
        
        explosion.clear();
        explosion.fillStyle(0xff8800, alpha * 0.8);
        explosion.fillCircle(this.skillCenterX, this.skillCenterY, explosionRadius);
        
        if (explosionRadius >= maxRadius) {
          explosion.destroy();
        }
      }
    });

    this.statusText.setText('技能释放！');
    this.statusText.setColor('#00ff00');
  }

  startCooldown(centerX, centerY, radius) {
    this.skillCooldown = true;
    this.statusText.setText('冷却中...');
    this.statusText.setColor('#ff8800');

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.COOLDOWN_DURATION,
      callback: () => {
        this.endCooldown();
      }
    });
  }

  endCooldown() {
    this.skillCooldown = false;
    this.cooldownTimer = null;
    this.statusText.setText('技能准备就绪！');
    this.statusText.setColor('#00ff00');
    this.cooldownText.setText('');

    // 0.5秒后恢复默认文本
    this.time.delayedCall(500, () => {
      this.statusText.setText('点击释放技能');
      this.statusText.setColor('#ffffff');
    });
  }

  update(time, delta) {
    // 更新冷却进度显示
    if (this.skillCooldown && this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      const remaining = this.cooldownTimer.getRemaining();
      
      // 显示剩余时间（保留1位小数）
      this.cooldownText.setText((remaining / 1000).toFixed(1) + 's');

      // 绘制扇形冷却遮罩
      this.cooldownMask.clear();
      this.cooldownMask.fillStyle(0x000000, 0.6);
      
      // 绘制扇形（从顶部顺时针）
      const startAngle = -Math.PI / 2; // -90度（顶部）
      const sweepAngle = progress * Math.PI * 2; // 根据进度计算扫过的角度
      
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(this.skillCenterX, this.skillCenterY);
      this.cooldownMask.arc(
        this.skillCenterX,
        this.skillCenterY,
        this.skillRadius,
        startAngle,
        startAngle + sweepAngle,
        false
      );
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
    } else {
      // 清除冷却遮罩
      this.cooldownMask.clear();
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