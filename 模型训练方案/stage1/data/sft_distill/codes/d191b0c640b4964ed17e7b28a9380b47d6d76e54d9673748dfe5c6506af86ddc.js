class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.activeObjects = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.blueObjects = this.physics.add.group({
      defaultKey: 'blueCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 20 个蓝色物体
    for (let i = 0; i < 20; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.blueObjects.create(x, y, 'blueCircle');
      
      // 设置随机方向的速度，总速度为 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setCircle(16); // 设置碰撞体为圆形
    }

    this.activeObjects = this.blueObjects.getChildren().length;

    // 设置物体间的碰撞
    this.physics.add.collider(
      this.blueObjects,
      this.blueObjects,
      this.onCollision,
      null,
      this
    );

    // 初始化验证信号
    this.updateSignals();

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onCollision(obj1, obj2) {
    this.collisionCount++;
    this.updateSignals();
  }

  update(time, delta) {
    // 更新显示文本
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 确保速度保持在 80 左右（由于浮点数误差可能会有偏差）
    this.blueObjects.getChildren().forEach(obj => {
      const velocity = obj.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差较大，重新归一化
      if (Math.abs(currentSpeed - 80) > 5) {
        const scale = 80 / currentSpeed;
        obj.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });

    // 更新信号
    this.updateSignals();
  }

  updateSignals() {
    // 计算平均速度
    let totalSpeed = 0;
    this.blueObjects.getChildren().forEach(obj => {
      const velocity = obj.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      totalSpeed += speed;
    });
    const avgSpeed = this.activeObjects > 0 ? totalSpeed / this.activeObjects : 0;

    // 输出验证信号
    window.__signals__ = {
      activeObjects: this.activeObjects,
      collisionCount: this.collisionCount,
      averageSpeed: Math.round(avgSpeed * 100) / 100,
      targetSpeed: 80,
      timestamp: Date.now()
    };

    // 输出日志 JSON（每 100 次碰撞输出一次，避免过多日志）
    if (this.collisionCount > 0 && this.collisionCount % 100 === 0) {
      console.log(JSON.stringify({
        type: 'collision_milestone',
        collisions: this.collisionCount,
        objects: this.activeObjects,
        avgSpeed: Math.round(avgSpeed * 100) / 100
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
  scene: GameScene
};

const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  activeObjects: 0,
  collisionCount: 0,
  averageSpeed: 0,
  targetSpeed: 80,
  timestamp: Date.now()
};