class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.wallCollisionCount = 0;
    this.ballCollisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建8个小球
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 300 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 150 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.balls.create(pos.x, pos.y, 'ballTexture');
      
      // 设置随机速度方向，速度大小为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
      ball.setCircle(16); // 设置物理体为圆形
      ball.name = `ball_${index}`;
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.wallCollisionCount++;
      this.collisionCount++;
    });

    // 初始化信号对象
    window.__signals__ = {
      totalCollisions: 0,
      wallCollisions: 0,
      ballCollisions: 0,
      ballsActive: 8,
      ballPositions: [],
      ballVelocities: []
    };

    // 添加文本显示（可选，用于调试）
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('Game initialized with 8 balls at speed 80');
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisionCount++;
    this.collisionCount++;
    
    // 记录碰撞事件
    console.log(JSON.stringify({
      type: 'ball_collision',
      time: Date.now(),
      ball1: ball1.name,
      ball2: ball2.name,
      position: { x: ball1.x, y: ball1.y }
    }));
  }

  update(time, delta) {
    // 更新信号数据
    const ballPositions = [];
    const ballVelocities = [];
    
    this.balls.getChildren().forEach(ball => {
      ballPositions.push({ x: Math.round(ball.x), y: Math.round(ball.y) });
      ballVelocities.push({ 
        x: Math.round(ball.body.velocity.x), 
        y: Math.round(ball.body.velocity.y),
        speed: Math.round(Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2))
      });
    });

    window.__signals__ = {
      totalCollisions: this.collisionCount,
      wallCollisions: this.wallCollisionCount,
      ballCollisions: this.ballCollisionCount,
      ballsActive: this.balls.getChildren().length,
      ballPositions: ballPositions,
      ballVelocities: ballVelocities,
      timestamp: time
    };

    // 更新显示文本
    this.collisionText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Wall Collisions: ${this.wallCollisionCount}`,
      `Ball Collisions: ${this.ballCollisionCount}`,
      `Balls Active: ${this.balls.getChildren().length}`
    ]);

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log(JSON.stringify({
        type: 'status',
        time: time,
        signals: window.__signals__
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
      debug: false,
      checkCollision: {
        up: true,
        down: true,
        left: true,
        right: true
      }
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 初始化全局信号
window.__signals__ = {
  totalCollisions: 0,
  wallCollisions: 0,
  ballCollisions: 0,
  ballsActive: 0,
  ballPositions: [],
  ballVelocities: []
};

console.log('Phaser game started - 8 balls bouncing simulation');