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

function preload() {
  // 使用 Graphics 生成蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('blueCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建物理组
  objectsGroup = this.physics.add.group({
    key: 'blueCircle',
    repeat: 14, // 创建15个物体（0-14）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });
  
  // 为每个物体设置随机位置和速度
  objectsGroup.children.iterate((object) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);
    
    // 随机方向，固定速度160
    const angle = Phaser.Math.Between(0, 360);
    const velocityX = Math.cos(angle * Math.PI / 180) * 160;
    const velocityY = Math.sin(angle * Math.PI / 180) * 160;
    object.setVelocity(velocityX, velocityY);
    
    // 设置碰撞体
    object.setCircle(16);
  });
  
  // 设置物体之间的碰撞检测
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);
  
  // 添加文本显示碰撞次数
  this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 更新碰撞计数显示
  this.collisionText.setText('Collisions: ' + collisionCount);
  
  // 确保所有物体保持恒定速度160
  objectsGroup.children.iterate((object) => {
    const currentSpeed = Math.sqrt(
      object.body.velocity.x ** 2 + 
      object.body.velocity.y ** 2
    );
    
    // 如果速度发生偏差，重新归一化到160
    if (Math.abs(currentSpeed - 160) > 0.1) {
      const normalizedVx = (object.body.velocity.x / currentSpeed) * 160;
      const normalizedVy = (object.body.velocity.y / currentSpeed) * 160;
      object.setVelocity(normalizedVx, normalizedVy);
    }
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

new Phaser.Game(config);