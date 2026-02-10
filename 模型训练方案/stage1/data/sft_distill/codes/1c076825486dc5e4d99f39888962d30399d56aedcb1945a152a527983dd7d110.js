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

let triangle;
const SPEED = 240;

function preload() {
  // 使用 Graphics 创建青色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形 (等边三角形)
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 43);     // 右下
  graphics.lineTo(0, 43);      // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 43);
  graphics.destroy();
}

function create() {
  // 创建带物理属性的三角形精灵
  triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 设置初始速度（斜向移动，使用勾股定理保证速度为 240）
  const velocityX = SPEED * Math.cos(Math.PI / 4); // 约 169.7
  const velocityY = SPEED * Math.sin(Math.PI / 4); // 约 169.7
  triangle.setVelocity(velocityX, velocityY);
}

function update(time, delta) {
  // 保持恒定速度（防止浮点误差导致速度衰减）
  const velocity = triangle.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    triangle.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);