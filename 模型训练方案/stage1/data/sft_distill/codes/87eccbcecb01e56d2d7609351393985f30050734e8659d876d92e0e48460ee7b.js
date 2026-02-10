const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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

// 可验证状态信号
let collisionCount = 0;
let objectsMoving = 0;
let statusText;

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00CED1, 1); // 青色
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('cyanBall', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const balls = this.physics.add.group({
    key: 'cyanBall',
    repeat: 9, // 创建 10 个物体（0-9）
    setXY: {
      x: 100,
      y: 100,
      stepX: 70,
      stepY: 0
    }
  });

  // 为每个物体设置属性
  balls.children.iterate((ball) => {
    // 设置随机位置
    ball.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置随机方向，但保持速度为 360
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 360;
    const velocityY = Math.sin(angle) * 360;
    ball.setVelocity(velocityX, velocityY);

    // 设置反弹系数为 1（完全弹性碰撞）
    ball.setBounce(1, 1);

    // 设置世界边界碰撞
    ball.setCollideWorldBounds(true);

    objectsMoving++;
  });

  // 设置物体间的碰撞检测
  this.physics.add.collider(balls, balls, onCollision, null, this);

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#00CED1',
    fontFamily: 'Arial'
  });

  updateStatusText();
}

function update(time, delta) {
  updateStatusText();
}

function onCollision(ball1, ball2) {
  collisionCount++;
}

function updateStatusText() {
  statusText.setText([
    `Objects Moving: ${objectsMoving}`,
    `Total Collisions: ${collisionCount}`,
    `Speed: 360 px/s`
  ]);
}

new Phaser.Game(config);