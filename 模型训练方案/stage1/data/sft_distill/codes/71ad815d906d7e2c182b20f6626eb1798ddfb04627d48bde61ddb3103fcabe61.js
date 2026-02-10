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

let ellipse;

function preload() {
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆（中心x, 中心y, 宽度, 高度）
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  ellipse = this.physics.add.sprite(400, 300, 'ellipseTex');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  ellipse.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  ellipse.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // 物理系统自动处理边界反弹，无需额外逻辑
  // 但如果不使用 setCollideWorldBounds，可以手动检测：
  /*
  if (ellipse.x <= ellipse.width / 2 || ellipse.x >= 800 - ellipse.width / 2) {
    ellipse.body.velocity.x *= -1;
  }
  if (ellipse.y <= ellipse.height / 2 || ellipse.y >= 600 - ellipse.height / 2) {
    ellipse.body.velocity.y *= -1;
  }
  */
}

new Phaser.Game(config);