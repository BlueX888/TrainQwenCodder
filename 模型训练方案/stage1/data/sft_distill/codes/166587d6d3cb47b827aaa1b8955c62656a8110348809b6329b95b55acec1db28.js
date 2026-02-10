// 技能冷却系统
class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = false;
    this.cooldownTimer = null;
    this.skillUseCount = 0;
    
    // 可验证的状态信号
    window.__signals__ = {
      skillUseCount: 0,
      cooldownActive: false,
      cooldownProgress: 0,
      lastUseTime: 0,
      events: []
    };
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const skillRadius = 60;
    
    // 创建技能按钮背景
    this.skillButton = this.add.graphics();
    this.skillButton.fillStyle(0x4CAF50, 1);
    this.skillButton.fillCircle(centerX, centerY, skillRadius);
    this.skillButton.lineStyle(4, 0x2E7D32, 1);
    this.skillButton.strokeCircle(centerX, centerY, skillRadius);
    
    // 技能图标（简单的闪电符号）
    this.skillIcon = this.add.graphics();
    this.drawSkillIcon(centerX, centerY);
    
    // 冷却遮罩层（初始不可见）
    this.cooldownMask = this.add.graphics();
    this.cooldownMask.setDepth(1);
    
    // 冷却进度条背景
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 0.8);
    this.progressBarBg.fillRect(centerX - 80, centerY + 100, 160, 20);
    this.progressBarBg.lineStyle(2, 0x666666, 1);
    this.progressBarBg.strokeRect(centerX - 80, centerY + 100, 160, 20);
    
    // 冷却进度条
    this.progressBar = this.add.graphics();
    this.progressBar.setDepth(2);
    
    // 冷却文本
    this.cooldownText = this.add.text(centerX, centerY + 110, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.cooldownText.setOrigin(0.5);
    this.cooldownText.setDepth(3);
    
    // 提示文本
    this.hintText = this.add.text(centerX, 50, '点击技能按钮释放技能\n冷却时间：1.5秒', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);
    
    // 使用次数显示
    this.useCountText = this.add.text(centerX, 550, '技能使用次数：0', {
      fontSize: '16px',
      color: '#ffeb3b'
    });
    this.useCountText.setOrigin(0.5);
    
    // 状态显示
    this.statusText = this.add.text(centerX, 520, '状态：就绪', {
      fontSize: '16px',
      color: '#4CAF50'
    });
    this.statusText.setOrigin(0.5);
    
    // 监听鼠标点击
    this.input.on('pointerdown', (pointer) => {
      this.handleSkillClick(pointer, centerX, centerY, skillRadius);
    });
    
    // 存储技能中心坐标
    this.skillCenter = { x: centerX, y: centerY, radius: skillRadius };
  }

  drawSkillIcon(x, y) {
    // 绘制闪电图标
    this.skillIcon.lineStyle(6, 0xFFEB3B, 1);
    this.skillIcon.beginPath();
    this.skillIcon.moveTo(x + 5, y - 30);
    this.skillIcon.lineTo(x - 10, y);
    this.skillIcon.lineTo(x + 5, y);
    this.skillIcon.lineTo(x - 5, y + 30);
    this.skillIcon.strokePath();
    this.skillIcon.setDepth(2);
  }

  handleSkillClick(pointer, centerX, centerY, radius) {
    // 检查点击是否在技能按钮范围内
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, centerX, centerY);
    
    if (distance <= radius) {
      if (!this.skillCooldown) {
        // 释放技能
        this.useSkill();
      } else {
        // 冷却中，显示提示
        this.showCooldownHint();
      }
    }
  }

  useSkill() {
    this.skillCooldown = true;
    this.skillUseCount++;
    
    const currentTime = Date.now();
    
    // 更新signals
    window.__signals__.skillUseCount = this.skillUseCount;
    window.__signals__.cooldownActive = true;
    window.__signals__.lastUseTime = currentTime;
    window.__signals__.events.push({
      type: 'skill_used',
      time: currentTime,
      count: this.skillUseCount
    });
    
    // 更新UI
    this.useCountText.setText(`技能使用次数：${this.skillUseCount}`);
    this.statusText.setText('状态：冷却中');
    this.statusText.setColor('#FF5722');
    
    // 技能效果动画（闪光）
    this.showSkillEffect();
    
    // 启动冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: 1500,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });
    
    console.log(`[Skill] Used at ${currentTime}, Count: ${this.skillUseCount}`);
  }

  showSkillEffect() {
    // 创建技能释放特效
    const effect = this.add.graphics();
    effect.lineStyle(4, 0xFFEB3B, 1);
    effect.strokeCircle(this.skillCenter.x, this.skillCenter.y, this.skillCenter.radius);
    effect.setDepth(10);
    
    // 扩散动画
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  showCooldownHint() {
    // 抖动效果提示冷却中
    this.tweens.add({
      targets: [this.cooldownMask, this.cooldownText],
      x: '+=5',
      duration: 50,
      yoyo: true,
      repeat: 2
    });
  }

  onCooldownComplete() {
    this.skillCooldown = false;
    this.cooldownTimer = null;
    
    // 更新signals
    window.__signals__.cooldownActive = false;
    window.__signals__.cooldownProgress = 0;
    window.__signals__.events.push({
      type: 'cooldown_complete',
      time: Date.now()
    });
    
    // 更新UI
    this.statusText.setText('状态：就绪');
    this.statusText.setColor('#4CAF50');
    
    // 清除冷却遮罩和进度条
    this.cooldownMask.clear();
    this.progressBar.clear();
    this.cooldownText.setText('');
    
    console.log('[Skill] Cooldown complete');
  }

  update(time, delta) {
    if (this.skillCooldown && this.cooldownTimer) {
      // 计算冷却进度
      const progress = this.cooldownTimer.getProgress();
      const remaining = this.cooldownTimer.getRemaining();
      
      // 更新signals
      window.__signals__.cooldownProgress = progress;
      
      // 绘制灰色遮罩（扇形，从上方顺时针减少）
      this.drawCooldownMask(progress);
      
      // 绘制进度条
      this.drawProgressBar(progress);
      
      // 更新冷却时间文本
      const remainingSeconds = (remaining / 1000).toFixed(1);
      this.cooldownText.setText(`${remainingSeconds}s`);
    }
  }

  drawCooldownMask(progress) {
    this.cooldownMask.clear();
    
    const centerX = this.skillCenter.x;
    const centerY = this.skillCenter.y;
    const radius = this.skillCenter.radius;
    
    // 绘制灰色半透明遮罩（扇形）
    this.cooldownMask.fillStyle(0x000000, 0.6);
    this.cooldownMask.beginPath();
    this.cooldownMask.moveTo(centerX, centerY);
    
    // 从顶部(-90度)开始，顺时针绘制剩余部分
    const startAngle = -Math.PI / 2; // -90度
    const endAngle = startAngle + (1 - progress) * Math.PI * 2; // 剩余角度
    
    this.cooldownMask.arc(centerX, centerY, radius, startAngle, endAngle, false);
    this.cooldownMask.lineTo(centerX, centerY);
    this.cooldownMask.closePath();
    this.cooldownMask.fillPath();
    
    // 绘制边框
    this.cooldownMask.lineStyle(2, 0x666666, 0.8);
    this.cooldownMask.strokeCircle(centerX, centerY, radius);
  }

  drawProgressBar(progress) {
    this.progressBar.clear();
    
    const barX = this.skillCenter.x - 80;
    const barY = this.skillCenter.y + 100;
    const barWidth = 160;
    const barHeight = 20;
    
    // 绘制进度（从右到左减少）
    const currentWidth = barWidth * (1 - progress);
    
    // 根据进度改变颜色
    let color;
    if (progress < 0.33) {
      color = 0xFF5722; // 红色
    } else if (progress < 0.66) {
      color = 0xFF9800; // 橙色
    } else {
      color = 0xFFC107; // 黄色
    }
    
    this.progressBar.fillStyle(color, 1);
    this.progressBar.fillRect(barX, barY, currentWidth, barHeight);
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

// 启动游戏
const game = new Phaser.Game(config);

// 输出验证信息
console.log('[Game] Skill Cooldown System initialized');
console.log('[Signals] Access window.__signals__ for verification');