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
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制等边三角形（中心在原点）
  const triangleSize = 40;
  graphics.fillTriangle(
    0, -triangleSize,           // 顶点（上）
    -triangleSize, triangleSize, // 左下角
    triangleSize, triangleSize   // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize * 2, triangleSize * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  this.triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（斜向移动，速度大小为 160）
  // 使用勾股定理：vx² + vy² = 160²
  // 45度角：vx = vy = 160 / √2 ≈ 113.14
  const speed = 160;
  const angle45 = Math.sqrt(speed * speed / 2);
  this.triangle.setVelocity(angle45, angle45);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  this.triangle.setBounce(1, 1);
  
  // 启用世界边界碰撞
  this.triangle.setCollideWorldBounds(true);
  
  // 添加提示文本
  this.add.text(10, 10, '橙色三角形以 160 速度移动\n碰到边界会反弹', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 可选：显示当前速度（用于调试）
  // const velocity = this.triangle.body.velocity;
  // const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  // console.log('Current speed:', currentSpeed);
}

new Phaser.Game(config);