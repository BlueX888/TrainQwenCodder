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

let triangle;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制一个等边三角形（中心在32,32，大小为64x64）
  graphics.fillTriangle(
    32, 10,    // 顶点
    10, 54,    // 左下
    54, 54     // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTexture');
  
  // 设置碰撞世界边界
  triangle.setCollideWorldBounds(true);
  
  // 设置完全弹性碰撞（bounce = 1 表示无能量损失）
  triangle.setBounce(1, 1);
  
  // 设置初始速度为160（使用勾股定理：160/√2 ≈ 113.137）
  const speed = 160;
  const angle = Phaser.Math.DegToRad(45); // 45度角
  triangle.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
}

function update(time, delta) {
  // 保持恒定速度160
  const currentVelocity = triangle.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度有偏差，重新归一化到160
  if (Math.abs(currentSpeed - 160) > 0.1) {
    const scale = 160 / currentSpeed;
    triangle.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);