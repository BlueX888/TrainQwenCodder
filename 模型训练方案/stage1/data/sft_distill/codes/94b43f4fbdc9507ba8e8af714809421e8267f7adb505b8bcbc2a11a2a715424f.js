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

// 状态信号变量
let dashCount = 0; // 冲刺次数
let canDash = true; // 是否可以冲刺
let cooldownRemaining = 0; // 剩余冷却时间

let player;
let cursors;
let dashSpeed = 200 * 3; // 冲刺速度 600
let normalSpeed = 200; // 正常速度
let dashDuration = 200; // 冲刺持续时间(毫秒)
let dashCooldown = 2000; // 冷却时间2秒
let isDashing = false;
let statusText;
let cooldownTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建绿色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 监听鼠标右键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      performDash.call(this, pointer);
    }
  });

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update(time, delta) {
  // 如果正在冲刺，不处理正常移动
  if (isDashing) {
    return;
  }

  // 正常移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-normalSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(normalSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-normalSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(normalSpeed);
  }

  // 更新冷却时间显示
  if (!canDash && cooldownTimer) {
    cooldownRemaining = Math.max(0, (cooldownTimer.getRemaining() / 1000).toFixed(1));
    updateStatusText();
  }
}

function performDash(pointer) {
  // 检查是否可以冲刺
  if (!canDash || isDashing) {
    return;
  }

  // 计算从玩家到鼠标位置的方向
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return;
  }

  // 归一化方向向量
  const dirX = dx / distance;
  const dirY = dy / distance;

  // 设置冲刺速度
  player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

  // 标记正在冲刺
  isDashing = true;
  canDash = false;
  dashCount++;

  // 改变颜色表示冲刺状态
  player.setTint(0xffff00);

  // 冲刺持续时间结束后恢复正常
  this.time.delayedCall(dashDuration, () => {
    isDashing = false;
    player.setVelocity(0);
    player.clearTint();
  });

  // 开始冷却计时
  cooldownTimer = this.time.addEvent({
    delay: dashCooldown,
    callback: () => {
      canDash = true;
      cooldownRemaining = 0;
      updateStatusText();
    }
  });

  updateStatusText();
}

function updateStatusText() {
  const dashStatus = canDash ? '✓ Ready' : `✗ Cooldown: ${cooldownRemaining}s`;
  statusText.setText([
    `Dash Count: ${dashCount}`,
    `Dash Status: ${dashStatus}`,
    `Speed: ${isDashing ? dashSpeed : normalSpeed}`,
    '',
    'Controls:',
    '- Arrow Keys: Move',
    '- Right Click: Dash to cursor'
  ]);
}

new Phaser.Game(config);