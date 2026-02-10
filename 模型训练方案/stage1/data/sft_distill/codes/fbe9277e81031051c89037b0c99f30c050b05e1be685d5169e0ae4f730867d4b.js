const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 不需要重力
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

let rectangle;
const SPEED = 80;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1);  // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkRect', 50, 50);
  graphics.destroy();

  // 创建物理精灵，放置在画布中心
  rectangle = this.physics.add.sprite(400, 300, 'pinkRect');

  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, SPEED);
  rectangle.setVelocity(velocity.x, velocity.y);

  // 设置与世界边界碰撞
  rectangle.setCollideWorldBounds(true);

  // 设置反弹系数为 1（完全弹性碰撞）
  rectangle.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（防止因浮点误差导致速度衰减）
  const currentSpeed = Math.sqrt(
    rectangle.body.velocity.x ** 2 + 
    rectangle.body.velocity.y ** 2
  );

  if (Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    rectangle.setVelocity(
      rectangle.body.velocity.x * scale,
      rectangle.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);