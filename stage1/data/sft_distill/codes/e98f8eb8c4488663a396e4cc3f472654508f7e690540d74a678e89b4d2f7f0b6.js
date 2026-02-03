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
let objects;
let collisionText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(20, 20, 20); // 半径20的圆
  graphics.generateTexture('cyanCircle', 40, 40);
  graphics.destroy();

  // 创建物理组
  objects = this.physics.add.group({
    key: 'cyanCircle',
    repeat: 9, // 创建10个对象 (0-9)
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 为每个物体设置属性
  objects.children.iterate((child) => {
    // 设置随机方向的速度，总速度为80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 80;
    const velocityY = Math.sin(angle) * 80;
    
    child.setVelocity(velocityX, velocityY);
    
    // 设置完全反弹
    child.setBounce(1, 1);
    
    // 设置与世界边界碰撞
    child.setCollideWorldBounds(true);
    
    // 随机初始位置，避免重叠
    child.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );
  });

  // 添加组内碰撞检测
  this.physics.add.collider(objects, objects, handleCollision, null, this);

  // 显示碰撞计数（状态验证）
  collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加速度信息文本
  this.add.text(10, 45, 'Speed: 80 pixels/sec', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加对象数量文本
  this.add.text(10, 75, 'Objects: 10', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function handleCollision(obj1, obj2) {
  // 增加碰撞计数
  collisionCount++;
  
  // 更新显示
  if (collisionText) {
    collisionText.setText('Collisions: ' + collisionCount);
  }
}

function update(time, delta) {
  // 确保所有物体保持恒定速度80
  objects.children.iterate((child) => {
    const currentSpeed = Math.sqrt(
      child.body.velocity.x * child.body.velocity.x + 
      child.body.velocity.y * child.body.velocity.y
    );
    
    // 如果速度偏差较大，重新归一化到80
    if (Math.abs(currentSpeed - 80) > 0.1) {
      const scale = 80 / currentSpeed;
      child.setVelocity(
        child.body.velocity.x * scale,
        child.body.velocity.y * scale
      );
    }
  });
}

// 启动游戏
const game = new Phaser.Game(config);