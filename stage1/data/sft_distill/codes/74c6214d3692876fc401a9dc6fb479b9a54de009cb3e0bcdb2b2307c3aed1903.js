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

let player;
let cursors;
let canDash = true;
let isDashing = false;
let dashTimer;
let cooldownText;
let statusText;

// 状态验证变量
let dashCount = 0;
let cooldownRemaining = 0;

const NORMAL_SPEED = 200;
const DASH_SPEED = 200 * 3; // 600
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 2500; // 2.5秒冷却

function preload() {
  // 使用 Graphics 创建蓝色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建冲刺状态纹理（亮蓝色）
  const dashGraphics = this.add.graphics();
  dashGraphics.fillStyle(0x00ffff, 1);
  dashGraphics.fillCircle(16, 16, 16);
  dashGraphics.generateTexture('playerDash', 32, 32);
  dashGraphics.destroy();

  // 创建冷却状态纹理（灰蓝色）
  const cooldownGraphics = this.add.graphics();
  cooldownGraphics.fillStyle(0x4444aa, 1);
  cooldownGraphics.fillCircle(16, 16, 16);
  cooldownGraphics.generateTexture('playerCooldown', 32, 32);
  cooldownGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      performDash.call(this, pointer);
    }
  });

  // UI文本
  cooldownText = this.add.text(10, 10, 'Dash Ready', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  statusText = this.add.text(10, 40, 'Dash Count: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 说明文本
  this.add.text(10, 70, 'Arrow Keys: Move\nLeft Click: Dash', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 如果不在冲刺状态，允许正常移动
  if (!isDashing) {
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
      velocityX = -NORMAL_SPEED;
    } else if (cursors.right.isDown) {
      velocityX = NORMAL_SPEED;
    }

    if (cursors.up.isDown) {
      velocityY = -NORMAL_SPEED;
    } else if (cursors.down.isDown) {
      velocityY = NORMAL_SPEED;
    }

    player.setVelocity(velocityX, velocityY);
  }

  // 更新冷却显示
  if (!canDash && dashTimer) {
    cooldownRemaining = (dashTimer.getRemaining() / 1000).toFixed(1);
    cooldownText.setText(`Dash Cooldown: ${cooldownRemaining}s`);
    cooldownText.setColor('#ff6600');
  }
}

function performDash(pointer) {
  if (!canDash || isDashing) {
    return;
  }

  // 计算朝向鼠标的方向向量
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return;

  // 归一化方向向量并乘以冲刺速度
  const velocityX = (dx / distance) * DASH_SPEED;
  const velocityY = (dy / distance) * DASH_SPEED;

  // 开始冲刺
  isDashing = true;
  canDash = false;
  dashCount++;

  // 改变角色外观
  player.setTexture('playerDash');

  // 应用冲刺速度
  player.setVelocity(velocityX, velocityY);

  // 更新状态文本
  statusText.setText(`Dash Count: ${dashCount}`);

  // 冲刺持续时间结束后恢复正常
  this.time.delayedCall(DASH_DURATION, () => {
    isDashing = false;
    player.setVelocity(0, 0);
    player.setTexture('playerCooldown');
  });

  // 冷却计时器
  dashTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      player.setTexture('player');
      cooldownText.setText('Dash Ready');
      cooldownText.setColor('#00ff00');
      cooldownRemaining = 0;
    }
  });
}

new Phaser.Game(config);