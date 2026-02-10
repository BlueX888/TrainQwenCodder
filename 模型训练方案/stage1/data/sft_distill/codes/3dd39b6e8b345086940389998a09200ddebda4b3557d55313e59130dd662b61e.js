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

// 状态变量：用于验证碰撞系统是否正常工作
let collisionCount = 0;
let objectsGroup;
let collisionText;

function preload() {
  // 使用 Graphics 创建黄色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('yellowCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objectsGroup = this.physics.add.group({
    key: 'yellowCircle',
    repeat: 14, // 创建 15 个对象 (0-14)
    setXY: {
      x: 100,
      y: 100,
      stepX: 0,
      stepY: 0
    }
  });

  // 配置每个物体
  objectsGroup.children.iterate((child) => {
    // 随机位置
    child.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置随机速度方向，速度大小为 160
    const angle = Phaser.Math.Between(0, 360);
    const velocity = this.physics.velocityFromAngle(angle, 160);
    child.setVelocity(velocity.x, velocity.y);

    // 设置反弹属性
    child.setBounce(1, 1);
    
    // 设置边界碰撞
    child.setCollideWorldBounds(true);

    // 设置圆形碰撞体（更精确）
    child.body.setCircle(16);
  });

  // 启用物体间碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);

  // 显示碰撞计数文本（验证状态）
  collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示物体数量文本
  this.add.text(10, 40, 'Objects: 15', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示速度信息
  this.add.text(10, 70, 'Speed: 160 px/s', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 确保速度保持在 160 左右（由于浮点误差可能会有微小变化）
  objectsGroup.children.iterate((child) => {
    const currentSpeed = Math.sqrt(
      child.body.velocity.x ** 2 + child.body.velocity.y ** 2
    );
    
    // 如果速度偏差超过 5%，重新归一化
    if (Math.abs(currentSpeed - 160) > 8) {
      const normalizedVelocity = child.body.velocity.normalize().scale(160);
      child.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
    }
  });
}

function handleCollision(obj1, obj2) {
  // 增加碰撞计数
  collisionCount++;
  collisionText.setText('Collisions: ' + collisionCount);
  
  // 可选：添加视觉反馈
  obj1.setTint(0xffffff);
  obj2.setTint(0xffffff);
  
  // 短暂延迟后恢复颜色
  setTimeout(() => {
    obj1.clearTint();
    obj2.clearTint();
  }, 100);
}

const game = new Phaser.Game(config);