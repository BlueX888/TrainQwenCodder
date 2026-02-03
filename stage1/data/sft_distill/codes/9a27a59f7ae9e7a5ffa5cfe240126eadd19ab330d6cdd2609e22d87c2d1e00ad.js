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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x888888, 1);
  
  // 绘制三角形（等边三角形，中心对齐）
  // 三角形顶点坐标（相对于64x64的纹理中心）
  const size = 60;
  const centerX = 32;
  const centerY = 32;
  
  graphics.fillTriangle(
    centerX, centerY - size / 2,           // 顶点
    centerX - size / 2, centerY + size / 2, // 左下
    centerX + size / 2, centerY + size / 2  // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 200;
  const velocityY = Math.sin(angle * Math.PI / 180) * 200;
  triangle.setVelocity(velocityX, velocityY);
  
  // 设置碰撞世界边界
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：添加调试信息
  this.add.text(10, 10, 'Gray Triangle Bouncing at Speed 200', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);