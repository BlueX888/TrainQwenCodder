class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.objectCount = 10;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('grayCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objects = this.physics.add.group({
      defaultKey: 'grayCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 10 个物体并设置随机速度
    for (let i = 0; i < this.objectCount; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.objects.create(x, y, 'grayCircle');
      
      // 设置随机方向的速度，速度大小为 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(true);
    }

    // 添加物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects, this.handleCollision, null, this);

    // 初始化信号对象
    window.__signals__ = {
      objectCount: this.objectCount,
      collisionCount: 0,
      averageSpeed: 80,
      positions: [],
      velocities: []
    };

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞计数
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
  }

  update(time, delta) {
    // 更新信号数据
    const positions = [];
    const velocities = [];
    let totalSpeed = 0;

    this.objects.getChildren().forEach((obj, index) => {
      positions.push({
        id: index,
        x: Math.round(obj.x),
        y: Math.round(obj.y)
      });

      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      totalSpeed += speed;

      velocities.push({
        id: index,
        vx: Math.round(obj.body.velocity.x * 10) / 10,
        vy: Math.round(obj.body.velocity.y * 10) / 10,
        speed: Math.round(speed * 10) / 10
      });
    });

    window.__signals__.positions = positions;
    window.__signals__.velocities = velocities;
    window.__signals__.averageSpeed = Math.round((totalSpeed / this.objectCount) * 10) / 10;

    // 更新显示文本
    this.infoText.setText([
      `Objects: ${this.objectCount}`,
      `Collisions: ${this.collisionCount}`,
      `Avg Speed: ${window.__signals__.averageSpeed}`
    ]);

    // 定期输出日志
    if (time % 2000 < delta) {
      console.log(JSON.stringify({
        timestamp: Math.round(time),
        collisions: this.collisionCount,
        objectCount: this.objectCount,
        avgSpeed: window.__signals__.averageSpeed
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

new Phaser.Game(config);