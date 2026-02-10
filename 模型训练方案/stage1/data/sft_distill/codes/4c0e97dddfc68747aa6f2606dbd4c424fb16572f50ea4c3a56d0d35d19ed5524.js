const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let skillButton;
let cooldownBar;
let cooldownBarBg;
let cooldownOverlay;
let statusText;
let skillUsedCountText;

let isOnCooldown = false;
let cooldownTimer = null;
let cooldownStartTime = 0;
let cooldownDuration = 500; // 0.5秒 = 500毫秒

let skillUsedCount = 0; // 可验证的状态信号

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.game.config.width / 2;
  const centerY = this.game.config.height / 2;

  // 创建标题文本
  const titleText = this.add.text(centerX, 50, '粉色技能冷却系统', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 创建技能按钮（粉色圆形）
  const buttonGraphics = this.add.graphics();
  buttonGraphics.fillStyle(0xff69b4, 1); // 粉色
  buttonGraphics.fillCircle(0, 0, 60);
  buttonGraphics.lineStyle(4, 0xffffff, 1);
  buttonGraphics.strokeCircle(0, 0, 60);
  buttonGraphics.x = centerX;
  buttonGraphics.y = centerY;
  skillButton = buttonGraphics;

  // 创建技能图标（内部的星形）
  const iconGraphics = this.add.graphics();
  iconGraphics.fillStyle(0xffffff, 1);
  iconGraphics.beginPath();
  const spikes = 5;
  const outerRadius = 30;
  const innerRadius = 15;
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      iconGraphics.moveTo(x, y);
    } else {
      iconGraphics.lineTo(x, y);
    }
  }
  iconGraphics.closePath();
  iconGraphics.fillPath();
  iconGraphics.x = centerX;
  iconGraphics.y = centerY;

  // 创建冷却遮罩（半透明黑色圆形）
  const overlayGraphics = this.add.graphics();
  overlayGraphics.fillStyle(0x000000, 0.7);
  overlayGraphics.fillCircle(0, 0, 60);
  overlayGraphics.x = centerX;
  overlayGraphics.y = centerY;
  overlayGraphics.setVisible(false);
  cooldownOverlay = overlayGraphics;

  // 创建冷却进度条背景
  const barWidth = 300;
  const barHeight = 30;
  const barX = centerX - barWidth / 2;
  const barY = centerY + 120;

  const barBgGraphics = this.add.graphics();
  barBgGraphics.fillStyle(0x444444, 1);
  barBgGraphics.fillRoundedRect(barX, barY, barWidth, barHeight, 5);
  barBgGraphics.lineStyle(2, 0xffffff, 1);
  barBgGraphics.strokeRoundedRect(barX, barY, barWidth, barHeight, 5);
  cooldownBarBg = barBgGraphics;

  // 创建冷却进度条
  const barGraphics = this.add.graphics();
  cooldownBar = {
    graphics: barGraphics,
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    currentWidth: 0
  };

  // 创建状态文本
  statusText = this.add.text(centerX, centerY + 180, '按空格键释放技能', {
    fontSize: '24px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  statusText.setOrigin(0.5);

  // 创建技能使用次数文本
  skillUsedCountText = this.add.text(centerX, centerY + 220, '技能使用次数: 0', {
    fontSize: '20px',
    color: '#ffff00'
  });
  skillUsedCountText.setOrigin(0.5);

  // 创建说明文本
  const instructionText = this.add.text(centerX, 550, '按空格键释放技能 | 冷却时间: 0.5秒', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  instructionText.setOrigin(0.5);

  // 监听空格键
  this.input.keyboard.on('keydown-SPACE', () => {
    useSkill.call(this);
  });

  // 保存场景引用
  this.cooldownBar = cooldownBar;
  this.cooldownOverlay = cooldownOverlay;
  this.statusText = statusText;
  this.skillUsedCountText = skillUsedCountText;
}

function useSkill() {
  if (isOnCooldown) {
    // 技能在冷却中，不能使用
    return;
  }

  // 释放技能
  skillUsedCount++;
  skillUsedCountText.setText(`技能使用次数: ${skillUsedCount}`);

  // 创建技能释放特效（粉色波纹）
  const centerX = this.game.config.width / 2;
  const centerY = this.game.config.height / 2;

  const ripple = this.add.graphics();
  ripple.lineStyle(4, 0xff69b4, 1);
  ripple.strokeCircle(centerX, centerY, 60);

  this.tweens.add({
    targets: ripple,
    alpha: 0,
    scaleX: 2,
    scaleY: 2,
    duration: 300,
    onComplete: () => {
      ripple.destroy();
    }
  });

  // 开始冷却
  startCooldown.call(this);
}

function startCooldown() {
  isOnCooldown = true;
  cooldownStartTime = this.time.now;

  // 显示冷却遮罩
  cooldownOverlay.setVisible(true);

  // 更新状态文本
  statusText.setText('冷却中...');
  statusText.setColor('#ff0000');

  // 设置冷却计时器
  cooldownTimer = this.time.addEvent({
    delay: cooldownDuration,
    callback: () => {
      endCooldown.call(this);
    },
    callbackScope: this
  });
}

function endCooldown() {
  isOnCooldown = false;
  cooldownTimer = null;

  // 隐藏冷却遮罩
  cooldownOverlay.setVisible(false);

  // 更新状态文本
  statusText.setText('按空格键释放技能');
  statusText.setColor('#00ff00');

  // 重置进度条
  cooldownBar.currentWidth = 0;
  cooldownBar.graphics.clear();
}

function update(time, delta) {
  // 更新冷却进度条
  if (isOnCooldown && cooldownTimer) {
    const elapsed = time - cooldownStartTime;
    const progress = Math.min(elapsed / cooldownDuration, 1);

    // 计算进度条宽度（反向，从满到空）
    cooldownBar.currentWidth = cooldownBar.width * (1 - progress);

    // 重绘进度条
    cooldownBar.graphics.clear();
    if (cooldownBar.currentWidth > 0) {
      cooldownBar.graphics.fillStyle(0xff69b4, 1);
      cooldownBar.graphics.fillRoundedRect(
        cooldownBar.x,
        cooldownBar.y,
        cooldownBar.currentWidth,
        cooldownBar.height,
        5
      );
    }

    // 更新冷却文本显示剩余时间
    const remaining = Math.max(0, (cooldownDuration - elapsed) / 1000);
    statusText.setText(`冷却中... ${remaining.toFixed(2)}s`);
  }
}

new Phaser.Game(config);