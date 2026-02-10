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

// 状态变量：记录碰撞次数
let collisionCount = 0;
let collisionText;

function preload() {
  // 使用 Graphics 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('redCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const redObjects = this.physics.add.group({
    key: 'redCircle',
    repeat: 19, // 创建 20 个物体（0-19）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  redObjects.children.iterate((object) => {
    // 随机位置（避免贴边）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    object.setPosition(x, y);

    // 随机方向，速度大小为 240
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    object.setVelocity(velocityX, velocityY);

    // 设置圆形碰撞体
    object.setCircle(16);
  });

  // 设置物体间的碰撞检测
  this.physics.add.collider(redObjects, redObjects, handleCollision, null, this);

  // 显示碰撞计数文本
  collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示物体数量文本
  this.add.text(10, 45, 'Red Objects: 20', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示速度信息
  this.add.text(10, 80, 'Speed: 240 px/s', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 每帧更新逻辑（如果需要）
}

// 碰撞处理函数
function handleCollision(obj1, obj2) {
  collisionCount++;
  collisionText.setText('Collisions: ' + collisionCount);
}

// 启动游戏
const game = new Phaser.Game(config);