class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建对象池，最大 15 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'pinkBall',
      maxSize: 15,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化信号对象
    window.__signals__ = {
      poolSize: 15,
      activeObjects: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      poolUtilization: 0
    };

    // 定时发射对象（每 500ms 发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(10, 10, 'Pink Object Pool Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.3);
    bounds.strokeRect(0, 0, 800, 600);
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机从屏幕顶部或左侧发射
      const spawnSide = Phaser.Math.Between(0, 1);
      
      if (spawnSide === 0) {
        // 从顶部发射
        obj.setPosition(Phaser.Math.Between(50, 750), -20);
        obj.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(100, 200)
        );
      } else {
        // 从左侧发射
        obj.setPosition(-20, Phaser.Math.Between(50, 550));
        obj.setVelocity(
          Phaser.Math.Between(100, 200),
          Phaser.Math.Between(-100, 100)
        );
      }

      obj.setActive(true);
      obj.setVisible(true);
      
      this.totalSpawned++;
      
      // 记录日志
      console.log(JSON.stringify({
        event: 'spawn',
        totalSpawned: this.totalSpawned,
        activeCount: this.objectPool.countActive(true)
      }));
    } else {
      // 对象池已满
      console.log(JSON.stringify({
        event: 'pool_full',
        maxSize: 15,
        activeCount: this.objectPool.countActive(true)
      }));
    }
  }

  recycleObject(obj) {
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.totalRecycled++;
    
    // 记录回收日志
    console.log(JSON.stringify({
      event: 'recycle',
      totalRecycled: this.totalRecycled,
      activeCount: this.objectPool.countActive(true)
    }));
  }

  update(time, delta) {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren();
    
    activeObjects.forEach((obj) => {
      if (!obj.active) return;
      
      // 检查是否离开屏幕边界（带缓冲区）
      const outOfBounds = 
        obj.x < -50 || 
        obj.x > 850 || 
        obj.y < -50 || 
        obj.y > 650;
      
      if (outOfBounds) {
        this.recycleObject(obj);
      }
    });

    // 更新状态信号
    const activeCount = this.objectPool.countActive(true);
    window.__signals__.activeObjects = activeCount;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.totalRecycled = this.totalRecycled;
    window.__signals__.poolUtilization = (activeCount / 15 * 100).toFixed(1);

    // 更新状态文本
    this.statusText.setText([
      `Active Objects: ${activeCount} / 15`,
      `Pool Utilization: ${window.__signals__.poolUtilization}%`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Reuse Rate: ${this.totalRecycled > 0 ? ((this.totalRecycled / this.totalSpawned) * 100).toFixed(1) : 0}%`
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