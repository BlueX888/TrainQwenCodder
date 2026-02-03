class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0;
    this.ballCount = 20;
    this.ballSpeed = 80;
  }

  preload() {
    // 使用 Graphics 创建红色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('redBall', 20, 20);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'redBall',
      repeat: this.ballCount - 1,
      setXY: {
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 550),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个小球设置属性
    this.balls.children.iterate((ball) => {
      // 设置随机速度方向，保持速度大小为 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      
      ball.setVelocity(vx, vy);
      
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      ball.body.setCircle(10);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 初始化信号对象
    window.__signals__ = {
      ballCount: this.ballCount,
      collisionCount: 0,
      averageSpeed: this.ballSpeed,
      status: 'running'
    };

    // 添加文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log(JSON.stringify({
      event: 'game_started',
      ballCount: this.ballCount,
      ballSpeed: this.ballSpeed,
      timestamp: Date.now()
    }));
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    // 每10次碰撞输出一次日志
    if (this.collisionCount % 10 === 0) {
      console.log(JSON.stringify({
        event: 'collision_milestone',
        collisionCount: this.collisionCount,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 计算平均速度（用于验证能量守恒）
    let totalSpeed = 0;
    let ballCount = 0;
    
    this.balls.children.iterate((ball) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      totalSpeed += speed;
      ballCount++;
    });

    const averageSpeed = ballCount > 0 ? totalSpeed / ballCount : 0;
    
    // 更新信号
    window.__signals__.averageSpeed = Math.round(averageSpeed * 100) / 100;
    window.__signals__.frameTime = Math.round(delta);

    // 每60帧输出一次状态日志
    if (time % 1000 < delta) {
      console.log(JSON.stringify({
        event: 'status_update',
        collisionCount: this.collisionCount,
        averageSpeed: window.__signals__.averageSpeed,
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallScene
};

new Phaser.Game(config);