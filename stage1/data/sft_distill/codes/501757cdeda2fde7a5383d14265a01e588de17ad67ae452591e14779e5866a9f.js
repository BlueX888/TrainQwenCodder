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
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（等边三角形，中心在 (32, 32)）
  graphics.fillTriangle(
    32, 10,   // 顶点
    10, 54,   // 左下顶点
    54, 54    // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy();
  
  // 创建带物理效果的三角形精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（200速度，斜向移动）
  triangle.setVelocity(200, 200);
  
  // 设置边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 确保物理体与显示对象大小匹配
  triangle.body.setSize(44, 44);
  triangle.body.setOffset(10, 10);
}

new Phaser.Game(config);