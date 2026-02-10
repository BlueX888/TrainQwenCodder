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

// 游戏状态变量
let collisionCount = 0;
let activeObjects = 0;
let totalBounces = 0;

function preload() {
  // 使用 Graphics 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('redCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 重置状态变量
  collisionCount = 0;
  activeObjects = 20;
  totalBounces = 0;

  // 创建物理组
  const objects = this.physics.add.group({
    key: 'redCircle',
    repeat: 19, // 创建20个物体 (1 + 19)
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 设置每个物体的随机位置和速度
  const speed = 240;
  objects.children.iterate((object) => {
    // 随机位置
    object.x = Phaser.Math.Between(50, 750);
    object.y = Phaser.Math.Between(50, 550);

    // 随机方向的速度，保持速度大小为240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    object.setVelocity(vx, vy);
    
    // 设置圆形碰撞体
    object.setCircle(16);
  });

  // 添加物体间的碰撞检测
  this.physics.add.collider(objects, objects, handleCollision, null, this);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 监听世界边界碰撞
  objects.children.iterate((object) => {
    object.body.onWorldBounds = true;
  });

  this.physics.world.on('worldbounds', () => {
    totalBounces++;
  });
}

function handleCollision(obj1, obj2) {
  // 记录碰撞次数
  collisionCount++;
}

function update() {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText([
      `Active Objects: ${activeObjects}`,
      `Object Collisions: ${collisionCount}`,
      `Wall Bounces: ${totalBounces}`,
      `Speed: 240 px/s`
    ]);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);