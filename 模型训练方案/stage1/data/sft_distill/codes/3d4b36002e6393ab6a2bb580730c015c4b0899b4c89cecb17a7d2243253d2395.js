class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycledCount = 0;
    this.totalSpawned = 0;
  }

  preload() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      activeObjects: 0,
      recycledObjects: 0,
      totalSpawned: 0,
      poolSize: 12,
      availableInPool: 12,
      events: []
    };

    // 创建物理对象池，最大12个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'purpleBox',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 显示说明文字
    this.add.text(20, 20, 'Object Pool Demo (Max 12 Objects)', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statsText = this.add.text(20, 60, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 每500ms发射一个对象
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加手动发射按钮（点击屏幕发射）
    this.input.on('pointerdown', () => {
      this.spawnObject();
    });

    this.updateStats();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 设置初始位置（屏幕左侧随机高度）
      const startX = 50;
      const startY = Phaser.Math.Between(100, 500);
      
      obj.setPosition(startX, startY);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度（向右飞行）
      const velocityX = Phaser.Math.Between(100, 300);
      const velocityY = Phaser.Math.Between(-50, 50);
      obj.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.activeCount++;
      
      // 记录事件
      window.__signals__.events.push({
        type: 'spawn',
        timestamp: Date.now(),
        position: { x: startX, y: startY },
        velocity: { x: velocityX, y: velocityY }
      });
      
      this.updateStats();
    } else {
      // 对象池已满
      window.__signals__.events.push({
        type: 'pool_full',
        timestamp: Date.now()
      });
    }
  }

  update() {
    // 检查所有活动对象
    const objects = this.objectPool.getChildren();
    
    objects.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.x > 850 || obj.x < -50 || obj.y > 650 || obj.y < -50) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 停止物理运动
    obj.setVelocity(0, 0);
    
    // 隐藏并标记为非活动
    obj.setActive(false);
    obj.setVisible(false);
    
    this.activeCount--;
    this.recycledCount++;
    
    // 记录回收事件
    window.__signals__.events.push({
      type: 'recycle',
      timestamp: Date.now(),
      lastPosition: { x: obj.x, y: obj.y }
    });
    
    this.updateStats();
  }

  updateStats() {
    // 更新统计文本
    const activeObjects = this.objectPool.countActive(true);
    const totalObjects = this.objectPool.getLength();
    const availableObjects = this.objectPool.getTotalFree();
    
    this.statsText.setText([
      `Active Objects: ${activeObjects}`,
      `Total in Pool: ${totalObjects}`,
      `Available: ${availableObjects}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled: ${this.recycledCount}`,
      '',
      'Click anywhere to spawn object'
    ]);

    // 更新全局信号
    window.__signals__.activeObjects = activeObjects;
    window.__signals__.recycledObjects = this.recycledCount;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.availableInPool = availableObjects;
    window.__signals__.poolUtilization = (activeObjects / 12 * 100).toFixed(1) + '%';

    // 保持事件日志在合理大小（最多保留最近50条）
    if (window.__signals__.events.length > 50) {
      window.__signals__.events = window.__signals__.events.slice(-50);
    }

    // 输出JSON格式的信号（用于验证）
    console.log(JSON.stringify({
      timestamp: Date.now(),
      active: activeObjects,
      available: availableObjects,
      recycled: this.recycledCount,
      spawned: this.totalSpawned
    }));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PoolScene
};

// 启动游戏
const game = new Phaser.Game(config);