const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  skillUsedCount: 0,
  isOnCooldown: false,
  cooldownProgress: 0,
  lastUseTime: 0,
  logs: []
};

let skillButton;
let cooldownMask;
let cooldownText;
let cooldownTimer = null;
let cooldownStartTime = 0;
let isOnCooldown = false;
const COOLDOWN_DURATION = 2000; // 2秒冷却

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文字
  const title = this.add.text(400, 50, '橙色技能冷却系统', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建说明文字
  const instruction = this.add.text(400, 100, '点击鼠标左键释放技能（冷却时间：2秒）', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
  
  // 创建技能按钮（橙色圆形）
  const buttonX = 400;
  const buttonY = 300;
  const buttonRadius = 60;
  
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillCircle(buttonX, buttonY, buttonRadius);
  graphics.lineStyle(4, 0xffaa44, 1);
  graphics.strokeCircle(buttonX, buttonY, buttonRadius);
  
  // 创建技能图标（闪电符号）
  const iconGraphics = this.add.graphics();
  iconGraphics.lineStyle(6, 0xffffff, 1);
  iconGraphics.beginPath();
  iconGraphics.moveTo(buttonX - 10, buttonY - 20);
  iconGraphics.lineTo(buttonX + 5, buttonY);
  iconGraphics.lineTo(buttonX - 5, buttonY);
  iconGraphics.lineTo(buttonX + 10, buttonY + 20);
  iconGraphics.strokePath();
  
  // 创建冷却遮罩（灰色半透明圆形）
  cooldownMask = this.add.graphics();
  cooldownMask.setVisible(false);
  
  // 创建冷却进度文字
  cooldownText = this.add.text(buttonX, buttonY + buttonRadius + 30, '', {
    fontSize: '20px',
    color: '#ff8800',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建使用次数显示
  const usageText = this.add.text(400, 450, '技能使用次数: 0', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建状态显示
  const statusText = this.add.text(400, 500, '状态: 就绪', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      // 检查是否点击在技能按钮范围内
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y, buttonX, buttonY
      );
      
      if (distance <= buttonRadius && !isOnCooldown) {
        // 释放技能
        useSkill(scene, buttonX, buttonY, buttonRadius);
        
        // 更新显示
        window.__signals__.skillUsedCount++;
        usageText.setText(`技能使用次数: ${window.__signals__.skillUsedCount}`);
        statusText.setText('状态: 冷却中...');
        statusText.setColor('#ff0000');
        
        // 记录日志
        const logEntry = {
          time: Date.now(),
          action: 'skill_used',
          cooldownRemaining: COOLDOWN_DURATION
        };
        window.__signals__.logs.push(logEntry);
        console.log('Skill Used:', logEntry);
      }
    }
  });
  
  // 保存引用供 update 使用
  this.usageText = usageText;
  this.statusText = statusText;
  this.buttonX = buttonX;
  this.buttonY = buttonY;
  this.buttonRadius = buttonRadius;
}

function useSkill(scene, x, y, radius) {
  // 设置冷却状态
  isOnCooldown = true;
  cooldownStartTime = scene.time.now;
  window.__signals__.isOnCooldown = true;
  window.__signals__.lastUseTime = cooldownStartTime;
  
  // 创建技能释放特效（扩散圆环）
  const effectGraphics = scene.add.graphics();
  effectGraphics.lineStyle(4, 0xff8800, 1);
  
  scene.tweens.add({
    targets: { radius: radius },
    radius: radius * 2,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onUpdate: function(tween) {
      const value = tween.getValue();
      effectGraphics.clear();
      effectGraphics.lineStyle(4, 0xff8800, 1 - tween.progress);
      effectGraphics.strokeCircle(x, y, value);
    },
    onComplete: function() {
      effectGraphics.destroy();
    }
  });
  
  // 显示冷却遮罩
  cooldownMask.setVisible(true);
  
  // 移除之前的计时器（如果存在）
  if (cooldownTimer) {
    cooldownTimer.remove();
  }
  
  // 创建冷却计时器
  cooldownTimer = scene.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: () => {
      // 冷却结束
      isOnCooldown = false;
      cooldownMask.setVisible(false);
      cooldownText.setText('');
      window.__signals__.isOnCooldown = false;
      window.__signals__.cooldownProgress = 0;
      
      scene.statusText.setText('状态: 就绪');
      scene.statusText.setColor('#00ff00');
      
      // 记录日志
      const logEntry = {
        time: Date.now(),
        action: 'cooldown_complete',
        totalCooldownTime: COOLDOWN_DURATION
      };
      window.__signals__.logs.push(logEntry);
      console.log('Cooldown Complete:', logEntry);
    },
    loop: false
  });
}

function update(time, delta) {
  if (isOnCooldown) {
    // 计算冷却进度
    const elapsed = time - cooldownStartTime;
    const progress = Math.min(elapsed / COOLDOWN_DURATION, 1);
    const remaining = Math.max(COOLDOWN_DURATION - elapsed, 0);
    
    window.__signals__.cooldownProgress = progress;
    
    // 更新冷却遮罩（扇形遮罩）
    cooldownMask.clear();
    cooldownMask.fillStyle(0x000000, 0.6);
    
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (2 * Math.PI * (1 - progress));
    
    cooldownMask.beginPath();
    cooldownMask.moveTo(this.buttonX, this.buttonY);
    cooldownMask.arc(
      this.buttonX, 
      this.buttonY, 
      this.buttonRadius, 
      startAngle, 
      endAngle, 
      false
    );
    cooldownMask.closePath();
    cooldownMask.fillPath();
    
    // 更新冷却时间文字
    cooldownText.setText(`冷却: ${(remaining / 1000).toFixed(1)}s`);
    
    // 添加进度百分比显示
    if (!this.progressText) {
      this.progressText = this.add.text(this.buttonX, this.buttonY + this.buttonRadius + 60, '', {
        fontSize: '16px',
        color: '#ffaa44'
      }).setOrigin(0.5);
    }
    this.progressText.setText(`进度: ${(progress * 100).toFixed(0)}%`);
  } else {
    // 清除进度文字
    if (this.progressText) {
      this.progressText.setText('');
    }
  }
}

new Phaser.Game(config);