// 技能冷却系统 - 橙色技能按钮
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象，用于验证
window.__signals__ = {
  skillUsedCount: 0,
  isCooldown: false,
  cooldownProgress: 0,
  lastSkillTime: 0,
  logs: []
};

let skillButton;
let cooldownOverlay;
let cooldownText;
let progressBar;
let progressBarBg;
let statusText;
let instructionText;

let isCooldown = false;
let cooldownTimer = null;
let cooldownStartTime = 0;
const COOLDOWN_DURATION = 2000; // 2秒冷却时间

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建说明文字
  instructionText = this.add.text(400, 50, '点击鼠标左键释放橙色技能', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建状态显示文字
  statusText = this.add.text(400, 100, '技能就绪！', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 创建技能使用次数显示
  this.add.text(400, 140, '技能使用次数: 0', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5).setName('countText');
  
  // 创建技能按钮（橙色圆形）
  const buttonX = 400;
  const buttonY = 350;
  const buttonRadius = 80;
  
  skillButton = this.add.graphics();
  drawSkillButton(skillButton, buttonX, buttonY, buttonRadius, false);
  
  // 创建冷却遮罩层
  cooldownOverlay = this.add.graphics();
  cooldownOverlay.setDepth(1);
  
  // 创建冷却文字
  cooldownText = this.add.text(buttonX, buttonY, '', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(2);
  
  // 创建进度条背景
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x333333, 1);
  progressBarBg.fillRect(250, 480, 300, 30);
  progressBarBg.lineStyle(2, 0xffffff, 1);
  progressBarBg.strokeRect(250, 480, 300, 30);
  
  // 创建进度条
  progressBar = this.add.graphics();
  progressBar.setDepth(1);
  
  // 进度条标签
  this.add.text(400, 465, '冷却进度', {
    fontSize: '16px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听鼠标点击事件
  this.input.on('pointerdown', function(pointer) {
    if (pointer.leftButtonDown()) {
      useSkill(scene, buttonX, buttonY);
    }
  });
  
  // 添加视觉反馈文字容器
  this.feedbackTexts = [];
}

function update(time, delta) {
  // 更新冷却进度
  if (isCooldown && cooldownTimer) {
    const elapsed = time - cooldownStartTime;
    const progress = Math.min(elapsed / COOLDOWN_DURATION, 1);
    const remaining = Math.max(COOLDOWN_DURATION - elapsed, 0);
    
    // 更新全局信号
    window.__signals__.cooldownProgress = progress;
    window.__signals__.isCooldown = remaining > 0;
    
    // 更新冷却遮罩（扇形效果）
    updateCooldownOverlay(progress);
    
    // 更新冷却文字
    cooldownText.setText((remaining / 1000).toFixed(1) + 's');
    
    // 更新进度条
    updateProgressBar(progress);
    
    // 冷却结束
    if (progress >= 1) {
      endCooldown();
    }
  }
}

function drawSkillButton(graphics, x, y, radius, isDisabled) {
  graphics.clear();
  
  // 绘制外圈光晕
  graphics.fillStyle(isDisabled ? 0x666666 : 0xff8800, 0.3);
  graphics.fillCircle(x, y, radius + 10);
  
  // 绘制主按钮
  graphics.fillStyle(isDisabled ? 0x555555 : 0xff6600, 1);
  graphics.fillCircle(x, y, radius);
  
  // 绘制高光
  graphics.fillStyle(0xffaa44, 0.5);
  graphics.fillCircle(x - 20, y - 20, radius * 0.3);
  
  // 绘制边框
  graphics.lineStyle(4, isDisabled ? 0x333333 : 0xff9933, 1);
  graphics.strokeCircle(x, y, radius);
  
  // 绘制技能图标（闪电符号）
  graphics.lineStyle(8, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(x + 10, y - 30);
  graphics.lineTo(x - 10, y);
  graphics.lineTo(x + 5, y);
  graphics.lineTo(x - 10, y + 30);
  graphics.strokePath();
}

function updateCooldownOverlay(progress) {
  cooldownOverlay.clear();
  
  if (progress < 1) {
    const buttonX = 400;
    const buttonY = 350;
    const radius = 80;
    
    // 绘制扇形遮罩（从顶部顺时针）
    const startAngle = -Math.PI / 2; // 从顶部开始
    const endAngle = startAngle + (2 * Math.PI * (1 - progress));
    
    cooldownOverlay.fillStyle(0x000000, 0.6);
    cooldownOverlay.slice(buttonX, buttonY, radius, startAngle, endAngle, false);
    cooldownOverlay.fillPath();
  }
}

function updateProgressBar(progress) {
  progressBar.clear();
  
  // 根据进度改变颜色（红->黄->绿）
  let color;
  if (progress < 0.5) {
    color = 0xff0000; // 红色
  } else if (progress < 0.8) {
    color = 0xffaa00; // 橙色
  } else {
    color = 0x00ff00; // 绿色
  }
  
  progressBar.fillStyle(color, 1);
  progressBar.fillRect(250, 480, 300 * progress, 30);
}

function useSkill(scene, buttonX, buttonY) {
  if (isCooldown) {
    // 技能冷却中，显示提示
    statusText.setText('技能冷却中，请稍候！').setColor('#ff0000');
    
    // 抖动效果
    scene.tweens.add({
      targets: skillButton,
      x: '+=5',
      duration: 50,
      yoyo: true,
      repeat: 3
    });
    
    window.__signals__.logs.push({
      time: Date.now(),
      action: 'skill_on_cooldown',
      message: 'Attempted to use skill during cooldown'
    });
    
    return;
  }
  
  // 释放技能
  window.__signals__.skillUsedCount++;
  window.__signals__.lastSkillTime = Date.now();
  
  // 更新计数显示
  const countText = scene.children.getByName('countText');
  if (countText) {
    countText.setText('技能使用次数: ' + window.__signals__.skillUsedCount);
  }
  
  // 技能释放特效
  createSkillEffect(scene, buttonX, buttonY);
  
  // 开始冷却
  startCooldown(scene);
  
  // 记录日志
  window.__signals__.logs.push({
    time: Date.now(),
    action: 'skill_used',
    count: window.__signals__.skillUsedCount,
    message: 'Skill activated successfully'
  });
  
  console.log('技能释放！冷却开始...', {
    count: window.__signals__.skillUsedCount,
    cooldown: COOLDOWN_DURATION + 'ms'
  });
}

function createSkillEffect(scene, x, y) {
  // 创建橙色爆炸特效
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const speed = 200 + Math.random() * 100;
    
    const particle = scene.add.graphics();
    particle.fillStyle(0xff6600, 1);
    particle.fillCircle(0, 0, 5);
    particle.setPosition(x, y);
    
    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * speed,
      y: y + Math.sin(angle) * speed,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => particle.destroy()
    });
  }
  
  // 中心闪光
  const flash = scene.add.graphics();
  flash.fillStyle(0xffff00, 0.8);
  flash.fillCircle(x, y, 100);
  
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scaleX: 2,
    scaleY: 2,
    duration: 400,
    ease: 'Cubic.easeOut',
    onComplete: () => flash.destroy()
  });
  
  // 显示技能文字
  const skillText = scene.add.text(x, y - 150, '橙色技能释放！', {
    fontSize: '28px',
    color: '#ff6600',
    fontStyle: 'bold',
    stroke: '#ffffff',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  scene.tweens.add({
    targets: skillText,
    y: y - 200,
    alpha: 0,
    duration: 1000,
    ease: 'Cubic.easeOut',
    onComplete: () => skillText.destroy()
  });
}

function startCooldown(scene) {
  isCooldown = true;
  cooldownStartTime = scene.time.now;
  window.__signals__.isCooldown = true;
  
  // 更新按钮状态
  drawSkillButton(skillButton, 400, 350, 80, true);
  
  // 更新状态文字
  statusText.setText('技能冷却中...').setColor('#ff6600');
  
  // 创建计时器（作为备份，主要使用update更新）
  cooldownTimer = scene.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: () => {
      endCooldown();
    }
  });
}

function endCooldown() {
  isCooldown = false;
  window.__signals__.isCooldown = false;
  window.__signals__.cooldownProgress = 1;
  
  if (cooldownTimer) {
    cooldownTimer.destroy();
    cooldownTimer = null;
  }
  
  // 恢复按钮状态
  drawSkillButton(skillButton, 400, 350, 80, false);
  
  // 清除冷却显示
  cooldownOverlay.clear();
  cooldownText.setText('');
  
  // 更新状态文字
  statusText.setText('技能就绪！').setColor('#00ff00');
  
  // 进度条变为绿色
  updateProgressBar(1);
  
  // 记录日志
  window.__signals__.logs.push({
    time: Date.now(),
    action: 'cooldown_ended',
    message: 'Skill is ready to use again'
  });
  
  console.log('冷却结束！技能就绪');
}

// 启动游戏
new Phaser.Game(config);