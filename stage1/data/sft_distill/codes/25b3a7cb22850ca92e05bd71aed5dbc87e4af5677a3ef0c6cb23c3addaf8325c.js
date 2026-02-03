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

// 全局状态信号
window.__signals__ = {
  objectCount: 0,
  totalCollisions: 0,
  bounceCount: 0,
  averageSpeed: 0,
  objectPositions: []
};

let objectsGroup;
let collisionCount = 0;
let bounceCount = 0;

function preload() {
  // 使用 Graphics 生成灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(16, 16, 16); // 半径 16 的圆形
  graphics.generateTexture('grayCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  objectsGroup = this.physics.add.group({
    key: 'grayCircle',
    repeat: 19, // 创建 20 个物体 (0-19)
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  const speed = 120;
  let index = 0;
  
  objectsGroup.children.iterate((child) => {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    child.setPosition(x, y);
    
    // 随机方向的速度（速度大小为 120）
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    child.setVelocity(vx, vy);
    
    // 设置碰撞体
    child.setCircle(16);
    child.setBounce(1);
    
    // 为每个物体添加标识
    child.objectId = index++;
  });

  // 设置物体之间的碰撞
  this.physics.add.collider(objectsGroup, objectsGroup, onCollision, null, this);

  // 初始化信号
  window.__signals__.objectCount = 20;
  updateSignals();

  // 添加文本显示
  this.add.text(10, 10, 'Gray Objects: 20', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setDepth(100);

  this.collisionText = this.add.text(10, 30, 'Collisions: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setDepth(100);

  this.bounceText = this.add.text(10, 50, 'Bounces: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setDepth(100);
}

function onCollision(obj1, obj2) {
  collisionCount++;
  
  // 输出碰撞日志
  console.log(JSON.stringify({
    type: 'collision',
    timestamp: Date.now(),
    obj1Id: obj1.objectId,
    obj2Id: obj2.objectId,
    position: { x: obj1.x, y: obj1.y },
    totalCollisions: collisionCount
  }));
}

function update(time, delta) {
  // 检测世界边界碰撞
  objectsGroup.children.iterate((child) => {
    const body = child.body;
    if (body.blocked.left || body.blocked.right || 
        body.blocked.up || body.blocked.down) {
      bounceCount++;
      
      // 输出边界反弹日志
      console.log(JSON.stringify({
        type: 'worldBounce',
        timestamp: Date.now(),
        objectId: child.objectId,
        position: { x: child.x, y: child.y },
        blocked: {
          left: body.blocked.left,
          right: body.blocked.right,
          up: body.blocked.up,
          down: body.blocked.down
        },
        totalBounces: bounceCount
      }));
    }
  });

  // 每 60 帧更新一次信号和显示
  if (time % 1000 < delta) {
    updateSignals();
    
    if (this.collisionText) {
      this.collisionText.setText('Collisions: ' + collisionCount);
    }
    if (this.bounceText) {
      this.bounceText.setText('Bounces: ' + bounceCount);
    }
  }
}

function updateSignals() {
  const positions = [];
  let totalSpeed = 0;
  
  objectsGroup.children.iterate((child) => {
    positions.push({
      id: child.objectId,
      x: Math.round(child.x),
      y: Math.round(child.y),
      vx: Math.round(child.body.velocity.x * 100) / 100,
      vy: Math.round(child.body.velocity.y * 100) / 100
    });
    
    const speed = Math.sqrt(
      child.body.velocity.x ** 2 + child.body.velocity.y ** 2
    );
    totalSpeed += speed;
  });

  window.__signals__.objectPositions = positions;
  window.__signals__.totalCollisions = collisionCount;
  window.__signals__.bounceCount = bounceCount;
  window.__signals__.averageSpeed = Math.round(totalSpeed / 20 * 100) / 100;
}

const game = new Phaser.Game(config);