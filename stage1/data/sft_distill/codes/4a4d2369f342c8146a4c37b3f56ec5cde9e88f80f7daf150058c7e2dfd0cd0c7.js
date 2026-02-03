const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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

// 全局信号记录
window.__signals__ = {
  gravityDirection: 'down',
  gravitySwitchCount: 0,
  gravityHistory: []
};

let player;
let ground;
let ceiling;
let cursors;
let gravityText;
let currentGravity = 'down'; // 'up' or 'down'
const GRAVITY_VALUE = 600;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8b4513, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();

  // 创建天花板纹理
  const ceilingGraphics = this.add.graphics();
  ceilingGraphics.fillStyle(0x4169e1, 1);
  ceilingGraphics.fillRect(0, 0, 800, 50);
  ceilingGraphics.generateTexture('ceiling', 800, 50);
  ceilingGraphics.destroy();

  // 创建地面（底部）
  ground = this.physics.add.sprite(400, 575, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建天花板（顶部）
  ceiling = this.physics.add.sprite(400, 25, 'ceiling');
  ceiling.setImmovable(true);
  ceiling.body.allowGravity = false;

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(false); // 不使用世界边界，使用自定义碰撞

  // 添加碰撞检测
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, ceiling);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建重力方向显示文本
  gravityText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateGravityText();

  // 添加说明文本
  this.add.text(16, 560, 'Press UP/DOWN arrow keys to switch gravity', {
    fontSize: '18px',
    fill: '#ffff00'
  });

  // 记录初始状态
  logGravityChange('down', 'initial');
}

function update(time, delta) {
  // 检测上方向键 - 重力向上
  if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
    if (currentGravity !== 'up') {
      currentGravity = 'up';
      this.physics.world.gravity.y = -GRAVITY_VALUE;
      updateGravityText();
      logGravityChange('up', time);
      
      // 给玩家一个初始向上的速度，使效果更明显
      player.setVelocityY(-200);
    }
  }

  // 检测下方向键 - 重力向下
  if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
    if (currentGravity !== 'down') {
      currentGravity = 'down';
      this.physics.world.gravity.y = GRAVITY_VALUE;
      updateGravityText();
      logGravityChange('down', time);
      
      // 给玩家一个初始向下的速度，使效果更明显
      player.setVelocityY(200);
    }
  }

  // 边界检查（防止玩家飞出屏幕）
  if (player.y < 0) {
    player.y = 0;
    player.setVelocityY(0);
  }
  if (player.y > 600) {
    player.y = 600;
    player.setVelocityY(0);
  }

  // 更新玩家旋转角度，根据重力方向
  if (currentGravity === 'up') {
    player.angle = Phaser.Math.Linear(player.angle, 180, 0.1);
  } else {
    player.angle = Phaser.Math.Linear(player.angle, 0, 0.1);
  }
}

function updateGravityText() {
  const arrow = currentGravity === 'down' ? '↓' : '↑';
  const color = currentGravity === 'down' ? '#ff0000' : '#00ffff';
  
  gravityText.setText(`Gravity: ${currentGravity.toUpperCase()} ${arrow}`);
  gravityText.setStyle({ fill: color });
  
  // 更新全局信号
  window.__signals__.gravityDirection = currentGravity;
}

function logGravityChange(direction, time) {
  window.__signals__.gravitySwitchCount++;
  window.__signals__.gravityHistory.push({
    direction: direction,
    time: time,
    count: window.__signals__.gravitySwitchCount
  });
  
  console.log(JSON.stringify({
    event: 'gravity_switch',
    direction: direction,
    time: time,
    totalSwitches: window.__signals__.gravitySwitchCount
  }));
}

const game = new Phaser.Game(config);