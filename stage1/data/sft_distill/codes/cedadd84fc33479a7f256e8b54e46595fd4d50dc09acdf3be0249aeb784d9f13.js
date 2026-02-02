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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心在32,32，边长约50）
  graphics.fillTriangle(
    32, 10,      // 顶点（上）
    10, 54,      // 左下顶点
    54, 54       // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  this.triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（160像素/秒，分解到x和y方向）
  // 使用45度角方向，速度分量约为 160 * cos(45°) ≈ 113
  this.triangle.setVelocity(113, 113);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.triangle.setBounce(1, 1);
  
  // 启用世界边界碰撞
  this.triangle.setCollideWorldBounds(true);
  
  // 设置物理体大小以匹配三角形（避免使用整个64x64的边界）
  this.triangle.body.setSize(44, 44);
  this.triangle.body.setOffset(10, 10);
}

function update(time, delta) {
  // 确保速度保持恒定（反弹后可能有微小变化）
  const velocity = this.triangle.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  // 如果速度偏离160，重新归一化
  if (Math.abs(currentSpeed - 160) > 1) {
    const scale = 160 / currentSpeed;
    this.triangle.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);