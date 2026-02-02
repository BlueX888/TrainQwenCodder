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

function preload() {
  // 使用 Graphics 创建粉色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xFF69B4, 1);
  
  // 绘制三角形（等边三角形）
  // 三个顶点坐标：顶部中心、左下、右下
  graphics.fillTriangle(
    30, 10,   // 顶点
    10, 50,   // 左下
    50, 50    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 60, 60);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTexture');
  
  // 设置初始速度（200速度，斜向移动）
  // 使用勾股定理：vx² + vy² = 200²
  // 设置为45度角移动：vx = vy = 200/√2 ≈ 141.42
  const velocity = 200 / Math.sqrt(2);
  triangle.setVelocity(velocity, velocity);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 启用与世界边界的碰撞
  triangle.setCollideWorldBounds(true);
  
  // 可选：添加提示文本
  this.add.text(10, 10, '粉色三角形会在边界反弹', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 保持速度恒定（防止精度损失导致速度变化）
  const currentVelocity = triangle.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度有偏差，重新归一化到200
  if (Math.abs(currentSpeed - 200) > 0.1) {
    const scale = 200 / currentSpeed;
    triangle.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);