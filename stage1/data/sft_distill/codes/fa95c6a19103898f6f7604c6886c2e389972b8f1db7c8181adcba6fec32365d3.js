// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  objectCount: 5,
  collisionCount: 0,
  bounceCount: 0,
  objects: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.bounceCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('greenCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.greenObjects = this.physics.add.group({
      key: 'greenCircle',
      repeat: 4, // 创建5个对象（0-4）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const speed = 80;
    this.greenObjects.children.entries.forEach((obj, index) => {
      // 随机位置
      obj.setPosition(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500)
      );

      // 随机方向的速度，总速度为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      obj.setVelocity(vx, vy);

      // 设置圆形碰撞体
      obj.setCircle(20);

      // 记录初始状态
      window.__signals__.objects.push({
        id: index,
        x: obj.x,
        y: obj.y,
        vx: vx,
        vy: vy
      });
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(
      this.greenObjects,
      this.greenObjects,
      this.handleCollision,
      null,
      this
    );

    // 监听世界边界碰撞
    this.greenObjects.children.entries.forEach((obj) => {
      obj.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.bounceCount++;
      window.__signals__.bounceCount = this.bounceCount;
      console.log(JSON.stringify({
        type: 'worldBounce',
        bounceCount: this.bounceCount,
        timestamp: Date.now()
      }));
    });

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log(JSON.stringify({
      type: 'gameStart',
      objectCount: 5,
      speed: speed,
      timestamp: Date.now()
    }));
  }

  handleCollision(obj1, obj2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;

    console.log(JSON.stringify({
      type: 'objectCollision',
      collisionCount: this.collisionCount,
      obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
      obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) },
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新信息显示
    this.infoText.setText([
      `Objects: ${this.greenObjects.children.entries.length}`,
      `Collisions: ${this.collisionCount}`,
      `Bounces: ${this.bounceCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 更新物体状态到信号
    this.greenObjects.children.entries.forEach((obj, index) => {
      if (window.__signals__.objects[index]) {
        window.__signals__.objects[index].x = Math.round(obj.x);
        window.__signals__.objects[index].y = Math.round(obj.y);
        window.__signals__.objects[index].vx = Math.round(obj.body.velocity.x);
        window.__signals__.objects[index].vy = Math.round(obj.body.velocity.y);
      }
    });

    // 每5秒输出一次状态日志
    if (Math.floor(time / 5000) > Math.floor((time - delta) / 5000)) {
      console.log(JSON.stringify({
        type: 'statusUpdate',
        time: Math.floor(time / 1000),
        collisionCount: this.collisionCount,
        bounceCount: this.bounceCount,
        objects: window.__signals__.objects,
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
  scene: GameScene
};

new Phaser.Game(config);