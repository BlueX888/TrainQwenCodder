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
const SPEED = 200;

function preload() {
  // 使用 Graphics 绘制橙色六边形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 计算六边形的六个顶点（半径30）
  const radius = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建带物理属性的六边形精灵，放置在画布中心
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞边界，使精灵不能移出画布
  hexagon.setCollideWorldBounds(true);
  
  // 设置物理体大小（稍小于纹理，使碰撞更精确）
  hexagon.body.setSize(50, 50);
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // 重置速度
  hexagon.setVelocity(0, 0);
  
  // 检测方向键并设置速度
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
  
  // 如果同时按下两个方向键，需要归一化速度向量
  // 防止斜向移动速度过快
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    hexagon.body.velocity.normalize().scale(SPEED);
  }
}

// 创建游戏实例
new Phaser.Game(config);