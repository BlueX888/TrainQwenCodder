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

// 全局信号对象，用于验证
window.__signals__ = {
  objects: [],
  collisionCount: 0,
  totalDistance: 0,
  updateCount: 0
};

let orangeGroup;
let lastUpdateTime = 0;

function preload() {
  // 使用 Graphics 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('orangeCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建物理组
  orangeGroup = this.physics.add.group({
    key: 'orangeCircle',
    repeat: 4, // 创建5个对象 (0-4)
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 为每个物体设置随机速度和碰撞属性
  orangeGroup.children.iterate((child, index) => {
    // 随机位置
    child.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );
    
    // 随机方向的速度，总速度为240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    
    child.setVelocity(velocityX, velocityY);
    
    // 设置碰撞属性
    child.setBounce(1, 1); // 完全弹性碰撞
    child.setCollideWorldBounds(true); // 与世界边界碰撞
    
    // 初始化信号数据
    window.__signals__.objects.push({
      id: index,
      x: child.x,
      y: child.y,
      velocityX: velocityX,
      velocityY: velocityY,
      collisions: 0
    });
  });

  // 添加物体之间的碰撞检测
  this.physics.add.collider(orangeGroup, orangeGroup, handleCollision, null, this);
  
  console.log(JSON.stringify({
    event: 'game_initialized',
    objectCount: 5,
    speed: 240,
    timestamp: Date.now()
  }));
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  window.__signals__.collisionCount++;
  
  // 获取物体索引
  const index1 = orangeGroup.getChildren().indexOf(obj1);
  const index2 = orangeGroup.getChildren().indexOf(obj2);
  
  if (index1 >= 0) {
    window.__signals__.objects[index1].collisions++;
  }
  if (index2 >= 0) {
    window.__signals__.objects[index2].collisions++;
  }
  
  // 输出碰撞日志
  console.log(JSON.stringify({
    event: 'collision',
    obj1: index1,
    obj2: index2,
    totalCollisions: window.__signals__.collisionCount,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  window.__signals__.updateCount++;
  
  // 每秒更新一次位置信息
  if (time - lastUpdateTime > 1000) {
    lastUpdateTime = time;
    
    let totalDistance = 0;
    
    orangeGroup.children.iterate((child, index) => {
      const obj = window.__signals__.objects[index];
      
      // 计算移动距离
      const dx = child.x - obj.x;
      const dy = child.y - obj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalDistance += distance;
      
      // 更新位置和速度信息
      obj.x = child.x;
      obj.y = child.y;
      obj.velocityX = child.body.velocity.x;
      obj.velocityY = child.body.velocity.y;
      
      // 验证速度是否保持在240左右
      const currentSpeed = Math.sqrt(
        child.body.velocity.x ** 2 + child.body.velocity.y ** 2
      );
      obj.currentSpeed = Math.round(currentSpeed);
    });
    
    window.__signals__.totalDistance += totalDistance;
    
    // 输出状态日志
    console.log(JSON.stringify({
      event: 'update',
      collisionCount: window.__signals__.collisionCount,
      totalDistance: Math.round(window.__signals__.totalDistance),
      objects: window.__signals__.objects.map(obj => ({
        id: obj.id,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
        speed: obj.currentSpeed,
        collisions: obj.collisions
      })),
      timestamp: Date.now()
    }));
  }
}

// 启动游戏
new Phaser.Game(config);