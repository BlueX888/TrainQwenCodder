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
let activeObjectsCount = 0;
let collisionCount = 0;

function preload() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('cyanBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const objectsGroup = this.physics.add.group({
    key: 'cyanBall',
    repeat: 14, // 创建15个物体（0-14）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  objectsGroup.children.entries.forEach((obj, index) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    obj.setPosition(x, y);

    // 随机方向，固定速度200
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 200;
    const velocityY = Math.sin(angle) * 200;
    obj.setVelocity(velocityX, velocityY);

    // 设置圆形物理体
    obj.setCircle(16);
  });

  // 设置物体间的碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);

  // 更新状态信号
  activeObjectsCount = objectsGroup.children.entries.length;

  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(100);

  // 存储到场景数据中供 update 使用
  this.statusText = statusText;
  this.objectsGroup = objectsGroup;
}

function update() {
  // 更新状态显示
  if (this.statusText && this.objectsGroup) {
    activeObjectsCount = this.objectsGroup.children.entries.length;
    this.statusText.setText([
      `Active Objects: ${activeObjectsCount}`,
      `Collisions: ${collisionCount}`,
      `Speed: 200 px/s`
    ]);
  }
}

function handleCollision(obj1, obj2) {
  // 碰撞计数
  collisionCount++;
  
  // 碰撞后保持速度大小为200
  // Arcade Physics 的 bounce 会自动处理反弹方向
  // 这里确保速度大小保持在200左右
  const velocity1 = obj1.body.velocity;
  const speed1 = Math.sqrt(velocity1.x * velocity1.x + velocity1.y * velocity1.y);
  if (speed1 > 0 && Math.abs(speed1 - 200) > 10) {
    const scale = 200 / speed1;
    obj1.setVelocity(velocity1.x * scale, velocity1.y * scale);
  }

  const velocity2 = obj2.body.velocity;
  const speed2 = Math.sqrt(velocity2.x * velocity2.x + velocity2.y * velocity2.y);
  if (speed2 > 0 && Math.abs(speed2 - 200) > 10) {
    const scale = 200 / speed2;
    obj2.setVelocity(velocity2.x * scale, velocity2.y * scale);
  }
}

// 启动游戏
const game = new Phaser.Game(config);