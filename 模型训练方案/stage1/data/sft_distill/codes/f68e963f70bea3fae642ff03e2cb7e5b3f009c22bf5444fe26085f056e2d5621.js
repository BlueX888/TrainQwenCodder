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

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制三角形（等边三角形）
  // 中心点在 (25, 25)，边长约 40
  graphics.fillTriangle(
    25, 5,      // 顶点
    5, 45,      // 左下
    45, 45      // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象释放内存
  
  // 创建物理精灵
  this.triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（斜向移动，总速度约为200）
  // 使用勾股定理：vx² + vy² = 200²
  // 设置45度角移动：vx = vy = 200 / √2 ≈ 141.4
  this.triangle.setVelocity(141.4, 141.4);
  
  // 设置碰撞世界边界
  this.triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.triangle.setBounce(1, 1);
  
  // 确保世界边界碰撞已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 保持速度恒定为200
  const velocity = this.triangle.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - 200) > 1) {
    // 归一化速度向量并乘以目标速度
    const normalizedX = velocity.x / currentSpeed;
    const normalizedY = velocity.y / currentSpeed;
    this.triangle.setVelocity(normalizedX * 200, normalizedY * 200);
  }
}

new Phaser.Game(config);