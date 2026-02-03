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

// 状态信号 - 用于验证
let collisionCount = 0;
let bounceCount = 0;
let objectsGroup;

function preload() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(20, 20, 20); // 半径20的圆形
  graphics.generateTexture('grayCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 启用世界边界碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
  
  // 创建物理组
  objectsGroup = this.physics.add.group({
    defaultKey: 'grayCircle',
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });
  
  // 创建 8 个物体
  for (let i = 0; i < 8; i++) {
    // 随机位置（避免边界太近）
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    const obj = objectsGroup.create(x, y, 'grayCircle');
    
    // 设置圆形碰撞体
    obj.setCircle(20);
    obj.body.setOffset(0, 0);
    
    // 设置随机方向的速度，速度大小为 120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    
    obj.setVelocity(velocityX, velocityY);
  }
  
  // 设置物体之间的碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, onCollision, null, this);
  
  // 添加文本显示状态信号
  this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  this.bounceText = this.add.text(10, 40, 'Wall Bounces: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  this.speedText = this.add.text(10, 70, 'Speed: 120', {
    fontSize: '20px',
    fill: '#ffffff'
  });
}

function update() {
  // 检测边界反弹
  objectsGroup.children.entries.forEach(obj => {
    const body = obj.body;
    
    // 检测是否刚刚碰到边界
    if (body.blocked.left || body.blocked.right || 
        body.blocked.up || body.blocked.down) {
      bounceCount++;
    }
    
    // 确保速度保持在 120 左右（由于浮点误差可能会有微小变化）
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    if (Math.abs(currentSpeed - 120) > 1) {
      const ratio = 120 / currentSpeed;
      body.velocity.x *= ratio;
      body.velocity.y *= ratio;
    }
  });
  
  // 更新显示
  this.collisionText.setText('Collisions: ' + collisionCount);
  this.bounceText.setText('Wall Bounces: ' + bounceCount);
}

function onCollision(obj1, obj2) {
  // 物体碰撞回调
  collisionCount++;
  
  // 确保碰撞后速度保持为 120
  [obj1, obj2].forEach(obj => {
    const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    if (speed > 0) {
      const ratio = 120 / speed;
      obj.body.velocity.x *= ratio;
      obj.body.velocity.y *= ratio;
    }
  });
}

// 启动游戏
new Phaser.Game(config);