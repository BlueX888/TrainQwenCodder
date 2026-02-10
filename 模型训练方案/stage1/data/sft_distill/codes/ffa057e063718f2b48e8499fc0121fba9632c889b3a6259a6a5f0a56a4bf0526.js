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

let ellipse;
let velocity = { x: 200, y: 200 };

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(50, 40, 100, 80); // 绘制椭圆（中心点，宽度，高度）
  graphics.generateTexture('ellipseTex', 100, 80);
  graphics.destroy();

  // 创建物理精灵
  ellipse = this.physics.add.sprite(400, 300, 'ellipseTex');
  
  // 设置初始速度
  ellipse.setVelocity(velocity.x, velocity.y);
  
  // 设置世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

function update(time, delta) {
  // Arcade 物理系统的 setCollideWorldBounds 和 setBounce 
  // 会自动处理边界碰撞和反弹，无需手动编写逻辑
  
  // 如果需要确保速度保持恒定（避免浮点误差累积）
  const currentVelocity = ellipse.body.velocity;
  const speed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
  
  // 如果速度有偏差，重新标准化
  if (Math.abs(speed - 282.84) > 1) { // 200*sqrt(2) ≈ 282.84
    const angle = Math.atan2(currentVelocity.y, currentVelocity.x);
    ellipse.setVelocity(
      Math.cos(angle) * 200 * Math.SQRT2,
      Math.sin(angle) * 200 * Math.SQRT2
    );
  }
}

new Phaser.Game(config);