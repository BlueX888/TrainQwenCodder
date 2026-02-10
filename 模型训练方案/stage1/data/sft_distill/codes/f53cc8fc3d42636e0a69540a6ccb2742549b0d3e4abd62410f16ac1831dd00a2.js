class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.objectCount = 20;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      objectCount: this.objectCount,
      collisionCount: 0,
      activeObjects: 0,
      averageSpeed: 0
    };

    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建20个黄色物体
    for (let i = 0; i < this.objectCount; i++) {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.ballGroup.create(x, y, 'yellowBall');
      
      // 设置随机移动方向，速度为200
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
      const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1, 1); // 完全反弹
      ball.setCollideWorldBounds(true);
    }

    // 启用物体间碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onCollision, null, this);

    // 添加调试文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onCollision(ball1, ball2) {
    // 碰撞回调
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      count: this.collisionCount,
      ball1: { x: Math.round(ball1.x), y: Math.round(ball1.y) },
      ball2: { x: Math.round(ball2.x), y: Math.round(ball2.y) },
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新信号数据
    const balls = this.ballGroup.getChildren();
    window.__signals__.activeObjects = balls.length;
    
    // 计算平均速度
    let totalSpeed = 0;
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      totalSpeed += speed;
    });
    window.__signals__.averageSpeed = Math.round(totalSpeed / balls.length);

    // 更新调试信息
    this.debugText.setText([
      `Objects: ${window.__signals__.activeObjects}`,
      `Collisions: ${window.__signals__.collisionCount}`,
      `Avg Speed: ${window.__signals__.averageSpeed} px/s`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 定期输出状态日志
    if (Math.floor(time) % 2000 < delta) {
      console.log(JSON.stringify({
        event: 'status',
        signals: window.__signals__,
        timestamp: Date.now()
      }));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);