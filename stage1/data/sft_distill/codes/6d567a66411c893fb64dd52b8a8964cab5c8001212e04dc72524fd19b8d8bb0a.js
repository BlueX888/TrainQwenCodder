const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

let diamond;
let cursors;
const SPEED = 300;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建橙色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制菱形路径（中心点为 32, 32，大小 64x64）
  const diamond_path = new Phaser.Geom.Polygon([
    32, 0,    // 顶点
    64, 32,   // 右点
    32, 64,   // 底点
    0, 32     // 左点
  ]);
  
  graphics.fillPoints(diamond_path.points, true);
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置碰撞体大小（菱形的实际碰撞区域）
  diamond.setCollideWorldBounds(true);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  diamond.setVelocity(0, 0);
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    diamond.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    diamond.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    diamond.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    diamond.setVelocityY(SPEED);
  }
  
  // 对角线移动时归一化速度，保持速度恒定
  if (diamond.body.velocity.x !== 0 && diamond.body.velocity.y !== 0) {
    diamond.setVelocity(
      diamond.body.velocity.x * Math.SQRT1_2,
      diamond.body.velocity.y * Math.SQRT1_2
    );
  }
}

new Phaser.Game(config);