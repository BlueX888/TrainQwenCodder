const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态信号
window.__signals__ = {
  gravityDirection: 'down',
  gravityValue: 600,
  playerY: 0,
  switchCount: 0,
  timestamp: Date.now()
};

let player;
let cursors;
let gravityText;
let currentGravity = 'down';
let upKey;
let downKey;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（使用Graphics）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();

  // 创建玩家精灵（初始位置在中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0.3);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

  // 创建重力方向显示文本
  gravityText = this.add.text(16, 16, 'Gravity: DOWN (600)', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  gravityText.setDepth(100);

  // 创建说明文本
  const instructionText = this.add.text(16, 60, 'Press UP/DOWN arrows to switch gravity', {
    fontSize: '18px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setDepth(100);

  // 创建状态显示文本
  this.statusText = this.add.text(16, 100, '', {
    fontSize: '16px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.statusText.setDepth(100);

  // 初始化信号
  updateSignals();

  console.log('[GAME] Initialized - Gravity: DOWN, Value: 600');
}

function update(time, delta) {
  // 检测上方向键按下（切换重力向上）
  if (Phaser.Input.Keyboard.JustDown(upKey)) {
    if (currentGravity !== 'up') {
      currentGravity = 'up';
      this.physics.world.gravity.y = -600;
      gravityText.setText('Gravity: UP (-600)');
      window.__signals__.switchCount++;
      console.log(`[GRAVITY] Switched to UP at ${Date.now()}`);
      updateSignals();
    }
  }

  // 检测下方向键按下（切换重力向下）
  if (Phaser.Input.Keyboard.JustDown(downKey)) {
    if (currentGravity !== 'down') {
      currentGravity = 'down';
      this.physics.world.gravity.y = 600;
      gravityText.setText('Gravity: DOWN (600)');
      window.__signals__.switchCount++;
      console.log(`[GRAVITY] Switched to DOWN at ${Date.now()}`);
      updateSignals();
    }
  }

  // 更新状态文本
  this.statusText.setText(
    `Position: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
    `Velocity: (${Math.round(player.body.velocity.x)}, ${Math.round(player.body.velocity.y)})\n` +
    `Switches: ${window.__signals__.switchCount}`
  );

  // 定期更新信号
  if (time % 100 < delta) {
    updateSignals();
  }

  // 边界检测日志
  if (player.body.touching.down && currentGravity === 'down') {
    if (!player.touchingGround) {
      player.touchingGround = true;
      console.log(`[PHYSICS] Player landed on ground (gravity: DOWN)`);
    }
  } else if (player.body.touching.up && currentGravity === 'up') {
    if (!player.touchingCeiling) {
      player.touchingCeiling = true;
      console.log(`[PHYSICS] Player reached ceiling (gravity: UP)`);
    }
  } else {
    player.touchingGround = false;
    player.touchingCeiling = false;
  }
}

function updateSignals() {
  window.__signals__.gravityDirection = currentGravity;
  window.__signals__.gravityValue = currentGravity === 'down' ? 600 : -600;
  window.__signals__.playerY = Math.round(player.y);
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.velocityY = Math.round(player.body.velocity.y);
  window.__signals__.timestamp = Date.now();

  // 输出JSON格式的信号（便于验证）
  if (window.__signals__.switchCount > 0 && window.__signals__.switchCount % 5 === 0) {
    console.log('[SIGNALS]', JSON.stringify(window.__signals__));
  }
}

// 启动游戏
const game = new Phaser.Game(config);