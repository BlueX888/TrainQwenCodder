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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制一个等边三角形（中心在 32, 32，边长约 50）
  graphics.fillTriangle(
    32, 10,      // 顶点
    10, 54,      // 左下顶点
    54, 54       // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（160 速度，斜向移动）
  triangle.setVelocity(160 * Math.cos(Math.PI / 4), 160 * Math.sin(Math.PI / 4));
  
  // 设置碰撞世界边界
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：调整碰撞体大小以更贴合三角形
  triangle.body.setSize(44, 44);
  triangle.body.setOffset(10, 10);
}

new Phaser.Game(config);