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
let objectsGroup;
let statusText;

function preload() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('grayCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建状态显示文本
  statusText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 创建物理组
  objectsGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 8 个灰色物体
  for (let i = 0; i < 8; i++) {
    // 随机位置（避免边界太近）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const object = objectsGroup.create(x, y, 'grayCircle');
    
    // 设置物体属性
    object.setCircle(20); // 设置圆形碰撞体
    object.setBounce(1); // 完全弹性碰撞
    object.setCollideWorldBounds(true); // 与边界碰撞
    
    // 设置随机速度方向，速度大小为 120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    
    object.setVelocity(velocityX, velocityY);
  }

  // 设置物体间的碰撞检测
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);
  
  // 确保世界边界碰撞启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function handleCollision(obj1, obj2) {
  // 碰撞时增加计数
  collisionCount++;
  statusText.setText('Collisions: ' + collisionCount);
}

function update(time, delta) {
  // 确保所有物体保持恒定速度 120
  objectsGroup.children.entries.forEach(object => {
    const body = object.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // 如果速度不是 120，重新归一化
    if (Math.abs(currentSpeed - 120) > 1) {
      const scale = 120 / currentSpeed;
      body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
    }
  });
}

new Phaser.Game(config);