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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制一个等边三角形（中心对齐）
  graphics.fillTriangle(
    0, -30,    // 顶点
    -26, 15,   // 左下角
    26, 15     // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 52, 45);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（160 像素/秒，使用勾股定理分解到 x 和 y）
  // 速度 160，方向为 45 度角
  const speed = 160;
  const angle = Math.PI / 4; // 45度
  triangle.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置边界碰撞
  triangle.setCollideWorldBounds(true); // 启用世界边界碰撞
  triangle.setBounce(1, 1); // 设置反弹系数为 1（完全弹性碰撞）
  
  // 确保物理世界边界已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);