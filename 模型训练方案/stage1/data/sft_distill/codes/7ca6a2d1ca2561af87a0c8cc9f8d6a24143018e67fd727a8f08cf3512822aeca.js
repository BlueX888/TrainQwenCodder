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
  // 创建橙色菱形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
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
  
  // 设置碰撞边界，使其不能移出画布
  player.setCollideWorldBounds(true);
  
  // 设置精灵的物理体大小（菱形的实际大小约为 48x48）
  player.body.setSize(48, 48);
  player.body.setOffset(8, 8);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 检测方向键并设置速度
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
  
  // 如果同时按下两个方向键，归一化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(SPEED);
  }
}

// 创建游戏实例
new Phaser.Game(config);