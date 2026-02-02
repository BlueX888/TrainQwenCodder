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
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const size = 40;
  graphics.fillTriangle(
    0, -size,           // 顶点
    -size, size,        // 左下
    size, size          // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', size * 2, size * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（随机方向，速度为160）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 160);
  triangle.setVelocity(velocity.x, velocity.y);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：让三角形根据移动方向旋转
  this.physics.world.on('worldbounds', (body) => {
    // 世界边界碰撞事件（可选）
  });
}

new Phaser.Game(config);