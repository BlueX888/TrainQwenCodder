const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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
let statusText;

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径16的圆形
  graphics.generateTexture('cyanCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objectsGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 10 个青色物体
  for (let i = 0; i < 10; i++) {
    // 随机位置（避免太靠近边缘）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 创建精灵
    const obj = objectsGroup.create(x, y, 'cyanCircle');
    
    // 设置随机方向的速度，速率为 360
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 360;
    const velocityY = Math.sin(angle) * 360;
    
    obj.setVelocity(velocityX, velocityY);
    
    // 设置物体属性
    obj.setCircle(16); // 设置碰撞体为圆形
    obj.setBounce(1); // 完全弹性碰撞
  }

  // 设置组内碰撞检测
  this.physics.add.collider(objectsGroup, objectsGroup, handleCollision, null, this);

  // 显示状态信息
  statusText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 更新状态文本
  statusText.setText(`Collisions: ${collisionCount}\nObjects: ${objectsGroup.getChildren().length}`);
  
  // 确保速度保持恒定（修正浮点误差）
  objectsGroup.getChildren().forEach(obj => {
    const body = obj.body;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // 如果速度偏离360，重新归一化
    if (Math.abs(currentSpeed - 360) > 1) {
      const scale = 360 / currentSpeed;
      body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
    }
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
  
  // 碰撞时产生视觉反馈（短暂变色）
  obj1.setTint(0xffffff);
  obj2.setTint(0xffffff);
  
  // 200ms后恢复原色
  setTimeout(() => {
    obj1.clearTint();
    obj2.clearTint();
  }, 200);
}

// 启动游戏
const game = new Phaser.Game(config);