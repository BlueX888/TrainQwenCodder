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
let cooldownRemaining = 0; // 冷却剩余时间
let isDashing = false; // 是否正在冲刺

let player;
let cursors;
let canDash = true;
let dashCooldownTimer = null;
let dashDurationTimer = null;
let statusText;
let cooldownText;

const NORMAL_SPEED = 300;
const DASH_SPEED = 300 * 3; // 900
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 2500; // 冷却时间（毫秒）

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建紫色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 监听鼠标右键按下事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      performDash.call(this, pointer);
    }
  });

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  cooldownText = this.add.text(10, 40, '', {
    fontSize: '16px',
    fill: '#ffaa00'
  });

  updateStatusText();
}

function update(time, delta) {
  // 更新冷却剩余时间显示
  if (!canDash && dashCooldownTimer) {
    cooldownRemaining = Math.max(0, dashCooldownTimer.getRemaining());
    updateStatusText();
  } else if (canDash) {
    cooldownRemaining = 0;
    updateStatusText();
  }

  // 如果正在冲刺，不允许普通移动
  if (isDashing) {
    return;
  }

  // 普通移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-NORMAL_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(NORMAL_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-NORMAL_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(NORMAL_SPEED);
  }
}

function performDash(pointer) {
  if (!canDash || isDashing) {
    return;
  }

  // 计算从角色到鼠标的方向向量
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return;
  }

  // 归一化方向向量并应用冲刺速度
  const velocityX = (dx / distance) * DASH_SPEED;
  const velocityY = (dy / distance) * DASH_SPEED;

  player.setVelocity(velocityX, velocityY);

  // 设置冲刺状态
  isDashing = true;
  canDash = false;
  dashCount++;

  // 改变角色颜色表示冲刺状态
  player.setTint(0xff00ff);

  // 冲刺持续时间计时器
  if (dashDurationTimer) {
    dashDurationTimer.destroy();
  }
  dashDurationTimer = this.time.addEvent({
    delay: DASH_DURATION,
    callback: () => {
      isDashing = false;
      player.setVelocity(0);
      player.clearTint();
    }
  });

  // 冷却时间计时器
  if (dashCooldownTimer) {
    dashCooldownTimer.destroy();
  }
  dashCooldownTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      cooldownRemaining = 0;
      updateStatusText();
    }
  });

  updateStatusText();
}

function updateStatusText() {
  statusText.setText([
    `Dash Count: ${dashCount}`,
    `Status: ${isDashing ? 'DASHING' : (canDash ? 'Ready' : 'Cooldown')}`
  ]);

  if (!canDash && cooldownRemaining > 0) {
    cooldownText.setText(`Cooldown: ${(cooldownRemaining / 1000).toFixed(2)}s`);
  } else {
    cooldownText.setText('Cooldown: Ready');
  }
}

new Phaser.Game(config);