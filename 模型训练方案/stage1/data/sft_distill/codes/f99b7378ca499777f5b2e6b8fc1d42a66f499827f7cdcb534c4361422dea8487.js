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

// 全局信号对象
window.__signals__ = {
  dashCount: 0,
  isDashing: false,
  canDash: true,
  cooldownRemaining: 0,
  playerPosition: { x: 0, y: 0 },
  playerVelocity: { x: 0, y: 0 }
};

let player;
let cursors;
let keys;
let canDash = true;
let isDashing = false;
let dashCooldownTimer = null;
let dashDurationTimer = null;

const NORMAL_SPEED = 240;
const DASH_SPEED = 240 * 3; // 720
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 2500; // 冷却时间（毫秒）

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建青色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D,
    SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT
  });

  // 创建UI文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 冷却指示器
  this.cooldownBar = this.add.graphics();

  console.log(JSON.stringify({
    event: 'game_start',
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 获取移动方向
  let moveX = 0;
  let moveY = 0;

  if (keys.A.isDown) moveX = -1;
  if (keys.D.isDown) moveX = 1;
  if (keys.W.isDown) moveY = -1;
  if (keys.S.isDown) moveY = 1;

  // 检测冲刺输入（Shift + 方向键）
  if (keys.SHIFT.isDown && canDash && !isDashing && (moveX !== 0 || moveY !== 0)) {
    startDash(this, moveX, moveY);
  }

  // 根据状态设置速度
  if (moveX !== 0 || moveY !== 0) {
    // 归一化对角线移动
    const length = Math.sqrt(moveX * moveX + moveY * moveY);
    moveX /= length;
    moveY /= length;

    const currentSpeed = isDashing ? DASH_SPEED : NORMAL_SPEED;
    player.setVelocity(moveX * currentSpeed, moveY * currentSpeed);
  }

  // 更新信号
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
  window.__signals__.playerVelocity = {
    x: Math.round(player.body.velocity.x),
    y: Math.round(player.body.velocity.y)
  };
  window.__signals__.isDashing = isDashing;
  window.__signals__.canDash = canDash;

  // 更新UI
  updateUI(this);
}

function startDash(scene, dirX, dirY) {
  isDashing = true;
  canDash = false;
  window.__signals__.dashCount++;

  console.log(JSON.stringify({
    event: 'dash_start',
    dashCount: window.__signals__.dashCount,
    direction: { x: dirX, y: dirY },
    position: { x: player.x, y: player.y },
    timestamp: Date.now()
  }));

  // 冲刺持续时间
  if (dashDurationTimer) {
    dashDurationTimer.destroy();
  }
  dashDurationTimer = scene.time.addEvent({
    delay: DASH_DURATION,
    callback: () => {
      isDashing = false;
      console.log(JSON.stringify({
        event: 'dash_end',
        timestamp: Date.now()
      }));
    }
  });

  // 冲刺冷却
  if (dashCooldownTimer) {
    dashCooldownTimer.destroy();
  }
  dashCooldownTimer = scene.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      window.__signals__.cooldownRemaining = 0;
      console.log(JSON.stringify({
        event: 'dash_ready',
        timestamp: Date.now()
      }));
    }
  });
}

function updateUI(scene) {
  // 计算冷却剩余时间
  let cooldownRemaining = 0;
  if (dashCooldownTimer && !canDash) {
    cooldownRemaining = dashCooldownTimer.getRemaining();
    window.__signals__.cooldownRemaining = Math.ceil(cooldownRemaining);
  }

  // 更新状态文本
  const statusLines = [
    `冲刺次数: ${window.__signals__.dashCount}`,
    `位置: (${window.__signals__.playerPosition.x}, ${window.__signals__.playerPosition.y})`,
    `速度: ${isDashing ? 'DASH(720)' : 'NORMAL(240)'}`,
    `冷却: ${canDash ? '就绪' : `${(cooldownRemaining / 1000).toFixed(1)}s`}`,
    '',
    '操作: WASD移动 | Shift+WASD冲刺'
  ];
  scene.statusText.setText(statusLines.join('\n'));

  // 绘制冷却条
  scene.cooldownBar.clear();
  if (!canDash && dashCooldownTimer) {
    const progress = 1 - (cooldownRemaining / DASH_COOLDOWN);
    scene.cooldownBar.fillStyle(0x00ff00, 0.8);
    scene.cooldownBar.fillRect(10, 120, 200 * progress, 20);
    scene.cooldownBar.lineStyle(2, 0xffffff, 1);
    scene.cooldownBar.strokeRect(10, 120, 200, 20);
  } else if (canDash) {
    scene.cooldownBar.fillStyle(0x00ff00, 0.8);
    scene.cooldownBar.fillRect(10, 120, 200, 20);
    scene.cooldownBar.lineStyle(2, 0xffffff, 1);
    scene.cooldownBar.strokeRect(10, 120, 200, 20);
  }
}

new Phaser.Game(config);