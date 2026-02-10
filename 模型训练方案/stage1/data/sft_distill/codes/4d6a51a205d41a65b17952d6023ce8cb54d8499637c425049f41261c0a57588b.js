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
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制菱形路径（中心点在 32, 32）
  const diamond = new Phaser.Geom.Polygon([
    32, 8,    // 上顶点
    56, 32,   // 右顶点
    32, 56,   // 下顶点
    8, 32     // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置精灵碰撞边界
  player.setCollideWorldBounds(true);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 检测方向键输入并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    const normalizedSpeed = SPEED / Math.sqrt(2);
    player.setVelocity(
      player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
      player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
    );
  }
}

new Phaser.Game(config);