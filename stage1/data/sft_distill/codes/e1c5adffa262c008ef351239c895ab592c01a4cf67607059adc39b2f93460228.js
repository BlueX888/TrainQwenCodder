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
  backgroundColor: '#ffffff'
};

let square;
const SPEED = 360;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('squareTex', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'squareTex');
  
  // 设置碰撞世界边界
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  square.setBounce(1, 1);
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * SPEED;
  const velocityY = Math.sin(angle) * SPEED;
  square.setVelocity(velocityX, velocityY);
}

function update(time, delta) {
  // 保持恒定速度 360
  const currentVelocity = square.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度发生变化，重新归一化到 360
  if (Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    square.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);