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

// 状态变量
let collisionCount = 0;
let objectsGroup;
let collisionText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('blueCircle', 40, 40);
  graphics.destroy();

  // 创建物理组
  objectsGroup = this.physics.add.group({
    defaultKey: 'blueCircle',
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 8 个物体
  for (let i = 0; i < 8; i++) {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = objectsGroup.create(x, y, 'blueCircle');
    
    // 设置随机方向的速度，速度大小为 300
    const angle = Phaser.Math.Between(0, 360);
    const velocityX = Math.cos(angle * Math.PI / 180) * 300;
    const velocityY = Math.sin(angle * Math.PI / 180) * 300;
    
    obj.setVelocity(velocityX, velocityY);
    obj.setBounce(1, 1);
    obj.setCollideWorldBounds(true);
    
    // 设置圆形碰撞体
    obj.body.setCircle(20);
  }

  // 启用组内物体之间的碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, onCollision, null, this);

  // 显示碰撞计数
  collisionText = this.add.text(16, 16, 'Collisions: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 更新碰撞计数显示
  collisionText.setText('Collisions: ' + collisionCount);
  
  // 确保物体速度保持在 300 左右（防止浮点误差累积）
  objectsGroup.getChildren().forEach(obj => {
    const body = obj.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // 如果速度偏差超过 5%，进行修正
    if (Math.abs(currentSpeed - 300) > 15) {
      const scale = 300 / currentSpeed;
      body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
    }
  });
}

function onCollision(obj1, obj2) {
  // 增加碰撞计数
  collisionCount++;
  
  // 可选：添加视觉反馈
  obj1.setTint(0xffffff);
  obj2.setTint(0xffffff);
  
  // 0.1秒后恢复颜色
  setTimeout(() => {
    obj1.clearTint();
    obj2.clearTint();
  }, 100);
}

const game = new Phaser.Game(config);