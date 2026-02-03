class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总生成次数
  }

  preload() {
    // 创建黄色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建对象池，最大15个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 15,
      runChildUpdate: false,
      createCallback: (ball) => {
        // 设置对象离开屏幕时的回调
        ball.setActive(false);
        ball.setVisible(false);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加提示文本
    this.add.text(10, 550, '黄色球会从左侧发射，离屏后自动回收到对象池', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  spawnObject() {
    // 从对象池获取对象
    const ball = this.objectPool.get();
    
    if (ball) {
      // 设置初始位置和速度
      ball.setPosition(50, Phaser.Math.Between(50, 550));
      ball.setVelocity(Phaser.Math.Between(150, 300), Phaser.Math.Between(-100, 100));
      ball.setActive(true);
      ball.setVisible(true);
      
      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((ball) => {
      if (ball.active) {
        // 检查是否离开屏幕边界
        if (ball.x > 850 || ball.x < -50 || ball.y > 650 || ball.y < -50) {
          // 回收对象到对象池
          ball.setActive(false);
          ball.setVisible(false);
          ball.setVelocity(0, 0);
          
          this.recycledCount++;
        }
      }
    });

    // 更新活跃对象计数
    this.activeCount = this.objectPool.countActive(true);

    // 更新状态显示
    this.statusText.setText([
      `对象池大小: ${this.objectPool.maxSize}`,
      `活跃对象: ${this.activeCount}`,
      `总生成次数: ${this.spawnedCount}`,
      `总回收次数: ${this.recycledCount}`,
      `池中可用: ${this.objectPool.maxSize - this.objectPool.getLength()}`
    ]);
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
  scene: PoolScene
};

new Phaser.Game(config);