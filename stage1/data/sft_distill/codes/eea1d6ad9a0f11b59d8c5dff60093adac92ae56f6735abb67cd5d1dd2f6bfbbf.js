class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.recycleCount = 0;
    this.activeCount = 0;
  }

  preload() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('yellowBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建对象池，最大5个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBox',
      maxSize: 5,
      runChildUpdate: false
    });

    // 初始化5个对象
    for (let i = 0; i < 5; i++) {
      this.spawnObject();
    }

    // 初始化信号对象
    window.__signals__ = {
      recycleCount: 0,
      activeCount: 5,
      poolSize: 5,
      events: []
    };

    // 显示统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('[INIT] Object pool created with 5 objects');
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕内）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 激活并设置位置
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      obj.setVelocity(velocityX, velocityY);
      
      // 设置边界反弹
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(false);
      
      this.activeCount++;
      
      const event = {
        type: 'SPAWN',
        time: Date.now(),
        position: { x, y },
        velocity: { x: velocityX, y: velocityY }
      };
      
      window.__signals__.events.push(event);
      console.log(JSON.stringify(event));
    }
  }

  recycleObject(obj) {
    // 回收对象
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycleCount++;
    this.activeCount--;
    
    // 更新信号
    window.__signals__.recycleCount = this.recycleCount;
    window.__signals__.activeCount = this.activeCount;
    
    const event = {
      type: 'RECYCLE',
      time: Date.now(),
      totalRecycled: this.recycleCount
    };
    
    window.__signals__.events.push(event);
    console.log(JSON.stringify(event));
    
    // 立即重新生成一个对象
    this.time.delayedCall(100, () => {
      this.spawnObject();
    });
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach(obj => {
      if (obj.active) {
        // 检查是否离开屏幕
        if (obj.x < -50 || obj.x > 850 || obj.y < -50 || obj.y > 650) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新统计信息
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    this.statsText.setText([
      `对象池大小: ${this.objectPool.maxSize}`,
      `活跃对象: ${activeObjects.length}`,
      `回收次数: ${this.recycleCount}`,
      `总事件数: ${window.__signals__.events.length}`
    ]);

    // 更新信号
    window.__signals__.activeCount = activeObjects.length;
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