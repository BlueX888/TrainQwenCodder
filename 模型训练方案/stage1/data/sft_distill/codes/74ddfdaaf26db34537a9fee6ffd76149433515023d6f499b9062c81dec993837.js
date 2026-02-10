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

// 状态信号
let collisionCount = 0;
let objectCount = 10;
let velocityMagnitude = 200;

function preload() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('purpleCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const purpleGroup = this.physics.add.group({
    key: 'purpleCircle',
    repeat: objectCount - 1, // 创建10个物体
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  purpleGroup.children.iterate((child) => {
    // 随机位置（避免边缘）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    child.setPosition(x, y);

    // 随机方向，固定速度200
    const angle = Phaser.Math.Between(0, 360);
    const vx = Math.cos(angle * Math.PI / 180) * velocityMagnitude;
    const vy = Math.sin(angle * Math.PI / 180) * velocityMagnitude;
    child.setVelocity(vx, vy);

    // 设置碰撞体
    child.setCircle(16);
  });

  // 添加物体间碰撞检测
  this.physics.add.collider(purpleGroup, purpleGroup, handleCollision, null, this);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 存储组引用以便在 update 中使用
  this.purpleGroup = purpleGroup;
}

function update(time, delta) {
  // 更新状态显示
  this.statusText.setText([
    `Objects: ${objectCount}`,
    `Velocity: ${velocityMagnitude}`,
    `Collisions: ${collisionCount}`
  ]);

  // 确保物体速度保持在200左右（由于浮点误差可能会有微小变化）
  this.purpleGroup.children.iterate((child) => {
    const currentSpeed = Math.sqrt(child.body.velocity.x ** 2 + child.body.velocity.y ** 2);
    
    // 如果速度偏差超过5%，重新归一化
    if (Math.abs(currentSpeed - velocityMagnitude) > velocityMagnitude * 0.05) {
      const scale = velocityMagnitude / currentSpeed;
      child.setVelocity(
        child.body.velocity.x * scale,
        child.body.velocity.y * scale
      );
    }
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
  
  // 可选：添加视觉反馈
  obj1.setTint(0xff00ff);
  obj2.setTint(0xff00ff);
  
  // 0.1秒后恢复原色
  setTimeout(() => {
    obj1.clearTint();
    obj2.clearTint();
  }, 100);
}

const game = new Phaser.Game(config);