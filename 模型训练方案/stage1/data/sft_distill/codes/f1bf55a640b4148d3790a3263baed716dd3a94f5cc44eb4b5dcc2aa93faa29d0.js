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
let objectCount = 5;
let averageSpeed = 0;

function preload() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(20, 20, 20); // 半径20的圆
  graphics.generateTexture('pinkCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组
  const pinkObjects = this.physics.add.group({
    key: 'pinkCircle',
    repeat: 4, // 创建5个对象（0-4）
    setXY: {
      x: Phaser.Math.Between(100, 700),
      y: Phaser.Math.Between(100, 500),
      stepX: 0,
      stepY: 0
    }
  });

  // 为每个物体设置属性
  pinkObjects.children.entries.forEach((obj, index) => {
    // 设置随机位置，避免重叠
    obj.setPosition(
      Phaser.Math.Between(50 + index * 50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 设置碰撞边界
    obj.setCollideWorldBounds(true);
    
    // 设置反弹系数为1（完全弹性碰撞）
    obj.setBounce(1, 1);

    // 设置随机速度，确保速度大小为80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 80;
    const velocityY = Math.sin(angle) * 80;
    obj.setVelocity(velocityX, velocityY);

    // 设置圆形碰撞体
    obj.body.setCircle(20);
  });

  // 启用物体间的碰撞
  this.physics.add.collider(pinkObjects, pinkObjects, handleCollision, null, this);

  // 显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 碰撞处理函数
  function handleCollision(obj1, obj2) {
    collisionCount++;
  }

  // 更新状态文本
  this.events.on('update', () => {
    // 计算平均速度
    let totalSpeed = 0;
    pinkObjects.children.entries.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      totalSpeed += speed;
    });
    averageSpeed = (totalSpeed / objectCount).toFixed(2);

    statusText.setText([
      `Objects: ${objectCount}`,
      `Collisions: ${collisionCount}`,
      `Avg Speed: ${averageSpeed} px/s`,
      `Target Speed: 80 px/s`
    ]);
  });

  // 添加说明文本
  this.add.text(10, 570, '5 pink objects moving at 80 px/s with bouncing collisions', {
    fontSize: '14px',
    fill: '#cccccc'
  });
}

function update(time, delta) {
  // 游戏主循环（当前不需要额外逻辑）
}

// 启动游戏
const game = new Phaser.Game(config);