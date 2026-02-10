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

let star;
let cursors;
const SPEED = 160;

function preload() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  
  // 绘制白色星形
  graphics.fillStyle(0xffffff, 1);
  
  // 星形的5个顶点坐标（中心在32,32，半径28）
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 28;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建星形精灵，位于画布中心
  star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置碰撞边界为世界边界
  star.setCollideWorldBounds(true);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // 重置速度
  star.setVelocity(0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    star.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    star.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    star.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    star.setVelocityY(SPEED);
  }
  
  // 对角线移动时归一化速度，保持恒定速度
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      star.body.velocity.normalize().scale(SPEED);
    }
  }
}

new Phaser.Game(config);