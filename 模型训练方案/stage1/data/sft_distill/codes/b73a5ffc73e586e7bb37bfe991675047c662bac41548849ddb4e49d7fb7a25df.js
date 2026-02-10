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

// 状态信号：记录碰撞次数
let collisionCount = 0;
let objectsGroup;
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00FFFF, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('cyanBall', 32, 32);
  graphics.destroy();

  // 创建物理组
  objectsGroup = this.physics.add.group({
    key: 'cyanBall',
    repeat: 14, // 创建15个对象 (1 + 14)
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  const objects = objectsGroup.getChildren();
  objects.forEach((obj, index) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    obj.setPosition(x, y);

    // 随机方向，固定速度200
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 200;
    const velocityY = Math.sin(angle) * 200;
    obj.setVelocity(velocityX, velocityY);

    // 设置圆形碰撞体
    obj.body.setCircle(16);
  });

  // 设置物体间的碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, onCollision, null, this);

  // 显示状态信息
  statusText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#00FFFF',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(100);

  // 添加说明文字
  this.add.text(10, 570, '15 cyan objects moving at speed 200, bouncing on collision', {
    fontSize: '14px',
    fill: '#FFFFFF'
  });
}

function update(time, delta) {
  // 确保所有物体保持200的速度
  const objects = objectsGroup.getChildren();
  objects.forEach(obj => {
    const currentSpeed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    
    // 如果速度偏差较大，重新标准化到200
    if (Math.abs(currentSpeed - 200) > 1) {
      const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
      obj.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
    }
  });

  // 更新状态显示
  statusText.setText(`Collisions: ${collisionCount}\nObjects: ${objects.length}`);
}

function onCollision(obj1, obj2) {
  // 碰撞回调：增加碰撞计数
  collisionCount++;
  
  // 可选：添加视觉反馈
  obj1.setTint(0xFFFFFF);
  obj2.setTint(0xFFFFFF);
  
  // 短暂延迟后恢复颜色
  setTimeout(() => {
    obj1.clearTint();
    obj2.clearTint();
  }, 100);
}

// 启动游戏
const game = new Phaser.Game(config);