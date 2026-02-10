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

// 状态信号变量
let collisionCount = 0;
let objectsCreated = 0;

function preload() {
  // 使用 Graphics 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('greenBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const balls = this.physics.add.group({
    key: 'greenBall',
    repeat: 9, // 创建 10 个物体（0-9）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  balls.children.entries.forEach((ball, index) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    ball.setPosition(x, y);

    // 生成随机角度，计算速度分量使总速度为 240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 240;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    ball.setVelocity(vx, vy);
    
    objectsCreated++;
  });

  // 启用物体间碰撞检测
  this.physics.add.collider(balls, balls, onCollision, null, this);

  // 添加文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 更新状态显示
  this.statusText.setText([
    `Objects: ${objectsCreated}`,
    `Collisions: ${collisionCount}`,
    `Speed: 240 px/s`
  ]);
}

// 碰撞回调函数
function onCollision(ball1, ball2) {
  collisionCount++;
}

new Phaser.Game(config);