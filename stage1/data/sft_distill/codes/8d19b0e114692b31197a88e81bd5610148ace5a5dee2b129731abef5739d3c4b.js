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
let objectsGroup;
let collisionText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(15, 15, 15);
  graphics.generateTexture('blueCircle', 30, 30);
  graphics.destroy();

  // 创建物理组
  objectsGroup = this.physics.add.group({
    key: 'blueCircle',
    repeat: 14, // 创建15个对象（1个默认 + 14个重复）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  objectsGroup.children.iterate((object) => {
    // 随机位置
    object.x = Phaser.Math.Between(50, 750);
    object.y = Phaser.Math.Between(50, 550);
    
    // 随机方向，但速度模为 240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 240;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    object.setVelocity(vx, vy);
    object.setBounce(1, 1);
    object.setCollideWorldBounds(true);
  });

  // 设置物体间碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);

  // 显示碰撞计数
  collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示物体数量信息
  this.add.text(10, 40, 'Blue Objects: 15', {
    fontSize: '16px',
    fill: '#3498db',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示速度信息
  this.add.text(10, 70, 'Speed: 240 px/s', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 确保速度保持在 240
  objectsGroup.children.iterate((object) => {
    const body = object.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // 如果速度偏离 240，重新归一化
    if (Math.abs(currentSpeed - 240) > 1) {
      const scale = 240 / currentSpeed;
      body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
    }
  });
}

function handleCollision(object1, object2) {
  // 碰撞时增加计数器
  collisionCount++;
  collisionText.setText('Collisions: ' + collisionCount);
  
  // 碰撞后确保速度保持为 240
  [object1, object2].forEach(obj => {
    const body = obj.body;
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    if (speed > 0) {
      const scale = 240 / speed;
      body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
    }
  });
}

// 启动游戏
new Phaser.Game(config);