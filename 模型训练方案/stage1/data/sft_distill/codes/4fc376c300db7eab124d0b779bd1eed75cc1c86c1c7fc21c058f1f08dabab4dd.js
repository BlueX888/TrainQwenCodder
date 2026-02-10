const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局可验证信号
window.__signals__ = {
  skillUsedCount: 0,
  isOnCooldown: false,
  cooldownProgress: 0,
  logs: []
};

let skillButton;
let cooldownOverlay;
let cooldownText;
let cooldownTimer = null;
let isOnCooldown = false;
let cooldownProgress = 0;
const COOLDOWN_DURATION = 500; // 0.5秒 = 500毫秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文本
  this.add.text(400, 50, '红色技能冷却系统', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  this.add.text(400, 100, '点击鼠标左键释放技能（冷却0.5秒）', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
  
  // 创建技能按钮（红色圆形）
  const buttonX = 400;
  const buttonY = 300;
  const buttonRadius = 80;
  
  // 绘制技能按钮底层
  const buttonGraphics = this.add.graphics();
  buttonGraphics.fillStyle(0xff0000, 1);
  buttonGraphics.fillCircle(buttonX, buttonY, buttonRadius);
  buttonGraphics.lineStyle(4, 0xffffff, 1);
  buttonGraphics.strokeCircle(buttonX, buttonY, buttonRadius);
  
  // 添加技能图标（简单的闪电符号）
  const iconGraphics = this.add.graphics();
  iconGraphics.lineStyle(8, 0xffff00, 1);
  iconGraphics.beginPath();
  iconGraphics.moveTo(buttonX - 20, buttonY - 30);
  iconGraphics.lineTo(buttonX + 10, buttonY - 5);
  iconGraphics.lineTo(buttonX - 5, buttonY);
  iconGraphics.lineTo(buttonX + 20, buttonY + 30);
  iconGraphics.strokePath();
  
  // 创建冷却遮罩（扇形）
  cooldownOverlay = this.add.graphics();
  
  // 冷却进度文本
  cooldownText = this.add.text(buttonX, buttonY + 120, '', {
    fontSize: '24px',
    color: '#ff6666',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 状态文本
  const statusText = this.add.text(400, 450, '状态: 就绪', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  const countText = this.add.text(400, 490, '技能使用次数: 0', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      // 检查是否在冷却中
      if (isOnCooldown) {
        console.log('技能冷却中，无法使用');
        logEvent('技能使用失败 - 冷却中');
        return;
      }
      
      // 释放技能
      releaseSkill(scene, statusText, countText, buttonX, buttonY);
    }
  });
  
  // 技能释放函数
  function releaseSkill(scene, statusText, countText, x, y) {
    // 更新计数
    window.__signals__.skillUsedCount++;
    isOnCooldown = true;
    window.__signals__.isOnCooldown = true;
    cooldownProgress = 0;
    
    // 更新UI
    statusText.setText('状态: 冷却中');
    statusText.setColor('#ff0000');
    countText.setText(`技能使用次数: ${window.__signals__.skillUsedCount}`);
    
    // 技能效果：创建扩散圆环
    const effectGraphics = scene.add.graphics();
    let effectRadius = buttonRadius;
    const maxRadius = 150;
    
    scene.tweens.add({
      targets: { radius: effectRadius },
      radius: maxRadius,
      duration: 300,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = tween.getValue();
        effectGraphics.clear();
        effectGraphics.lineStyle(6, 0xff0000, 1 - tween.progress);
        effectGraphics.strokeCircle(x, y, value);
      },
      onComplete: () => {
        effectGraphics.destroy();
      }
    });
    
    logEvent(`技能释放成功 - 第${window.__signals__.skillUsedCount}次`);
    
    // 启动冷却计时器
    if (cooldownTimer) {
      cooldownTimer.destroy();
    }
    
    cooldownTimer = scene.time.addEvent({
      delay: COOLDOWN_DURATION,
      callback: () => {
        // 冷却结束
        isOnCooldown = false;
        window.__signals__.isOnCooldown = false;
        cooldownProgress = 1;
        window.__signals__.cooldownProgress = 1;
        
        statusText.setText('状态: 就绪');
        statusText.setColor('#00ff00');
        cooldownText.setText('');
        
        logEvent('技能冷却完成');
      },
      callbackScope: scene
    });
  }
  
  // 日志记录函数
  function logEvent(message) {
    const log = {
      timestamp: Date.now(),
      message: message,
      cooldownState: isOnCooldown,
      usedCount: window.__signals__.skillUsedCount
    };
    window.__signals__.logs.push(log);
    console.log(JSON.stringify(log));
  }
}

function update(time, delta) {
  // 更新冷却进度
  if (isOnCooldown && cooldownTimer) {
    const elapsed = cooldownTimer.getElapsed();
    cooldownProgress = Math.min(elapsed / COOLDOWN_DURATION, 1);
    window.__signals__.cooldownProgress = cooldownProgress;
    
    // 绘制冷却遮罩（扇形从上方顺时针减少）
    cooldownOverlay.clear();
    
    if (cooldownProgress < 1) {
      const buttonX = 400;
      const buttonY = 300;
      const buttonRadius = 80;
      
      // 绘制半透明黑色扇形遮罩
      const remainingAngle = (1 - cooldownProgress) * 360;
      
      cooldownOverlay.fillStyle(0x000000, 0.7);
      cooldownOverlay.slice(
        buttonX, 
        buttonY, 
        buttonRadius, 
        Phaser.Math.DegToRad(-90), // 从顶部开始
        Phaser.Math.DegToRad(-90 + remainingAngle), // 顺时针
        false
      );
      cooldownOverlay.fillPath();
      
      // 显示剩余时间
      const remainingTime = ((1 - cooldownProgress) * COOLDOWN_DURATION / 1000).toFixed(2);
      cooldownText.setText(`${remainingTime}s`);
    } else {
      cooldownOverlay.clear();
    }
  }
}

new Phaser.Game(config);