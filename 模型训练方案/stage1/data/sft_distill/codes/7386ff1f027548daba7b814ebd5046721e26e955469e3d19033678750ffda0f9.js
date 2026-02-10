// 对象池管理场景
class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.poolStats = {
      activeCount: 0,
      recycledCount: 0,
      spawnedCount: 0,
      totalRecycles: 0
    };
  }

  preload() {
    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大8个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBox',
      maxSize: 8,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化 signals 输出
    window.__signals__ = this.poolStats;

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
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

    // 添加点击事件，手动发射对象
    this.input.on('pointerdown', () => {
      this.spawnObject();
    });

    console.log('[POOL_INIT]', JSON.stringify({
      maxSize: 8,
      timestamp: Date.now()
    }));
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (!obj) {
      console.log('[POOL_FULL]', JSON.stringify({
        message: 'Pool is full, cannot spawn more objects',
        activeCount: this.poolStats.activeCount
      }));
      return;
    }

    // 随机位置（屏幕上方或左右两侧）
    const spawnSide = Phaser.Math.Between(0, 2);
    let x, y, velocityX, velocityY;

    switch(spawnSide) {
      case 0: // 顶部
        x = Phaser.Math.Between(50, 750);
        y = -50;
        velocityX = Phaser.Math.Between(-100, 100);
        velocityY = Phaser.Math.Between(100, 200);
        break;
      case 1: // 左侧
        x = -50;
        y = Phaser.Math.Between(50, 550);
        velocityX = Phaser.Math.Between(100, 200);
        velocityY = Phaser.Math.Between(-50, 50);
        break;
      case 2: // 右侧
        x = 850;
        y = Phaser.Math.Between(50, 550);
        velocityX = Phaser.Math.Between(-200, -100);
        velocityY = Phaser.Math.Between(-50, 50);
        break;
    }

    // 激活并设置对象
    obj.setPosition(x, y);
    obj.setVelocity(velocityX, velocityY);
    obj.setActive(true);
    obj.setVisible(true);
    obj.setAlpha(1);
    obj.setScale(1);

    // 更新统计
    this.poolStats.spawnedCount++;
    this.poolStats.activeCount = this.objectPool.countActive(true);

    console.log('[OBJECT_SPAWNED]', JSON.stringify({
      id: obj.name || 'obj_' + this.poolStats.spawnedCount,
      position: { x: Math.round(x), y: Math.round(y) },
      velocity: { x: Math.round(velocityX), y: Math.round(velocityY) },
      activeCount: this.poolStats.activeCount,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 检查所有活跃对象是否离开屏幕
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界（增加缓冲区）
        const outOfBounds = 
          obj.x < -100 || 
          obj.x > 900 || 
          obj.y < -100 || 
          obj.y > 700;

        if (outOfBounds) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新显示文本
    this.poolStats.activeCount = this.objectPool.countActive(true);
    this.poolStats.recycledCount = this.objectPool.countActive(false);
    
    this.statusText.setText([
      'Object Pool Manager',
      '-------------------',
      `Active Objects: ${this.poolStats.activeCount}/8`,
      `Recycled: ${this.poolStats.recycledCount}`,
      `Total Spawned: ${this.poolStats.spawnedCount}`,
      `Total Recycles: ${this.poolStats.totalRecycles}`,
      '',
      'Click to spawn object'
    ]);

    // 更新 signals
    window.__signals__ = { ...this.poolStats };
  }

  recycleObject(obj) {
    // 记录回收前的位置
    const recycleData = {
      position: { 
        x: Math.round(obj.x), 
        y: Math.round(obj.y) 
      },
      velocity: { 
        x: Math.round(obj.body.velocity.x), 
        y: Math.round(obj.body.velocity.y) 
      },
      timestamp: Date.now()
    };

    // 停止物理运动
    obj.setVelocity(0, 0);
    obj.setActive(false);
    obj.setVisible(false);

    // 更新统计
    this.poolStats.totalRecycles++;

    console.log('[OBJECT_RECYCLED]', JSON.stringify({
      ...recycleData,
      totalRecycles: this.poolStats.totalRecycles,
      activeCount: this.objectPool.countActive(true)
    }));
  }
}

// Phaser 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);

// 初始化全局 signals
window.__signals__ = {
  activeCount: 0,
  recycledCount: 0,
  spawnedCount: 0,
  totalRecycles: 0
};

console.log('[GAME_START]', JSON.stringify({
  config: {
    width: config.width,
    height: config.height,
    poolSize: 8
  },
  timestamp: Date.now()
}));