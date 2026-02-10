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
  scene: { preload, create, update }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制一个指向上方的三角形（中心在 32, 32）
  graphics.fillTriangle(
    32, 10,   // 顶点
    10, 54,   // 左下角
    54, 54    // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  this.triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（斜向移动，总速度约为 160）
  const speed = 160;
  const angle = Math.PI / 4; // 45度角
  this.triangle.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置碰撞世界边界
  this.triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  this.triangle.setBounce(1, 1);
}

function update(time, delta) {
  // 保持速度恒定为 160
  const currentVelocity = this.triangle.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度发生变化（由于浮点误差），重新归一化
  if (Math.abs(currentSpeed - 160) > 0.1) {
    const scale = 160 / currentSpeed;
    this.triangle.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);