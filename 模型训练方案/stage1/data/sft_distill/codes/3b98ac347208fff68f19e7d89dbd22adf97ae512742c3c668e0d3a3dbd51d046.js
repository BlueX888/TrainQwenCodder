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

let rectangle;
const SPEED = 240;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('yellowRect', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  rectangle = this.physics.add.sprite(400, 300, 'yellowRect');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  this.physics.velocityFromAngle(angle, SPEED, rectangle.body.velocity);
  
  // 设置碰撞边界
  rectangle.setCollideWorldBounds(true);
  rectangle.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // 检查边界碰撞并反转速度
  const bounds = this.physics.world.bounds;
  
  // 左右边界
  if (rectangle.x <= rectangle.width / 2 && rectangle.body.velocity.x < 0) {
    rectangle.body.velocity.x = Math.abs(rectangle.body.velocity.x);
  } else if (rectangle.x >= bounds.width - rectangle.width / 2 && rectangle.body.velocity.x > 0) {
    rectangle.body.velocity.x = -Math.abs(rectangle.body.velocity.x);
  }
  
  // 上下边界
  if (rectangle.y <= rectangle.height / 2 && rectangle.body.velocity.y < 0) {
    rectangle.body.velocity.y = Math.abs(rectangle.body.velocity.y);
  } else if (rectangle.y >= bounds.height - rectangle.height / 2 && rectangle.body.velocity.y > 0) {
    rectangle.body.velocity.y = -Math.abs(rectangle.body.velocity.y);
  }
  
  // 保持速度恒定为240
  const currentSpeed = Math.sqrt(
    rectangle.body.velocity.x ** 2 + 
    rectangle.body.velocity.y ** 2
  );
  
  if (currentSpeed !== 0 && Math.abs(currentSpeed - SPEED) > 1) {
    rectangle.body.velocity.x = (rectangle.body.velocity.x / currentSpeed) * SPEED;
    rectangle.body.velocity.y = (rectangle.body.velocity.y / currentSpeed) * SPEED;
  }
}

new Phaser.Game(config);