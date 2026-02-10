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
  }
};

let hexagon;
let cursors;
const SPEED = 240;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFFF00, 1); // 黄色
  
  // 计算六边形的顶点坐标（中心在 32, 32，半径 28）
  const radius = 28;
  const centerX = 32;
  const centerY = 32;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  hexagon.setCollideWorldBounds(true); // 与世界边界碰撞
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
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
  
  // 对角线移动时归一化速度，保持相同速度
  if (hexagon.body.velocity.x !== 0 && hexagon.body.velocity.y !== 0) {
    hexagon.body.velocity.normalize().scale(SPEED);
  }
}

// 创建游戏实例
new Phaser.Game(config);