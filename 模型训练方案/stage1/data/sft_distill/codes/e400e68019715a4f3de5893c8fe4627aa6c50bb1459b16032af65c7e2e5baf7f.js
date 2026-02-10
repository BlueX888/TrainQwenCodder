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

let diamond;
let velocity = { x: 80, y: 80 }; // 初始速度

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制菱形（四个顶点）
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamondTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  diamond = this.physics.add.sprite(400, 300, 'diamondTexture');
  
  // 设置初始速度（对角线方向，速度大小约为80）
  const speed = 80;
  const angle = Math.sqrt(2) / 2; // 45度角的分量
  diamond.setVelocity(speed * angle, speed * angle);
  
  // 设置碰撞边界
  diamond.setCollideWorldBounds(false); // 不使用内置碰撞，手动处理反弹
}

function update(time, delta) {
  // 检测左右边界碰撞
  if (diamond.x <= 32 || diamond.x >= 768) {
    diamond.setVelocityX(-diamond.body.velocity.x);
  }
  
  // 检测上下边界碰撞
  if (diamond.y <= 32 || diamond.y >= 568) {
    diamond.setVelocityY(-diamond.body.velocity.y);
  }
  
  // 确保速度保持在80左右（防止累积误差）
  const currentSpeed = Math.sqrt(
    diamond.body.velocity.x ** 2 + diamond.body.velocity.y ** 2
  );
  
  if (Math.abs(currentSpeed - 80) > 1) {
    const scale = 80 / currentSpeed;
    diamond.setVelocity(
      diamond.body.velocity.x * scale,
      diamond.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);