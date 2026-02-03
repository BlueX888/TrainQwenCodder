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
  }
};

let triangle;
let velocity = { x: 240, y: 240 };

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形 (等边三角形)
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 顶点
  graphics.lineTo(-26, 15);   // 左下
  graphics.lineTo(26, 15);    // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 52, 45);
  graphics.destroy();
  
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置初始速度 (使用勾股定理确保总速度为240)
  // 240 / sqrt(2) ≈ 169.7
  const speed = 240 / Math.sqrt(2);
  triangle.setVelocity(speed, speed);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  triangle.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // Arcade Physics 的 bounce 和 collideWorldBounds 会自动处理反弹
  // 但为了确保速度恒定为240，我们需要手动处理
  
  const body = triangle.body;
  
  // 检测边界碰撞并反转速度
  if (body.blocked.left || body.blocked.right) {
    body.velocity.x *= -1;
  }
  
  if (body.blocked.up || body.blocked.down) {
    body.velocity.y *= -1;
  }
  
  // 确保速度保持在240
  const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
  if (currentSpeed > 0 && Math.abs(currentSpeed - 240) > 1) {
    const scale = 240 / currentSpeed;
    body.velocity.x *= scale;
    body.velocity.y *= scale;
  }
}

new Phaser.Game(config);