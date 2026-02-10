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
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心点在纹理中心）
  const triangleSize = 40;
  graphics.fillTriangle(
    triangleSize / 2, 0,                    // 顶点
    0, triangleSize,                        // 左下角
    triangleSize, triangleSize              // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建带物理属性的三角形精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（随机方向，速度大小为 360）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 360;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 360;
  triangle.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：让三角形根据移动方向旋转
  this.physics.world.on('worldbounds', () => {
    // 边界碰撞时的额外处理（可选）
  });
}

new Phaser.Game(config);