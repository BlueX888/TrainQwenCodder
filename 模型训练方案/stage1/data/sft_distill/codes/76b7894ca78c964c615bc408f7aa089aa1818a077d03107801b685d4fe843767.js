class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      activeCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      poolSize: 15,
      availableInPool: 15
    };

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'pinkCircle',
      maxSize: 15,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每500ms发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加点击屏幕手动发射功能
    this.input.on('pointerdown', () => {
      this.spawnObject();
    });

    console.log(JSON.stringify({
      event: 'pool_initialized',
      maxSize: 15,
      timestamp: Date.now()
    }));
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const x = Phaser.Math.Between(50, 750);
      const y = -50;
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      obj.setPosition(x, y);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setAngularVelocity(Phaser.Math.Between(-200, 200));

      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);

      console.log(JSON.stringify({
        event: 'object_spawned',
        totalSpawned: this.totalSpawned,
        activeCount: this.activeCount,
        position: { x, y },
        timestamp: Date.now()
      }));

      this.updateSignals();
    } else {
      console.log(JSON.stringify({
        event: 'pool_exhausted',
        activeCount: this.activeCount,
        timestamp: Date.now()
      }));
    }
  }

  update() {
    // 检查所有活动对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界（上下左右都检查）
        if (obj.y > 650 || obj.y < -50 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    this.activeCount = this.objectPool.countActive(true);
    const availableCount = this.objectPool.maxSize - this.activeCount;
    
    this.statusText.setText([
      `对象池状态:`,
      `活动对象: ${this.activeCount} / ${this.objectPool.maxSize}`,
      `可用对象: ${availableCount}`,
      `总发射数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      ``,
      `点击屏幕手动发射对象`
    ]);

    this.updateSignals();
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    this.totalRecycled++;

    console.log(JSON.stringify({
      event: 'object_recycled',
      totalRecycled: this.totalRecycled,
      activeCount: this.objectPool.countActive(true),
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    window.__signals__ = {
      activeCount: this.activeCount,
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      poolSize: this.objectPool.maxSize,
      availableInPool: this.objectPool.maxSize - this.activeCount,
      recycleRate: this.totalSpawned > 0 ? 
        (this.totalRecycled / this.totalSpawned * 100).toFixed(2) + '%' : '0%'
    };
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