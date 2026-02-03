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
  currentCooldown: 0,
  isOnCooldown: false,
  lastSkillTime: 0,
  events: []
};

let skillButton;
let cooldownOverlay;
let cooldownText;
let statusText;
let cooldownTimer = null;
let cooldownProgress = 0;
let isSkillReady = true;

const COOLDOWN_DURATION = 2000; // 2秒冷却时间
const BUTTON_SIZE = 80;
const BUTTON_X = 400;
const BUTTON_Y = 300;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建技能按钮背景（橙色圆形）
  skillButton = this.add.graphics();
  drawSkillButton(skillButton, 1);

  // 创建冷却遮罩层（半透明黑色）
  cooldownOverlay = this.add.graphics();
  cooldownOverlay.setDepth(1);

  // 创建冷却文本
  cooldownText = this.add.text(BUTTON_X, BUTTON_Y, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
  });
  cooldownText.setOrigin(0.5);
  cooldownText.setDepth(2);

  // 创建状态文本
  statusText = this.add.text(400, 100, '点击橙色按钮释放技能\n冷却时间: 2秒', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);

  // 创建使用次数显示
  const usageText = this.add.text(400, 500, '', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  usageText.setOrigin(0.5);
  usageText.setDepth(3);

  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      tryUseSkill.call(this, pointer);
    }
  });

  // 更新使用次数显示
  this.events.on('update', () => {
    usageText.setText(`技能使用次数: ${window.__signals__.skillUsedCount}`);
  });
}

function update(time, delta) {
  // 更新冷却进度
  if (!isSkillReady && cooldownTimer) {
    const elapsed = cooldownTimer.getElapsed();
    cooldownProgress = Math.min(elapsed / COOLDOWN_DURATION, 1);
    
    // 更新冷却遮罩
    drawCooldownOverlay(cooldownOverlay, cooldownProgress);
    
    // 更新冷却文本
    const remaining = Math.ceil((COOLDOWN_DURATION - elapsed) / 1000 * 10) / 10;
    cooldownText.setText(remaining > 0 ? remaining.toFixed(1) : '');
    
    // 更新全局信号
    window.__signals__.currentCooldown = remaining;
    window.__signals__.isOnCooldown = true;
  } else {
    window.__signals__.currentCooldown = 0;
    window.__signals__.isOnCooldown = false;
  }
}

function tryUseSkill(pointer) {
  // 检查是否点击在按钮范围内
  const dx = pointer.x - BUTTON_X;
  const dy = pointer.y - BUTTON_Y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > BUTTON_SIZE / 2) {
    return; // 点击位置不在按钮内
  }

  // 检查技能是否就绪
  if (!isSkillReady) {
    // 记录尝试使用但失败的事件
    window.__signals__.events.push({
      type: 'skill_attempt_failed',
      time: Date.now(),
      reason: 'on_cooldown'
    });
    return;
  }

  // 使用技能
  useSkill.call(this, pointer);
}

function useSkill(pointer) {
  isSkillReady = false;
  
  // 更新全局信号
  window.__signals__.skillUsedCount++;
  window.__signals__.lastSkillTime = Date.now();
  window.__signals__.events.push({
    type: 'skill_used',
    time: Date.now(),
    position: { x: pointer.x, y: pointer.y }
  });

  // 创建技能释放特效（橙色扩散圆圈）
  createSkillEffect.call(this, BUTTON_X, BUTTON_Y);

  // 启动冷却计时器
  cooldownTimer = this.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: onCooldownComplete,
    callbackScope: this
  });

  // 更新按钮外观（变暗）
  drawSkillButton(skillButton, 0.5);
}

function onCooldownComplete() {
  isSkillReady = true;
  cooldownProgress = 0;
  cooldownTimer = null;
  
  // 清除冷却显示
  cooldownOverlay.clear();
  cooldownText.setText('');
  
  // 恢复按钮外观
  drawSkillButton(skillButton, 1);
  
  // 记录冷却完成事件
  window.__signals__.events.push({
    type: 'cooldown_complete',
    time: Date.now()
  });
}

function drawSkillButton(graphics, alpha) {
  graphics.clear();
  graphics.fillStyle(0xff8800, alpha);
  graphics.fillCircle(BUTTON_X, BUTTON_Y, BUTTON_SIZE / 2);
  
  // 添加边框
  graphics.lineStyle(3, 0xffaa44, alpha);
  graphics.strokeCircle(BUTTON_X, BUTTON_Y, BUTTON_SIZE / 2);
}

function drawCooldownOverlay(graphics, progress) {
  graphics.clear();
  
  if (progress <= 0) return;
  
  // 绘制扇形遮罩（从顶部顺时针）
  const startAngle = -Math.PI / 2; // 从顶部开始
  const endAngle = startAngle + (1 - progress) * Math.PI * 2;
  
  graphics.fillStyle(0x000000, 0.6);
  graphics.beginPath();
  graphics.moveTo(BUTTON_X, BUTTON_Y);
  graphics.arc(BUTTON_X, BUTTON_Y, BUTTON_SIZE / 2, startAngle, endAngle, false);
  graphics.closePath();
  graphics.fillPath();
}

function createSkillEffect(x, y) {
  const effectGraphics = this.add.graphics();
  effectGraphics.setDepth(10);
  
  let radius = 0;
  const maxRadius = 150;
  const duration = 500;
  
  // 创建扩散动画
  this.tweens.add({
    targets: { value: 0 },
    value: 1,
    duration: duration,
    onUpdate: (tween) => {
      const progress = tween.getValue();
      radius = progress * maxRadius;
      const alpha = 1 - progress;
      
      effectGraphics.clear();
      effectGraphics.lineStyle(4, 0xff8800, alpha);
      effectGraphics.strokeCircle(x, y, radius);
      
      effectGraphics.lineStyle(2, 0xffaa44, alpha * 0.5);
      effectGraphics.strokeCircle(x, y, radius * 0.7);
    },
    onComplete: () => {
      effectGraphics.destroy();
    }
  });
}

new Phaser.Game(config);