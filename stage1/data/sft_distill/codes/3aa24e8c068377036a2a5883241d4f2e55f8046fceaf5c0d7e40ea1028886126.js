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
let playerSpeed = 240;

// 状态信号变量
let positionX = 400;
let positionY = 300;
let wrapCount = 0; // 记录穿越边界次数

function preload() {
  // 使用 Graphics 创建绿色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵（位于屏幕中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键支持
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 显示说明
  this.add.text(400, 550, '使用方向键或 WASD 移动 | 移出边界会从对侧出现', {
    fontSize: '14px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 处理键盘输入
  let velocityX = 0;
  let velocityY = 0;
  
  if (cursors.left.isDown || this.keys.a.isDown) {
    velocityX = -playerSpeed;
  } else if (cursors.right.isDown || this.keys.d.isDown) {
    velocityX = playerSpeed;
  }
  
  if (cursors.up.isDown || this.keys.w.isDown) {
    velocityY = -playerSpeed;
  } else if (cursors.down.isDown || this.keys.s.isDown) {
    velocityY = playerSpeed;
  }
  
  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    const diagonal = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX = (velocityX / diagonal) * playerSpeed;
    velocityY = (velocityY / diagonal) * playerSpeed;
  }
  
  player.setVelocity(velocityX, velocityY);
  
  // 记录循环前的位置
  const oldX = player.x;
  const oldY = player.y;
  
  // 边界循环效果 - 使用 Phaser.Math.Wrap
  // Wrap 函数：当值超出范围时从另一端重新出现
  player.x = Phaser.Math.Wrap(player.x, -16, config.width + 16);
  player.y = Phaser.Math.Wrap(player.y, -16, config.height + 16);
  
  // 检测是否发生了边界穿越
  if (Math.abs(player.x - oldX) > 100 || Math.abs(player.y - oldY) > 100) {
    wrapCount++;
  }
  
  // 更新状态信号
  positionX = Math.round(player.x);
  positionY = Math.round(player.y);
  
  // 更新状态显示
  this.statusText.setText([
    `Position: (${positionX}, ${positionY})`,
    `Speed: ${playerSpeed}`,
    `Wrap Count: ${wrapCount}`,
    `Velocity: (${Math.round(player.body.velocity.x)}, ${Math.round(player.body.velocity.y)})`
  ]);
}

// 创建游戏实例
const game = new Phaser.Game(config);