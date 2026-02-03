// 创建场景类
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      objects: [],
      running: true
    };

    // 使用 Graphics 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(20, 20, 20); // 半径 20 的圆
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.orangeGroup = this.physics.add.group({
      key: 'orangeCircle',
      repeat: 4, // 创建 5 个物体（0-4）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const objects = this.orangeGroup.getChildren();
    objects.forEach((obj, index) => {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      obj.setPosition(x, y);

      // 设置圆形碰撞体
      obj.setCircle(20);

      // 随机方向，固定速度 240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 240;
      const vy = Math.sin(angle) * 240;
      obj.setVelocity(vx, vy);

      // 记录到信号对象
      window.__signals__.objects.push({
        id: index,
        x: x,
        y: y,
        velocityX: vx,
        velocityY: vy
      });
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(
      this.orangeGroup,
      this.orangeGroup,
      this.handleCollision,
      null,
      this
    );

    // 添加文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    console.log('[GAME_START]', JSON.stringify({
      objectCount: 5,
      speed: 240,
      timestamp: Date.now()
    }));
  }

  handleCollision(obj1, obj2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;

    // 记录碰撞事件
    console.log('[COLLISION]', JSON.stringify({
      count: this.collisionCount,
      obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
      obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) },
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 更新信号对象中的物体位置
    const objects = this.orangeGroup.getChildren();
    objects.forEach((obj, index) => {
      if (window.__signals__.objects[index]) {
        window.__signals__.objects[index].x = Math.round(obj.x);
        window.__signals__.objects[index].y = Math.round(obj.y);
        window.__signals__.objects[index].velocityX = Math.round(obj.body.velocity.x);
        window.__signals__.objects[index].velocityY = Math.round(obj.body.velocity.y);
        
        // 确保速度保持在 240 左右（处理浮点误差）
        const currentSpeed = Math.sqrt(
          obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2
        );
        
        if (Math.abs(currentSpeed - 240) > 1) {
          const scale = 240 / currentSpeed;
          obj.setVelocity(
            obj.body.velocity.x * scale,
            obj.body.velocity.y * scale
          );
        }
      }
    });

    // 每 60 帧输出一次状态
    if (Math.floor(time / 1000) !== this.lastLogSecond) {
      this.lastLogSecond = Math.floor(time / 1000);
      console.log('[STATUS]', JSON.stringify({
        collisions: this.collisionCount,
        time: Math.floor(time),
        objectPositions: window.__signals__.objects.map(o => ({ x: o.x, y: o.y }))
      }));
    }
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