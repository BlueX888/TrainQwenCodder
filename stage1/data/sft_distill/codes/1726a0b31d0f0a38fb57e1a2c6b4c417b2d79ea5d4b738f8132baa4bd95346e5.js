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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心对齐）
  // 三角形顶点：上(0, -20), 左下(-20, 20), 右下(20, 20)
  graphics.fillTriangle(
    0, -20,    // 顶点
    -20, 20,   // 左下
    20, 20     // 右下
  );
  
  // 生成纹理（40x40 像素，包含三角形）
  graphics.generateTexture('triangle', 40, 40);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（160像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 160;
  const velocityY = Math.sin(angle * Math.PI / 180) * 160;
  triangle.setVelocity(velocityX, velocityY);
  
  // 设置碰撞世界边界
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 确保三角形不会因为摩擦而减速
  triangle.body.setDamping(false);
  
  // 可选：让三角形旋转以增强视觉效果
  triangle.setAngularVelocity(100);
}

new Phaser.Game(config);