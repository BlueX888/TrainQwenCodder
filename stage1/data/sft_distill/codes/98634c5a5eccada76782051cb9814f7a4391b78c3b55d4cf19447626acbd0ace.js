class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycledCount = 0;
    this.totalSpawned = 0;
  }

  preload() {
    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大 8 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 8,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 初始发射 5 个对象
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnObject();
      });
    }

    // 每 1.5 秒尝试发射新对象
    this.time.addEvent({
      delay: 1500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 更新状态显示
    this.time.addEvent({
      delay: 100,
      callback: this.updateStatus,
      callbackScope: this,
      loop: true
    });
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(-50, -20);
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      obj.setPosition(x, y);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setBounce(0.8);
      obj.setCollideWorldBounds(false);

      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界（上下左右都检查）
        if (obj.y > 650 || obj.y < -50 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 回收对象到对象池
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    const inactiveObjs = this.objectPool.countActive(false);

    this.statusText.setText([
      `对象池大小: ${poolSize}/8`,
      `活跃对象: ${activeObjs}`,
      `可用对象: ${inactiveObjs}`,
      `总发射次数: ${this.totalSpawned}`,
      `已回收次数: ${this.recycledCount}`
    ]);

    // 更新状态信号
    this.activeCount = activeObjs;
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: PoolScene
};

new Phaser.Game(config);