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
  // 使用 Graphics 绘制黄色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制三角形（等边三角形）
  // 三个顶点坐标：顶部中心、左下、右下
  graphics.fillTriangle(
    32, 8,   // 顶点
    8, 56,   // 左下
    56, 56   // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（斜向移动，速度大小约为200）
  // 使用勾股定理：sqrt(141^2 + 141^2) ≈ 200
  triangle.setVelocity(141, 141);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 启用与世界边界的碰撞
  triangle.setCollideWorldBounds(true);
  
  // 可选：设置三角形的碰撞体大小，使其更贴合三角形形状
  triangle.body.setSize(48, 48);
  triangle.body.setOffset(8, 8);
}

new Phaser.Game(config);