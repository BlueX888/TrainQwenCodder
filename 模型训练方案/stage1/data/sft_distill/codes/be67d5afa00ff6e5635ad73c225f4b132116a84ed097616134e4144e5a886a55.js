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
let velocityX = 160;
let velocityY = 160;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用Graphics绘制黄色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('yellowSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'yellowSquare');
  
  // 设置初始速度
  square.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  square.setCollideWorldBounds(true);
  square.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // 物理引擎的bounce属性会自动处理反弹
  // 但为了确保速度恒定为160，我们手动检测边界
  const speed = 160;
  
  // 获取当前速度
  const currentVelocity = square.body.velocity;
  
  // 归一化速度并乘以固定速度值，保持恒定速度
  const magnitude = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
  
  if (magnitude > 0) {
    square.setVelocity(
      (currentVelocity.x / magnitude) * speed,
      (currentVelocity.y / magnitude) * speed
    );
  }
}

new Phaser.Game(config);