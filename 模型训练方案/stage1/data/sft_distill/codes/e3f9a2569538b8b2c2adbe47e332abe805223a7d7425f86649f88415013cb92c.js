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
let positionText;
let wrapCount = 0; // 可验证状态：记录循环次数

function preload() {
  // 使用 Graphics 生成红色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 关闭世界边界碰撞以允许穿越
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键支持
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示位置和循环次数信息（可验证状态）
  positionText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文字
  this.add.text(10, 50, 'Use Arrow Keys or WASD to move\nSpeed: 120px/s', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 检测输入并设置速度（速度为 120）
  const speed = 120;
  
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 记录移动前的位置用于检测边界穿越
  const prevX = player.x;
  const prevY = player.y;
  
  // 使用 wrap 实现循环地图效果
  // 参数：sprite, padding（额外边距）
  this.physics.world.wrap(player, 16);
  
  // 检测是否发生了边界循环
  const wrapped = Math.abs(player.x - prevX) > 100 || Math.abs(player.y - prevY) > 100;
  if (wrapped) {
    wrapCount++;
  }
  
  // 更新状态显示
  positionText.setText([
    `Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
    `Velocity: (${Math.floor(player.body.velocity.x)}, ${Math.floor(player.body.velocity.y)})`,
    `Wrap Count: ${wrapCount}`
  ]);
}

const game = new Phaser.Game(config);