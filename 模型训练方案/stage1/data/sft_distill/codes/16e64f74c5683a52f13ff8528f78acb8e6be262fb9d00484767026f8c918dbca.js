class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.recycleCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('orangeCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      activeCount: 0,
      recycleCount: 0,
      spawnCount: 0,
      poolSize: 5,
      events: []
    };

    // 创建物理对象池，最大 5 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'orangeCircle',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setCollideWorldBounds(false);
        obj.body.setCircle(16);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Object Pool Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 每 1 秒生成一个对象
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始生成 3 个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnObject();
      });
    }
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      this.spawnCount++;
      
      // 随机生成位置（屏幕上方或左侧）
      const side = Phaser.Math.Between(0, 1);
      if (side === 0) {
        // 从上方生成
        obj.setPosition(Phaser.Math.Between(50, 750), -50);
        obj.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(100, 200)
        );
      } else {
        // 从左侧生成
        obj.setPosition(-50, Phaser.Math.Between(50, 550));
        obj.setVelocity(
          Phaser.Math.Between(100, 200),
          Phaser.Math.Between(-50, 50)
        );
      }

      obj.setActive(true);
      obj.setVisible(true);

      // 记录事件
      window.__signals__.events.push({
        type: 'spawn',
        time: this.time.now,
        position: { x: obj.x, y: obj.y }
      });

      console.log(`[SPAWN] Object #${this.spawnCount} spawned at (${Math.round(obj.x)}, ${Math.round(obj.y)})`);
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    
    activeObjects.forEach((obj) => {
      // 检查是否离开屏幕边界
      if (obj.x < -100 || obj.x > 900 || obj.y < -100 || obj.y > 700) {
        this.recycleObject(obj);
      }
    });

    // 更新状态
    const activeCount = this.objectPool.countActive(true);
    window.__signals__.activeCount = activeCount;
    window.__signals__.recycleCount = this.recycleCount;
    window.__signals__.spawnCount = this.spawnCount;

    // 更新显示文本
    this.statusText.setText([
      `Active Objects: ${activeCount}/${window.__signals__.poolSize}`,
      `Total Spawned: ${this.spawnCount}`,
      `Total Recycled: ${this.recycleCount}`,
      `Pool Available: ${this.objectPool.maxSize - activeCount}`
    ]);
  }

  recycleObject(obj) {
    this.recycleCount++;
    
    // 记录回收事件
    window.__signals__.events.push({
      type: 'recycle',
      time: this.time.now,
      position: { x: obj.x, y: obj.y }
    });

    console.log(`[RECYCLE] Object recycled at (${Math.round(obj.x)}, ${Math.round(obj.y)}) - Total recycled: ${this.recycleCount}`);

    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
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

const game = new Phaser.Game(config);

// 定期输出状态日志
setInterval(() => {
  if (window.__signals__) {
    console.log('[STATUS]', JSON.stringify({
      activeCount: window.__signals__.activeCount,
      recycleCount: window.__signals__.recycleCount,
      spawnCount: window.__signals__.spawnCount,
      poolSize: window.__signals__.poolSize
    }));
  }
}, 2000);