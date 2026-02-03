const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
let objectCount = 8;
let objectsGroup;

function preload() {
  // 使用 Graphics 生成白色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('whiteCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objectsGroup = this.physics.add.group({
    key: 'whiteCircle',
    repeat: objectCount - 1,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  const objects = objectsGroup.getChildren();
  objects.forEach((obj, index) => {
    // 随机位置（避免边缘）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    obj.setPosition(x, y);

    // 随机角度，固定速度200
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 200;
    const velocityY = Math.sin(angle) * 200;
    obj.setVelocity(velocityX, velocityY);

    // 设置反弹系数
    obj.setBounce(1);
    obj.setCollideWorldBounds(true);
  });

  // 设置物体间碰撞检测
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  updateStatusText.call(this);
}

function update(time, delta) {
  updateStatusText.call(this);
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

function updateStatusText() {
  this.statusText.setText([
    `Objects: ${objectCount}`,
    `Collisions: ${collisionCount}`,
    `Speed: 200 px/s`
  ]);
}

new Phaser.Game(config);