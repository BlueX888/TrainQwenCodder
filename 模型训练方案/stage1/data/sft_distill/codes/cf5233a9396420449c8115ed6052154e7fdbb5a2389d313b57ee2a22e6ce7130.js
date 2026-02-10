class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 已回收次数
    this.spawnedCount = 0;     // 已生成次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('cyanBlock', 40, 40);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'cyanBlock',
      maxSize: 5,  // 最大5个对象
      runChildUpdate: false,
      createCallback: (obj) => {
        // 对象创建时的回调
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 定时发射对象（每1秒发射一个）
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '青色方块会从左侧发射，离开屏幕后自动回收到对象池', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 设置对象位置和速度
      obj.setPosition(50, Phaser.Math.Between(100, 500));
      obj.setVelocity(Phaser.Math.Between(100, 200), 0);
      obj.setActive(true);
      obj.setVisible(true);
      
      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
      this.updateStatusText();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 如果对象离开屏幕右侧，回收它
        if (obj.x > this.cameras.main.width + 50) {
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
    this.updateStatusText();
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    const inactiveObjs = this.objectPool.countActive(false);
    
    this.statusText.setText([
      `对象池大小: ${poolSize}/5`,
      `活跃对象: ${activeObjs}`,
      `空闲对象: ${inactiveObjs}`,
      `已生成次数: ${this.spawnedCount}`,
      `已回收次数: ${this.recycledCount}`
    ]);
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);