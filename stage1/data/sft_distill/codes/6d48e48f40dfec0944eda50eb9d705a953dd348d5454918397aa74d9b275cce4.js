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
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵并放置在画布中心
  this.ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（200的速度，斜向移动）
  // 使用勾股定理：vx² + vy² = 200²
  // 设置为45度角移动：vx = vy = 200/√2 ≈ 141.4
  this.ellipse.setVelocity(141.4, 141.4);
  
  // 设置边界碰撞
  this.ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完美反弹，不损失速度）
  this.ellipse.setBounce(1, 1);
}

function update(time, delta) {
  // 确保速度始终保持在200左右（由于浮点数误差可能会有微小变化）
  const body = this.ellipse.body;
  const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
  
  // 如果速度偏离200太多，进行修正
  if (Math.abs(currentSpeed - 200) > 1) {
    const scale = 200 / currentSpeed;
    body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
  }
}

new Phaser.Game(config);