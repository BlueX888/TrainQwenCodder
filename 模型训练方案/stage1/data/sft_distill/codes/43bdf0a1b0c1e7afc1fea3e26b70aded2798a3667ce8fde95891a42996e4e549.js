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

let triangle;
const SPEED = 160;

function preload() {
  // 使用 Graphics 创建白色三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制白色三角形
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(
    32, 8,   // 顶点（上）
    8, 56,   // 左下角
    56, 56   // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置初始速度（斜向移动，速度大小为160）
  // 使用勾股定理：vx² + vy² = 160²
  // 设置45度角移动：vx = vy = 160/√2 ≈ 113.137
  const velocity = SPEED / Math.sqrt(2);
  triangle.setVelocity(velocity, velocity);
  
  // 设置碰撞世界边界
  triangle.setCollideWorldBounds(true);
  
  // 设置完全弹性碰撞（反弹系数为1）
  triangle.setBounce(1, 1);
  
  // 确保物理体大小合适
  triangle.setCircle(28); // 使用圆形碰撞体，更适合三角形
}

function update(time, delta) {
  // 保持恒定速度（防止因精度问题速度衰减）
  const currentSpeed = Math.sqrt(
    triangle.body.velocity.x ** 2 + 
    triangle.body.velocity.y ** 2
  );
  
  // 如果速度有偏差，重新归一化到 SPEED
  if (Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    triangle.setVelocity(
      triangle.body.velocity.x * scale,
      triangle.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);