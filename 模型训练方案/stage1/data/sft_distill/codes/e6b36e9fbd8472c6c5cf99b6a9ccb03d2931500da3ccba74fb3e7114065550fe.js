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

let hexagon;
let cursors;
const SPEED = 300;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 计算六边形顶点（半径为30像素）
  const radius = 30;
  const hexPath = new Phaser.Geom.Polygon();
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  hexPath.setTo(points);
  graphics.fillPoints(hexPath.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞边界
  hexagon.setCollideWorldBounds(true);
  
  // 设置精灵的物理体大小（略小于纹理以获得更好的视觉效果）
  hexagon.body.setSize(50, 50);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  hexagon.setVelocity(0);
  
  // 检测方向键输入并设置速度
  if (cursors.left.isDown) {
    hexagon.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    hexagon.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    hexagon.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    hexagon.setVelocityY(SPEED);
  }
  
  // 对角线移动时标准化速度，保持恒定速度
  if (hexagon.body.velocity.x !== 0 && hexagon.body.velocity.y !== 0) {
    hexagon.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);