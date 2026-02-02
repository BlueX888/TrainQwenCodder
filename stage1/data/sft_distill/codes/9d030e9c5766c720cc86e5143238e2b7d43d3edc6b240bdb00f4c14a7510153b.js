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

let square;
const SPEED = 360;

function preload() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('graySquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'graySquare');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const vx = Math.cos(angle * Math.PI / 180) * SPEED;
  const vy = Math.sin(angle * Math.PI / 180) * SPEED;
  square.setVelocity(vx, vy);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

function update(time, delta) {
  // 保持速度恒定为360
  const currentSpeed = Math.sqrt(
    square.body.velocity.x * square.body.velocity.x + 
    square.body.velocity.y * square.body.velocity.y
  );
  
  if (currentSpeed > 0) {
    const scale = SPEED / currentSpeed;
    square.setVelocity(
      square.body.velocity.x * scale,
      square.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);