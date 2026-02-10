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

// 游戏状态变量
let skillButton;
let cooldownMask;
let cooldownBar;
let cooldownText;
let statusText;
let isCooldown = false;
let cooldownTimer = null;
let skillUseCount = 0; // 可验证状态

const COOLDOWN_DURATION = 2500; // 2.5秒
const BUTTON_RADIUS = 60;
const BUTTON_X = 400;
const BUTTON_Y = 300;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建技能按钮背景（橙色圆形）
  const buttonBg = this.add.graphics();
  buttonBg.fillStyle(0xff8800, 1);
  buttonBg.fillCircle(BUTTON_X, BUTTON_Y, BUTTON_RADIUS);
  
  // 创建技能图标（简单的闪电符号）
  const icon = this.add.graphics();
  icon.lineStyle(8, 0xffffff, 1);
  icon.beginPath();
  icon.moveTo(BUTTON_X - 15, BUTTON_Y - 20);
  icon.lineTo(BUTTON_X + 5, BUTTON_Y);
  icon.lineTo(BUTTON_X - 5, BUTTON_Y);
  icon.lineTo(BUTTON_X + 15, BUTTON_Y + 20);
  icon.strokePath();
  
  // 创建冷却遮罩（灰色半透明圆形，初始隐藏）
  cooldownMask = this.add.graphics();
  cooldownMask.setVisible(false);
  
  // 创建冷却进度条（底部）
  const barBg = this.add.graphics();
  barBg.fillStyle(0x333333, 1);
  barBg.fillRoundedRect(BUTTON_X - 100, BUTTON_Y + 100, 200, 20, 10);
  
  cooldownBar = this.add.graphics();
  
  // 创建冷却文本
  cooldownText = this.add.text(BUTTON_X, BUTTON_Y + 110, '', {
    fontSize: '16px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建状态文本
  statusText = this.add.text(400, 50, '点击技能按钮释放技能\n技能使用次数: 0', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  // 创建说明文本
  this.add.text(400, 550, '按鼠标左键释放技能 | 冷却时间: 2.5秒', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
  
  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      handleSkillClick.call(this, pointer);
    }
  });
  
  // 添加悬停效果
  this.input.on('pointermove', (pointer) => {
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y, BUTTON_X, BUTTON_Y
    );
    
    if (distance <= BUTTON_RADIUS) {
      this.input.setDefaultCursor('pointer');
    } else {
      this.input.setDefaultCursor('default');
    }
  });
}

function handleSkillClick(pointer) {
  // 检查是否点击在技能按钮范围内
  const distance = Phaser.Math.Distance.Between(
    pointer.x, pointer.y, BUTTON_X, BUTTON_Y
  );
  
  if (distance > BUTTON_RADIUS) {
    return;
  }
  
  // 检查是否在冷却中
  if (isCooldown) {
    // 显示冷却中的反馈
    this.cameras.main.shake(100, 0.002);
    return;
  }
  
  // 释放技能
  activateSkill.call(this);
}

function activateSkill() {
  skillUseCount++;
  isCooldown = true;
  
  // 更新状态文本
  statusText.setText(`技能已释放！\n技能使用次数: ${skillUseCount}`);
  
  // 显示技能释放特效
  const flash = this.add.graphics();
  flash.fillStyle(0xffaa00, 0.8);
  flash.fillCircle(BUTTON_X, BUTTON_Y, BUTTON_RADIUS + 20);
  
  this.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 1.5,
    duration: 300,
    onComplete: () => flash.destroy()
  });
  
  // 显示冷却遮罩
  cooldownMask.setVisible(true);
  
  // 启动冷却计时器
  cooldownTimer = this.time.addEvent({
    delay: COOLDOWN_DURATION,
    callback: () => {
      // 冷却结束
      isCooldown = false;
      cooldownMask.setVisible(false);
      cooldownText.setText('');
      statusText.setText(`技能已就绪\n技能使用次数: ${skillUseCount}`);
      cooldownTimer = null;
    },
    callbackScope: this
  });
}

function update(time, delta) {
  if (isCooldown && cooldownTimer) {
    // 获取冷却进度 (0-1)
    const progress = cooldownTimer.getProgress();
    const remaining = cooldownTimer.getRemaining();
    
    // 更新冷却遮罩（扇形从上方顺时针消失）
    cooldownMask.clear();
    cooldownMask.fillStyle(0x000000, 0.6);
    
    // 绘制扇形遮罩（从-90度开始，顺时针）
    const startAngle = -Math.PI / 2; // -90度（12点方向）
    const endAngle = startAngle + (1 - progress) * Math.PI * 2;
    
    cooldownMask.beginPath();
    cooldownMask.moveTo(BUTTON_X, BUTTON_Y);
    cooldownMask.arc(BUTTON_X, BUTTON_Y, BUTTON_RADIUS, startAngle, endAngle, false);
    cooldownMask.lineTo(BUTTON_X, BUTTON_Y);
    cooldownMask.closePath();
    cooldownMask.fillPath();
    
    // 更新进度条
    cooldownBar.clear();
    cooldownBar.fillStyle(0xff8800, 1);
    const barWidth = 200 * progress;
    cooldownBar.fillRoundedRect(BUTTON_X - 100, BUTTON_Y + 100, barWidth, 20, 10);
    
    // 更新冷却文本
    const seconds = (remaining / 1000).toFixed(1);
    cooldownText.setText(`${seconds}s`);
  }
}

new Phaser.Game(config);