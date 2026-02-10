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
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1);
  
  // 计算六边形顶点（半径30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexPoints.push({ x, y });
  }
  
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 设置物理世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建六边形精灵（居中位置）
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置精灵与世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  hexagon.setVelocity(0);
  
  // 根据方向键设置速度
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
  
  // 处理对角线移动时的速度归一化
  if (hexagon.body.velocity.x !== 0 && hexagon.body.velocity.y !== 0) {
    const normalizedSpeed = SPEED / Math.sqrt(2);
    hexagon.setVelocity(
      hexagon.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
      hexagon.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
    );
  }
}

new Phaser.Game(config);