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

// 可验证的状态信号
let collisionCount = 0;
let activeObjects = 0;
let totalDistance = 0;

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('blueCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const blueObjects = this.physics.add.group({
    key: 'blueCircle',
    repeat: 14, // 创建15个物体（第一个 + repeat 14个）
    setXY: {
      x: 100,
      y: 100,
      stepX: 0,
      stepY: 0
    }
  });

  // 设置每个物体的属性
  blueObjects.children.iterate((object, index) => {
    // 随机位置
    object.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置完全反弹
    object.setBounce(1);

    // 设置随机速度方向，速度大小为240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    object.setVelocity(velocityX, velocityY);

    // 启用世界边界碰撞
    object.setCollideWorldBounds(true);

    // 设置圆形碰撞体
    object.body.setCircle(16);
  });

  // 启用物体间的碰撞
  this.physics.add.collider(blueObjects, blueObjects, onCollision, null, this);

  // 更新活动物体数量
  activeObjects = blueObjects.getLength();

  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(1);

  // 保存引用用于 update
  this.statusText = statusText;
  this.blueObjects = blueObjects;
}

function update(time, delta) {
  // 计算总移动距离
  if (this.blueObjects) {
    this.blueObjects.children.iterate((object) => {
      const speed = Math.sqrt(
        object.body.velocity.x ** 2 + 
        object.body.velocity.y ** 2
      );
      totalDistance += speed * (delta / 1000);
    });
  }

  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText([
      `Active Objects: ${activeObjects}`,
      `Collisions: ${collisionCount}`,
      `Total Distance: ${Math.floor(totalDistance)} px`,
      `Speed: 240 px/s`
    ]);
  }
}

function onCollision(object1, object2) {
  // 碰撞计数器递增
  collisionCount++;
  
  // 可选：添加视觉反馈
  object1.setTint(0xffff00);
  object2.setTint(0xffff00);
  
  // 短暂延迟后恢复颜色
  setTimeout(() => {
    object1.clearTint();
    object2.clearTint();
  }, 100);
}

// 启动游戏
const game = new Phaser.Game(config);