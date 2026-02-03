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

let square;

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
  
  // 设置初始速度（360像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 360;
  const velocityY = Math.sin(angle * Math.PI / 180) * 360;
  square.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

function update(time, delta) {
  // 物理系统会自动处理边界反弹
  // 确保速度保持恒定（可选：防止浮点误差导致速度衰减）
  const currentSpeed = Math.sqrt(
    square.body.velocity.x ** 2 + 
    square.body.velocity.y ** 2
  );
  
  if (Math.abs(currentSpeed - 360) > 1) {
    const scale = 360 / currentSpeed;
    square.setVelocity(
      square.body.velocity.x * scale,
      square.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);