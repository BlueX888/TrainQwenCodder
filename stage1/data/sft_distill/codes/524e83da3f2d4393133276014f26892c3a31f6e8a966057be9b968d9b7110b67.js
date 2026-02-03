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
let wasd;
let crossBorderCount = 0; // 状态信号：穿越边界次数
let statusText;

const PLAYER_SPEED = 240;
const PLAYER_SIZE = 32;

function preload() {
  // 使用 Graphics 创建橙色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillRect(0, 0, PLAYER_SIZE, PLAYER_SIZE);
  graphics.generateTexture('player', PLAYER_SIZE, PLAYER_SIZE);
  graphics.destroy();
}

function create() {
  // 创建物理精灵玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示状态信息
  statusText = this.add.text(10, 10, 'Border Crosses: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Use Arrow Keys or WASD to move', {
    fontSize: '16px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 绘制边界参考线
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0x00ff00, 0.3);
  borderGraphics.strokeRect(0, 0, 800, 600);
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入
  if (cursors.left.isDown || wasd.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }
  
  if (cursors.up.isDown || wasd.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }
  
  // 边界循环检测
  const halfSize = PLAYER_SIZE / 2;
  let crossed = false;
  
  // 左右边界循环
  if (player.x < -halfSize) {
    player.x = config.width + halfSize;
    crossed = true;
  } else if (player.x > config.width + halfSize) {
    player.x = -halfSize;
    crossed = true;
  }
  
  // 上下边界循环
  if (player.y < -halfSize) {
    player.y = config.height + halfSize;
    crossed = true;
  } else if (player.y > config.height + halfSize) {
    player.y = -halfSize;
    crossed = true;
  }
  
  // 更新穿越计数
  if (crossed) {
    crossBorderCount++;
    statusText.setText(`Border Crosses: ${crossBorderCount}`);
  }
}

// 启动游戏
const game = new Phaser.Game(config);