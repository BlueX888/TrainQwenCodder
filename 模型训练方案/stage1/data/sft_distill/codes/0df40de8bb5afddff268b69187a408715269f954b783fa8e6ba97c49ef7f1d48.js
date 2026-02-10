// 技能冷却系统
class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0;
    this.skillUseCount = 0;
    this.cooldownTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      skillUseCount: 0,
      skillOnCooldown: false,
      cooldownProgress: 0,
      lastSkillUseTime: 0,
      logs: []
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.add.text(400, 50, 'Skill Cooldown System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 100, 'Click LEFT MOUSE BUTTON to use skill', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能按钮（红色圆形）
    this.skillButton = this.add.graphics();
    this.skillButtonX = 400;
    this.skillButtonY = 300;
    this.skillButtonRadius = 80;
    this.drawSkillButton();

    // 创建冷却遮罩层（灰色半透明扇形）
    this.cooldownMask = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(400, 450, 'Ready to use!', {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建冷却进度文本
    this.progressText = this.add.text(400, 490, '', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建使用次数文本
    this.countText = this.add.text(400, 530, 'Skill Used: 0 times', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryUseSkill(pointer);
      }
    });

    // 添加说明文本
    this.add.text(400, 560, 'Cooldown: 0.5 seconds', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    // 绘制红色技能按钮
    this.skillButton.fillStyle(0xff0000, 1);
    this.skillButton.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    // 绘制边框
    this.skillButton.lineStyle(4, 0xffffff, 1);
    this.skillButton.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    // 绘制技能图标（闪电符号）
    this.skillButton.lineStyle(6, 0xffff00, 1);
    this.skillButton.beginPath();
    this.skillButton.moveTo(this.skillButtonX - 10, this.skillButtonY - 30);
    this.skillButton.lineTo(this.skillButtonX + 10, this.skillButtonY - 10);
    this.skillButton.lineTo(this.skillButtonX - 5, this.skillButtonY);
    this.skillButton.lineTo(this.skillButtonX + 15, this.skillButtonY + 30);
    this.skillButton.strokePath();
  }

  tryUseSkill(pointer) {
    // 检查是否在技能按钮范围内
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.skillButtonX, this.skillButtonY
    );

    if (distance > this.skillButtonRadius) {
      return; // 点击位置不在按钮内
    }

    // 检查是否在冷却中
    if (this.skillOnCooldown) {
      this.logEvent('Skill on cooldown, cannot use');
      // 抖动效果
      this.cameras.main.shake(100, 0.005);
      return;
    }

    // 使用技能
    this.useSkill();
  }

  useSkill() {
    this.skillOnCooldown = true;
    this.cooldownProgress = 0;
    this.skillUseCount++;

    // 更新状态
    this.statusText.setText('Cooling down...');
    this.statusText.setColor('#ff0000');
    this.countText.setText(`Skill Used: ${this.skillUseCount} times`);

    // 技能特效（闪光）
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.6);
    flash.fillCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius + 20);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 记录日志
    const logEntry = {
      time: this.time.now,
      event: 'skill_used',
      count: this.skillUseCount
    };
    this.logEvent(JSON.stringify(logEntry));

    // 更新全局信号
    window.__signals__.skillUseCount = this.skillUseCount;
    window.__signals__.skillOnCooldown = true;
    window.__signals__.lastSkillUseTime = this.time.now;

    // 启动冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: 500, // 0.5 秒冷却
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });
  }

  onCooldownComplete() {
    this.skillOnCooldown = false;
    this.cooldownProgress = 1;
    
    // 更新状态
    this.statusText.setText('Ready to use!');
    this.statusText.setColor('#00ff00');
    this.progressText.setText('');

    // 清除冷却遮罩
    this.cooldownMask.clear();

    // 记录日志
    const logEntry = {
      time: this.time.now,
      event: 'cooldown_complete',
      count: this.skillUseCount
    };
    this.logEvent(JSON.stringify(logEntry));

    // 更新全局信号
    window.__signals__.skillOnCooldown = false;
    window.__signals__.cooldownProgress = 1;

    // 就绪特效
    const readyFlash = this.add.graphics();
    readyFlash.lineStyle(4, 0x00ff00, 0.8);
    readyFlash.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
    
    this.tweens.add({
      targets: readyFlash,
      alpha: 0,
      scale: 1.3,
      duration: 400,
      onComplete: () => readyFlash.destroy()
    });
  }

  update(time, delta) {
    if (this.skillOnCooldown && this.cooldownTimer) {
      // 计算冷却进度
      const elapsed = this.cooldownTimer.getElapsed();
      const totalDelay = this.cooldownTimer.delay;
      this.cooldownProgress = Math.min(elapsed / totalDelay, 1);

      // 更新进度文本
      const remaining = ((totalDelay - elapsed) / 1000).toFixed(2);
      this.progressText.setText(`Cooldown: ${remaining}s`);

      // 绘制冷却遮罩（扇形从上方顺时针填充）
      this.drawCooldownMask();

      // 更新全局信号
      window.__signals__.cooldownProgress = this.cooldownProgress;
    }
  }

  drawCooldownMask() {
    this.cooldownMask.clear();
    
    if (this.cooldownProgress >= 1) {
      return;
    }

    // 绘制灰色半透明扇形表示冷却进度
    const startAngle = -90; // 从顶部开始
    const sweepAngle = 360 * (1 - this.cooldownProgress); // 剩余角度

    this.cooldownMask.fillStyle(0x000000, 0.7);
    this.cooldownMask.slice(
      this.skillButtonX,
      this.skillButtonY,
      this.skillButtonRadius,
      Phaser.Math.DegToRad(startAngle),
      Phaser.Math.DegToRad(startAngle + sweepAngle),
      false
    );
    this.cooldownMask.fillPath();

    // 绘制进度边框
    this.cooldownMask.lineStyle(3, 0xffffff, 0.5);
    this.cooldownMask.strokeCircle(this.skillButtonX, this.skillButtonY, this.skillButtonRadius);
  }

  logEvent(message) {
    console.log(`[Skill System] ${message}`);
    if (window.__signals__) {
      window.__signals__.logs.push({
        time: this.time.now,
        message: message
      });
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证接口
window.getSkillStatus = function() {
  return {
    skillUseCount: window.__signals__.skillUseCount,
    skillOnCooldown: window.__signals__.skillOnCooldown,
    cooldownProgress: window.__signals__.cooldownProgress,
    lastSkillUseTime: window.__signals__.lastSkillUseTime,
    logs: window.__signals__.logs
  };
};

console.log('Skill Cooldown System initialized. Use window.getSkillStatus() to check status.');