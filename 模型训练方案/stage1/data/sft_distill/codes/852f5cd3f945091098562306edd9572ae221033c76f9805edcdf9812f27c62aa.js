// 初始化全局信号对象
window.__signals__ = {
  objectCount: 20,
  collisionCount: 0,
  averageSpeed: 120,
  bounceCoefficient: 1,
  timestamp: Date.now()
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('grayCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objectGroup = this.physics.add.group({
      defaultKey: 'grayCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 20 个物体
    for (let i = 0; i < 20; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.objectGroup.create(x, y, 'grayCircle');
      
      // 设置随机方向的速度，总速度为 120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setBounce(1); // 完全弹性碰撞
      obj.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      obj.setCircle(16);
    }

    // 设置物体间的碰撞
    this.physics.add.collider(
      this.objectGroup,
      this.objectGroup,
      this.handleCollision,
      null,
      this
    );

    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 记录初始状态
    this.updateSignals();
    
    console.log(JSON.stringify({
      event: 'game_started',
      objectCount: 20,
      speed: 120,
      timestamp: Date.now()
    }));
  }

  handleCollision(obj1, obj2) {
    // 记录碰撞
    this.collisionCount++;
    
    // 输出碰撞日志
    if (this.collisionCount % 10 === 0) {
      console.log(JSON.stringify({
        event: 'collision',
        count: this.collisionCount,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Objects: ${this.objectGroup.getChildren().length}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 更新全局信号
    this.updateSignals();

    // 验证速度保持在 120 左右（允许浮点误差）
    this.objectGroup.getChildren().forEach((obj, index) => {
      const body = obj.body;
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差过大，重新归一化（处理浮点误差累积）
      if (Math.abs(speed - 120) > 5) {
        const angle = Math.atan2(body.velocity.y, body.velocity.x);
        body.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);
      }
    });
  }

  updateSignals() {
    // 计算平均速度
    let totalSpeed = 0;
    this.objectGroup.getChildren().forEach(obj => {
      const body = obj.body;
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      totalSpeed += speed;
    });

    window.__signals__ = {
      objectCount: this.objectGroup.getChildren().length,
      collisionCount: this.collisionCount,
      averageSpeed: totalSpeed / 20,
      bounceCoefficient: 1,
      timestamp: Date.now(),
      status: 'running'
    };
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    physics: 'arcade'
  },
  timestamp: Date.now()
}));