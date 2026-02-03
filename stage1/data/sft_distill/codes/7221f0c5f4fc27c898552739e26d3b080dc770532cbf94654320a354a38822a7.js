const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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
let objectCount = 15;
let targetSpeed = 360;

function preload() {
  // 创建白色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('whiteCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const objects = this.physics.add.group({
    key: 'whiteCircle',
    repeat: objectCount - 1,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  objects.children.iterate((object) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);

    // 随机方向，固定速度 360
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * targetSpeed;
    const vy = Math.sin(angle) * targetSpeed;
    object.setVelocity(vx, vy);

    // 设置圆形碰撞体
    object.setCircle(16);
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(objects, objects, onCollision, null, this);

  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 更新状态显示
  this.events.on('update', () => {
    statusText.setText([
      `Objects: ${objectCount}`,
      `Speed: ${targetSpeed}`,
      `Collisions: ${collisionCount}`
    ]);
  });
}

function update(time, delta) {
  // 每帧更新逻辑（如需要可在此添加）
}

function onCollision(obj1, obj2) {
  // 碰撞计数器
  collisionCount++;
}

new Phaser.Game(config);