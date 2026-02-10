class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = 2500; // 2.5秒冷却时间（毫秒）
    this.isOnCooldown = false;
    this.cooldownTimer = null;
    this.cooldownProgress = 0; // 0-1 表示冷却进度
    this.skillUseCount = 0; // 可验证的状态信号
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
    this.skillButton.lineStyle(4, 0xffaa44, 1);
    this.skillButton.strokeCircle(centerX, centerY, skillRadius);

    // 创建冷却遮罩层（半透明黑色扇形）
    this.cooldownMask = this.add.graphics();

    // 创建技能图标（简单的闪电符号）
    const icon = this.add.graphics();
    icon.lineStyle(6, 0xffffff, 1);
    icon.beginPath();
    icon.moveTo(centerX - 10, centerY - 20);
    icon.lineTo(centerX + 5, centerY);
    icon.lineTo(centerX - 5, centerY);
    icon.lineTo(centerX + 10, centerY + 20);
    icon.strokePath();

    // 创建状态文本
    this.statusText = this.add.text(centerX, centerY + 100, 'Click to use skill!', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建冷却时间文本
    this.cooldownText = this.add.text(centerX, centerY, '', {
      fontSize: '32px',
      color: '#ff0000',
      fontStyle: 'bold',
      align: 'center'
    });
    this.cooldownText.setOrigin(0.5);

    // 创建使用次数显示
    this.countText = this.add.text(20, 20, 'Skills Used: 0', {
      fontSize: '20px',
      color: '#00ff00'
    });

    // 添加说明文本
    this.add.text(400, 500, 'Left Click on the orange circle to use skill', {
      fontSize: '18px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      this.tryUseSkill(pointer, centerX, centerY, skillRadius);
    });

    // 存储技能按钮位置和半径供后续使用
    this.skillData = { x: centerX, y: centerY, radius: skillRadius };
  }

  tryUseSkill(pointer, centerX, centerY, radius) {
    // 检查点击位置是否在技能按钮范围内
    const distance = Phaser.Math.Distance.Between(
      pointer.x, 
      pointer.y, 
      centerX, 
      centerY
    );

    if (distance > radius) {
      return; // 点击位置不在技能按钮内
    }

    // 检查是否在冷却中
    if (this.isOnCooldown) {
      this.statusText.setText('Skill on cooldown!');
      this.statusText.setColor('#ff0000');
      
      // 0.3秒后恢复文本
      this.time.delayedCall(300, () => {
        if (this.isOnCooldown) {
          this.statusText.setColor('#ffffff');
        }
      });
      return;
    }

    // 使用技能
    this.useSkill();
  }

  useSkill() {
    // 技能使用逻辑
    this.skillUseCount++;
    this.countText.setText(`Skills Used: ${this.skillUseCount}`);
    this.statusText.setText('Skill Activated!');
    this.statusText.setColor('#00ff00');

    // 播放技能效果（简单的闪光效果）
    this.playSkillEffect();

    // 开始冷却
    this.startCooldown();
  }

  playSkillEffect() {
    const { x, y } = this.skillData;
    
    // 创建扩散圆环效果
    const effectCircle = this.add.graphics();
    effectCircle.lineStyle(4, 0xffff00, 1);
    
    let radius = 60;
    const maxRadius = 150;
    
    const effectTimer = this.time.addEvent({
      delay: 16,
      repeat: 20,
      callback: () => {
        effectCircle.clear();
        effectCircle.lineStyle(4, 0xffff00, 1 - (radius - 60) / (maxRadius - 60));
        effectCircle.strokeCircle(x, y, radius);
        radius += 4.5;
        
        if (radius >= maxRadius) {
          effectCircle.destroy();
        }
      }
    });
  }

  startCooldown() {
    this.isOnCooldown = true;
    this.cooldownProgress = 0;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.skillCooldown,
      callback: () => {
        this.endCooldown();
      }
    });
  }

  endCooldown() {
    this.isOnCooldown = false;
    this.cooldownProgress = 0;
    this.cooldownTimer = null;
    this.statusText.setText('Skill Ready!');
    this.statusText.setColor('#00ff00');
    this.cooldownText.setText('');

    // 0.5秒后恢复提示文本
    this.time.delayedCall(500, () => {
      if (!this.isOnCooldown) {
        this.statusText.setText('Click to use skill!');
        this.statusText.setColor('#ffffff');
      }
    });
  }

  update(time, delta) {
    if (this.isOnCooldown && this.cooldownTimer) {
      // 计算冷却进度（0-1）
      const elapsed = this.cooldownTimer.getElapsed();
      this.cooldownProgress = Math.min(elapsed / this.skillCooldown, 1);

      // 更新冷却遮罩（绘制扇形）
      this.updateCooldownMask();

      // 更新冷却时间文本
      const remaining = this.skillCooldown - elapsed;
      this.cooldownText.setText((remaining / 1000).toFixed(1) + 's');
    }
  }

  updateCooldownMask() {
    const { x, y, radius } = this.skillData;
    
    this.cooldownMask.clear();
    
    if (this.cooldownProgress < 1) {
      // 绘制扇形遮罩
      const startAngle = -90; // 从顶部开始
      const endAngle = startAngle + (360 * this.cooldownProgress);
      
      this.cooldownMask.fillStyle(0x000000, 0.7);
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(x, y);
      this.cooldownMask.arc(
        x, 
        y, 
        radius, 
        Phaser.Math.DegToRad(startAngle), 
        Phaser.Math.DegToRad(endAngle), 
        false
      );
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
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