class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
    this.activeCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('whiteCircle', 32, 32);
    graphics.destroy();

    // 创建对象池 (Physics Group)
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteCircle',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化 signals
    window.__signals__ = {
      activeCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      poolSize: 5
    };

    // 定时发射对象 (每 800ms)
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 立即发射第一个对象
    this.spawnObject();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = -50;
      
      // 激活并显示对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 200);
      obj.setVelocity(velocityX, velocityY);
      
      // 更新统计
      this.totalSpawned++;
      this.updateSignals();
      
      console.log(`[SPAWN] Object spawned at (${x}, ${y}), Total: ${this.totalSpawned}`);
    } else {
      console.log('[POOL] Pool exhausted, waiting for recycling...');
    }
  }

  recycleObject(obj) {
    if (obj.active) {
      obj.setActive(false);
      obj.setVisible(false);
      obj.setVelocity(0, 0);
      
      this.totalRecycled++;
      this.updateSignals();
      
      console.log(`[RECYCLE] Object recycled, Total recycled: ${this.totalRecycled}`);
    }
  }

  updateSignals() {
    // 计算活跃对象数
    this.activeCount = this.objectPool.getChildren().filter(obj => obj.active).length;
    
    // 更新 signals
    window.__signals__ = {
      activeCount: this.activeCount,
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      poolSize: 5,
      availableSlots: 5 - this.activeCount
    };

    // 输出 JSON 格式的 signals
    console.log('[SIGNALS]', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach(obj => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        const bounds = {
          left: -100,
          right: 900,
          top: -100,
          bottom: 700
        };

        if (obj.x < bounds.left || obj.x > bounds.right || 
            obj.y < bounds.top || obj.y > bounds.bottom) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Active Objects: ${this.activeCount}/5`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Available Slots: ${5 - this.activeCount}`
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