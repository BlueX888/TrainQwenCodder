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

// 全局验证信号
window.__signals__ = {
  dashCount: 0,
  canDash: true,
  cooldownRemaining: 0,
  playerPosition: { x: 0, y: 0 },
  lastDashDirection: null,
  logs: []
};

let player;
let cursors;
let canDash = true;
let isDashing = false;
let dashSpeed = 360 * 3; // 1080
let normalSpeed = 200;
let dashDuration = 150; // 冲刺持续时间（毫秒）
let dashCooldown = 500; // 冷却时间（毫秒）
let cooldownText;
let dashCountText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建黄色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加 Shift 键用于冲刺
  this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

  // UI 文本
  this.add.text(10, 10, '按方向键移动', { 
    fontSize: '16px', 
    fill: '#fff' 
  });
  
  this.add.text(10, 30, '按住 Shift + 方向键冲刺', { 
    fontSize: '16px', 
    fill: '#fff' 
  });

  dashCountText = this.add.text(10, 60, 'Dash Count: 0', { 
    fontSize: '16px', 
    fill: '#ffff00' 
  });

  cooldownText = this.add.text(10, 80, 'Cooldown: Ready', { 
    fontSize: '16px', 
    fill: '#00ff00' 
  });

  // 添加指示文本
  this.add.text(10, 110, 'Status:', { 
    fontSize: '14px', 
    fill: '#aaa' 
  });

  // 日志输出初始状态
  logSignal('Game initialized', {
    dashSpeed: dashSpeed,
    normalSpeed: normalSpeed,
    dashDuration: dashDuration,
    dashCooldown: dashCooldown
  });
}

function update(time, delta) {
  if (!player) return;

  // 更新玩家位置到信号
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };

  // 如果正在冲刺，不处理普通移动
  if (isDashing) {
    return;
  }

  // 普通移动
  player.setVelocity(0);

  let moveX = 0;
  let moveY = 0;

  if (cursors.left.isDown) {
    moveX = -1;
  } else if (cursors.right.isDown) {
    moveX = 1;
  }

  if (cursors.up.isDown) {
    moveY = -1;
  } else if (cursors.down.isDown) {
    moveY = 1;
  }

  // 检测冲刺输入
  if (this.shiftKey.isDown && canDash && (moveX !== 0 || moveY !== 0)) {
    executeDash.call(this, moveX, moveY);
  } else if (moveX !== 0 || moveY !== 0) {
    // 普通移动
    const velocity = normalizeVector(moveX, moveY, normalSpeed);
    player.setVelocity(velocity.x, velocity.y);
  }
}

function executeDash(dirX, dirY) {
  if (!canDash) return;

  isDashing = true;
  canDash = false;

  // 记录冲刺方向
  const direction = getDirectionName(dirX, dirY);
  window.__signals__.lastDashDirection = direction;
  window.__signals__.dashCount++;
  window.__signals__.canDash = false;

  // 归一化方向并应用冲刺速度
  const velocity = normalizeVector(dirX, dirY, dashSpeed);
  player.setVelocity(velocity.x, velocity.y);

  // 更新 UI
  dashCountText.setText('Dash Count: ' + window.__signals__.dashCount);
  cooldownText.setText('Cooldown: Dashing!');
  cooldownText.setColor('#ff0000');

  // 日志记录
  logSignal('Dash executed', {
    direction: direction,
    speed: dashSpeed,
    position: { x: player.x, y: player.y }
  });

  // 冲刺持续时间结束
  this.time.delayedCall(dashDuration, () => {
    isDashing = false;
    player.setVelocity(0);
    
    logSignal('Dash ended', {
      position: { x: player.x, y: player.y }
    });
  });

  // 冷却计时器
  let cooldownTimer = this.time.addEvent({
    delay: dashCooldown,
    callback: () => {
      canDash = true;
      window.__signals__.canDash = true;
      window.__signals__.cooldownRemaining = 0;
      cooldownText.setText('Cooldown: Ready');
      cooldownText.setColor('#00ff00');
      
      logSignal('Dash ready', {
        totalDashes: window.__signals__.dashCount
      });
    }
  });

  // 更新冷却剩余时间
  const updateCooldown = () => {
    if (!canDash && !isDashing) {
      const remaining = Math.ceil(cooldownTimer.getRemaining());
      window.__signals__.cooldownRemaining = remaining;
      cooldownText.setText('Cooldown: ' + (remaining / 1000).toFixed(1) + 's');
      cooldownText.setColor('#ff9900');
    }
  };

  // 每帧更新冷却显示
  const cooldownInterval = this.time.addEvent({
    delay: 50,
    callback: updateCooldown,
    repeat: Math.ceil(dashCooldown / 50)
  });
}

// 归一化向量
function normalizeVector(x, y, speed) {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: (x / length) * speed,
    y: (y / length) * speed
  };
}

// 获取方向名称
function getDirectionName(x, y) {
  if (x > 0 && y === 0) return 'right';
  if (x < 0 && y === 0) return 'left';
  if (y > 0 && x === 0) return 'down';
  if (y < 0 && x === 0) return 'up';
  if (x > 0 && y < 0) return 'up-right';
  if (x < 0 && y < 0) return 'up-left';
  if (x > 0 && y > 0) return 'down-right';
  if (x < 0 && y > 0) return 'down-left';
  return 'unknown';
}

// 日志记录函数
function logSignal(event, data) {
  const logEntry = {
    timestamp: Date.now(),
    event: event,
    data: data
  };
  window.__signals__.logs.push(logEntry);
  console.log('[SIGNAL]', JSON.stringify(logEntry));
}

new Phaser.Game(config);