// 完整的 Phaser3 代码
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

// 状态变量 - 用于验证游戏运行
let collisionCount = 0;
let redObjects;
let collisionText;

function preload() {
  // 使用 Graphics 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('redCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建碰撞计数文本显示
  collisionText = this.add.text(10, 10, 'Collisions: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 创建物理组
  redObjects = this.physics.add.group({
    key: 'redCircle',
    repeat: 4, // 创建5个物体（1个初始 + 4个重复）
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个物体设置随机位置和速度
  const speed = 120;
  redObjects.children.iterate((child, index) => {
    // 随机位置（避免边缘生成）
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    child.setPosition(x, y);

    // 随机方向的速度（确保速度大小为120）
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    child.setVelocity(vx, vy);

    // 设置圆形碰撞体
    child.setCircle(20);
  });

  // 添加物体间的碰撞检测
  this.physics.add.collider(redObjects, redObjects, handleCollision, null, this);
}

function update(time, delta) {
  // 确保物体速度保持在120
  redObjects.children.iterate((child) => {
    const velocity = child.body.velocity;
    const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 如果速度发生变化，重新归一化到120
    if (Math.abs(currentSpeed - 120) > 1) {
      const scale = 120 / currentSpeed;
      child.setVelocity(velocity.x * scale, velocity.y * scale);
    }
  });
}

// 碰撞处理函数
function handleCollision(obj1, obj2) {
  collisionCount++;
  collisionText.setText('Collisions: ' + collisionCount);
  
  // 在碰撞点显示短暂的白色闪光效果
  const flashX = (obj1.x + obj2.x) / 2;
  const flashY = (obj1.y + obj2.y) / 2;
  const flash = this.add.circle(flashX, flashY, 10, 0xffffff, 0.8);
  
  this.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 200,
    onComplete: () => {
      flash.destroy();
    }
  });
}

// 启动游戏
const game = new Phaser.Game(config);