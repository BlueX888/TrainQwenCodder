const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  skillUsed: 0,
  isCooldown: false,
  cooldownProgress: 0,
  lastSkillTime: 0
};

let skillButton;
let cooldownMask;
let cooldownText;
let statusText;
let isCooldown = false;
let cooldownTimer = null;
let cooldownStartTime = 0;
const COOLDOWN_DURATION = 500; // 0.5秒（毫秒）

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建技能按钮（红色圆形）
  const buttonX = 400;
  const buttonY = 300;
  const buttonRadius = 60;
  
  skillButton = this.add.graphics();
  skillButton.fillStyle(0xff0000, 1);
  skillButton.fillCircle(buttonX, buttonY, buttonRadius);
  skillButton.lineStyle(4, 0xffffff, 1);
  skillButton.strokeCircle(buttonX, buttonY, buttonRadius);
  
  // 创建冷却遮罩（初始不可见）
  cooldownMask = this.add.graphics();
  cooldownMask.setDepth(1);
  
  // 创建技能文本
  const skillText = this.add.text(buttonX, buttonY, '技能', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  skillText.setOrigin(0.5);
  skillText.setDepth(2);
  
  // 创建冷却时间文本
  cooldownText = this.add.text(buttonX, buttonY + 30, '', {
    fontSize: '18px',
    color: '#ffff00',
    fontStyle: 'bold'
  });
  cooldownText.setOrigin(0.5);
  cooldownText.setDepth(2);
  cooldownText.setVisible(false);
  
  // 创建状态文本
  statusText = this.add.text(400, 100, '点击红色按钮释放技能\n冷却时间: 0.5秒', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  // 创建使用次数文本
  const usageText = this.add.text(400, 500, '技能使用次数: 0', {
    fontSize: '18px',
    color: '#00ff00'
  });
  usageText.setOrigin(0.5);
  usageText.setName('usageText');
  
  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    // 检查是否点击在技能按钮范围内
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y, 
      buttonX, buttonY
    );
    
    if (distance <= buttonRadius) {
      useSkill(scene, buttonX, buttonY, buttonRadius);
    }
  });
  
  // 添加提示文本
  this.add.text(400, 550, '提示: 点击红色圆形按钮释放技能', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function useSkill(scene, buttonX, buttonY, buttonRadius) {
  // 如果正在冷却中，不允许使用技能
  if (isCooldown) {
    console.log('技能冷却中，无法使用');
    return;
  }
  
  // 释放技能
  isCooldown = true;
  cooldownStartTime = scene.time.now;
  window.__signals__.skillUsed++;
  window.__signals__.isCooldown = true;
  window.__signals__.lastSkillTime = cooldownStartTime;
  
  console.log(`技能释放！第 ${window.__signals__.skillUsed} 次使用`);
  
  // 更新使用次数显示
  const usageText = scene.children.getByName('usageText');
  if (usageText) {
    usageText.setText(`技能使用次数: ${window.__signals__.skillUsed}`);
  }
  
  // 显示冷却文本
  cooldownText.setVisible(true);
  
  // 创建技能释放特效（红色波纹）
  const effectGraphics = scene.add.graphics();
  effectGraphics.lineStyle(3, 0xff0000, 1);
  effectGraphics.strokeCircle(buttonX, buttonY, buttonRadius);
  
  // 波纹扩散动画
  scene.tweens.add({
    targets: effectGraphics,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    duration: 400,
    ease: 'Power2',
    onComplete: () => {
      effectGraphics.destroy();
    }
  });
  
  // 设置冷却计时器
  cooldownTimer = scene.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: () => {
      // 冷却结束
      isCooldown = false;
      cooldownText.setVisible(false);
      window.__signals__.isCooldown = false;
      window.__signals__.cooldownProgress = 0;
      console.log('技能冷却完成，可以再次使用');
    },
    callbackScope: scene
  });
}

function update(time, delta) {
  // 更新冷却遮罩
  if (isCooldown && cooldownTimer) {
    const elapsed = time - cooldownStartTime;
    const progress = Math.min(elapsed / COOLDOWN_DURATION, 1);
    const remainingProgress = 1 - progress;
    
    // 更新信号
    window.__signals__.cooldownProgress = progress;
    
    // 清除之前的绘制
    cooldownMask.clear();
    
    if (remainingProgress > 0) {
      // 绘制冷却遮罩（扇形，从顶部顺时针减少）
      const buttonX = 400;
      const buttonY = 300;
      const buttonRadius = 60;
      const startAngle = -90; // 从顶部开始
      const endAngle = startAngle + (360 * remainingProgress);
      
      cooldownMask.fillStyle(0x000000, 0.6);
      cooldownMask.beginPath();
      cooldownMask.moveTo(buttonX, buttonY);
      cooldownMask.arc(
        buttonX, buttonY, 
        buttonRadius, 
        Phaser.Math.DegToRad(startAngle),
        Phaser.Math.DegToRad(endAngle),
        false
      );
      cooldownMask.lineTo(buttonX, buttonY);
      cooldownMask.closePath();
      cooldownMask.fillPath();
      
      // 更新冷却时间文本
      const remainingTime = ((COOLDOWN_DURATION - elapsed) / 1000).toFixed(2);
      cooldownText.setText(`${remainingTime}s`);
    } else {
      cooldownMask.clear();
    }
  } else {
    // 确保冷却遮罩被清除
    if (cooldownMask) {
      cooldownMask.clear();
    }
  }
}

new Phaser.Game(config);