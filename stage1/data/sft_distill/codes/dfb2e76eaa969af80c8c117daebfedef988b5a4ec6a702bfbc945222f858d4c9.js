const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量用于验证
let dashCount = 0;
let canDash = true;
let player;
let dashCooldownText;
let dashCountText;
let cooldownTimer = null;
let dashDuration = 200; // 冲刺持续时间（毫秒）
let dashSpeed = 480; // 160 * 3
let isDashing = false;

function preload() {
  // 创建红色方块纹理作为玩家
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.9);
  
  // 添加状态显示文本
  dashCountText = this.add.text(16, 16, 'Dash Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  dashCooldownText = this.add.text(16, 46, 'Status: Ready', {
    fontSize: '20px',
    fill: '#00ff00'
  });
  
  // 添加说明文本
  this.add.text(16, 76, 'Click Mouse to Dash', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
  
  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      performDash.call(this, pointer);
    }
  });
}

function performDash(pointer) {
  // 检查是否可以冲刺
  if (!canDash || isDashing) {
    return;
  }
  
  // 计算冲刺方向（从玩家到鼠标位置）
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return;
  
  // 归一化方向向量
  const dirX = dx / distance;
  const dirY = dy / distance;
  
  // 设置冲刺速度
  player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);
  
  // 更新状态
  isDashing = true;
  canDash = false;
  dashCount++;
  
  // 更新显示
  dashCountText.setText('Dash Count: ' + dashCount);
  dashCooldownText.setText('Status: Dashing');
  dashCooldownText.setColor('#ffff00');
  
  // 冲刺持续一小段时间后恢复正常
  this.time.delayedCall(dashDuration, () => {
    isDashing = false;
    player.setVelocity(0, 0);
    dashCooldownText.setText('Status: Cooldown');
    dashCooldownText.setColor('#ff0000');
  });
  
  // 2秒冷却
  if (cooldownTimer) {
    cooldownTimer.destroy();
  }
  
  cooldownTimer = this.time.addEvent({
    delay: 2000,
    callback: () => {
      canDash = true;
      dashCooldownText.setText('Status: Ready');
      dashCooldownText.setColor('#00ff00');
      cooldownTimer = null;
    },
    callbackScope: this
  });
}

function update(time, delta) {
  // 如果不在冲刺状态，可以添加其他移动逻辑
  // 这里保持简单，只在冲刺时移动
}

const game = new Phaser.Game(config);