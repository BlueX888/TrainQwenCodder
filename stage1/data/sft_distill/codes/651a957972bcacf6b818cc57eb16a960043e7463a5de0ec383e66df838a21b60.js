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
let activeObjects = 0;
let statusText;

function preload() {
  // 使用 Graphics 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('greenBall', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const objects = this.physics.add.group({
    key: 'greenBall',
    repeat: 9, // 创建 10 个物体（0-9）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  objects.children.entries.forEach((obj, index) => {
    // 随机位置
    obj.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 随机方向，固定速度 240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    obj.setVelocity(velocityX, velocityY);

    // 设置圆形碰撞体
    obj.setCircle(20);
  });

  // 设置组内碰撞检测
  this.physics.add.collider(objects, objects, () => {
    collisionCount++;
  });

  // 更新活跃对象数量
  activeObjects = objects.children.entries.length;

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(10, 570, '绿色物体以 240 速度随机移动，碰撞时反弹', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  // 保存引用供 update 使用
  this.objects = objects;
}

function update(time, delta) {
  // 更新状态信息
  if (statusText) {
    statusText.setText([
      `活跃物体数: ${activeObjects}`,
      `总碰撞次数: ${collisionCount}`,
      `运行时间: ${Math.floor(time / 1000)}s`
    ]);
  }

  // 验证所有物体保持 240 速度（由于浮点误差可能有微小偏差）
  if (this.objects) {
    this.objects.children.entries.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      // 如果速度偏离太多，重新归一化到 240
      if (Math.abs(speed - 240) > 1) {
        const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
        obj.setVelocity(Math.cos(angle) * 240, Math.sin(angle) * 240);
      }
    });
  }
}

new Phaser.Game(config);