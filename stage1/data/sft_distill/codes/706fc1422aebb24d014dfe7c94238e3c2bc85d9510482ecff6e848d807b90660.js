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

let player;
let cursors;

function preload() {
  // 创建橙色菱形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制菱形路径（中心点为32,32，边长约45像素）
  const path = new Phaser.Geom.Polygon([
    32, 0,    // 上顶点
    64, 32,   // 右顶点
    32, 64,   // 下顶点
    0, 32     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵（橙色菱形）
  player = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置物理属性
  player.setCollideWorldBounds(true); // 限制在画布边界内
  player.body.setSize(50, 50); // 设置碰撞体积（略小于纹理以获得更好的视觉效果）
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 检测方向键输入并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (cursors.down.isDown) {
    player.setVelocityY(300);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(300);
  }
}

new Phaser.Game(config);