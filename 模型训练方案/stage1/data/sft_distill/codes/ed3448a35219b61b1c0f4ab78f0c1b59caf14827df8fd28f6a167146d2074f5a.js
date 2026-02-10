class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.objects = this.physics.add.group({
      defaultKey: 'orangeCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个橙色物体
    for (let i = 0; i < 5; i++) {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const obj = this.objects.create(x, y, 'orangeCircle');
      
      // 设置随机方向的速度，速度大小为240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      obj.body.setCircle(20);
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);

    // 初始化信号对象
    window.__signals__ = {
      objectCount: 5,
      objects: [],
      totalCollisions: 0,
      frameCount: 0
    };

    // 监听碰撞事件
    this.physics.world.on('collide', () => {
      window.__signals__.totalCollisions++;
    });

    console.log(JSON.stringify({
      type: 'game_start',
      objectCount: 5,
      speed: 240,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 每60帧更新一次状态信息
    if (window.__signals__.frameCount % 60 === 0) {
      const objectsData = [];
      
      this.objects.getChildren().forEach((obj, index) => {
        const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
        objectsData.push({
          id: index,
          x: Math.round(obj.x),
          y: Math.round(obj.y),
          velocityX: Math.round(obj.body.velocity.x),
          velocityY: Math.round(obj.body.velocity.y),
          speed: Math.round(speed)
        });
      });

      window.__signals__.objects = objectsData;

      // 输出日志
      console.log(JSON.stringify({
        type: 'status_update',
        frame: window.__signals__.frameCount,
        collisions: window.__signals__.totalCollisions,
        objects: objectsData,
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

const game = new Phaser.Game(config);