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

// 游戏状态变量
let player;
let cursors;
let spaceKey;
let isDashing = false;
let canDash = true;
let dashCooldownTimer = null;
let statusText;
let cooldownText;

// 状态信号变量（用于验证）
let dashCount = 0;
let totalDistance = 0;

const NORMAL_SPEED = 240;
const DASH_SPEED = 240 * 3; // 720
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 2500; // 冷却时间（毫秒）

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建黄色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.9);

  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 监听空格键按下事件
  spaceKey.on('down', () => {
    if (canDash && !isDashing) {
      performDash.call(this);
    }
  });

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  cooldownText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 550, '方向键移动 | 空格键冲刺', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function performDash() {
  if (!canDash || isDashing) return;

  isDashing = true;
  canDash = false;
  dashCount++;

  // 获取当前移动方向
  let dashVelocityX = 0;
  let dashVelocityY = 0;

  if (cursors.left.isDown) {
    dashVelocityX = -DASH_SPEED;
  } else if (cursors.right.isDown) {
    dashVelocityX = DASH_SPEED;
  }

  if (cursors.up.isDown) {
    dashVelocityY = -DASH_SPEED;
  } else if (cursors.down.isDown) {
    dashVelocityY = DASH_SPEED;
  }

  // 如果没有方向输入，默认向右冲刺
  if (dashVelocityX === 0 && dashVelocityY === 0) {
    dashVelocityX = DASH_SPEED;
  }

  // 归一化对角线速度
  if (dashVelocityX !== 0 && dashVelocityY !== 0) {
    const factor = Math.sqrt(2) / 2;
    dashVelocityX *= factor;
    dashVelocityY *= factor;
  }

  // 设置冲刺速度
  player.setVelocity(dashVelocityX, dashVelocityY);

  // 改变颜色表示冲刺状态
  player.setTint(0xff8800);

  // 冲刺持续时间计时器
  this.time.delayedCall(DASH_DURATION, () => {
    isDashing = false;
    player.clearTint();
    // 恢复正常移动
  });

  // 冷却计时器
  if (dashCooldownTimer) {
    dashCooldownTimer.destroy();
  }

  dashCooldownTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      dashCooldownTimer = null;
    }
  });
}

function update(time, delta) {
  // 普通移动（非冲刺状态）
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

    // 归一化对角线速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    player.setVelocity(velocityX, velocityY);
  }

  // 计算总移动距离
  const speed = Math.sqrt(player.body.velocity.x ** 2 + player.body.velocity.y ** 2);
  totalDistance += (speed * delta) / 1000;

  // 更新状态显示
  const currentSpeed = Math.round(speed);
  const dashStatus = isDashing ? '冲刺中!' : (canDash ? '准备就绪' : '冷却中');
  
  statusText.setText([
    `冲刺次数: ${dashCount}`,
    `当前速度: ${currentSpeed}`,
    `状态: ${dashStatus}`,
    `总距离: ${Math.round(totalDistance)}px`
  ]);

  // 显示冷却进度
  if (dashCooldownTimer && !canDash) {
    const progress = dashCooldownTimer.getProgress();
    const remaining = ((1 - progress) * DASH_COOLDOWN / 1000).toFixed(1);
    cooldownText.setText(`冷却剩余: ${remaining}秒`);
    cooldownText.setVisible(true);
  } else {
    cooldownText.setVisible(false);
  }
}

new Phaser.Game(config);