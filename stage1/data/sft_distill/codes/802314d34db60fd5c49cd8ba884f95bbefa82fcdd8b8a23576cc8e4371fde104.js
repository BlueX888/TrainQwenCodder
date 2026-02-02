const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
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
const SPEED = 80;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制菱形（四个顶点）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size);  // 右顶点
  graphics.lineTo(size, size * 2);  // 下顶点
  graphics.lineTo(0, size);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, SPEED);
  diamond.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  diamond.setCollideWorldBounds(true);
  diamond.setBounce(1, 1); // 完全弹性碰撞
  
  // 确保世界边界碰撞启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 保持恒定速度（修正因碰撞可能产生的速度衰减）
  const currentSpeed = Math.sqrt(
    diamond.body.velocity.x ** 2 + 
    diamond.body.velocity.y ** 2
  );
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    diamond.setVelocity(
      diamond.body.velocity.x * scale,
      diamond.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);