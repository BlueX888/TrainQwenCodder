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

let rectangle;
let velocity = { x: 200, y: 200 };

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 生成橙色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeRect', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  rectangle = this.physics.add.sprite(400, 300, 'orangeRect');
  
  // 设置初始速度
  rectangle.setVelocity(velocity.x, velocity.y);
  
  // 设置碰撞世界边界
  rectangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  rectangle.setBounce(1, 1);
}

function update(time, delta) {
  // Arcade 物理系统的 setBounce 和 setCollideWorldBounds 
  // 会自动处理边界反弹，无需手动编写反弹逻辑
  
  // 如果需要确保速度保持恒定（避免浮点误差累积）
  const currentSpeed = Math.sqrt(
    rectangle.body.velocity.x ** 2 + 
    rectangle.body.velocity.y ** 2
  );
  
  const targetSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  
  // 如果速度发生变化，重新标准化
  if (Math.abs(currentSpeed - targetSpeed) > 0.1) {
    const scale = targetSpeed / currentSpeed;
    rectangle.setVelocity(
      rectangle.body.velocity.x * scale,
      rectangle.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);