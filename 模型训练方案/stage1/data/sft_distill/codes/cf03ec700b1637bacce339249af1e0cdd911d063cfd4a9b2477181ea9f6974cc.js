class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总发射次数
  }

  preload() {
    // 使用 Graphics 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('redBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大 5 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 800ms 发射一个）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加提示文本
    this.add.text(400, 300, '红色方块会从左侧发射\n离开屏幕后自动回收复用', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    console.log('对象池初始化完成，最大容量: 5');
  }

  spawnObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get();

    if (obj) {
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置初始位置（屏幕左侧随机高度）
      obj.setPosition(0, Phaser.Math.Between(50, 550));
      
      // 设置速度（向右移动）
      obj.setVelocity(Phaser.Math.Between(100, 200), 0);
      
      this.activeCount++;
      this.spawnedCount++;
      
      console.log(`发射对象 #${this.spawnedCount}, 当前活跃: ${this.activeCount}`);
    } else {
      console.log('对象池已满，等待回收');
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active && obj.x > 800) {
        // 对象离开屏幕右侧，回收到对象池
        this.recycleObject(obj);
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  recycleObject(obj) {
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.activeCount--;
    this.recycledCount++;
    
    console.log(`回收对象，已回收: ${this.recycledCount}, 当前活跃: ${this.activeCount}`);
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const totalUsed = this.objectPool.getTotalUsed();
    
    this.statusText.setText([
      `对象池容量: ${poolSize}/5`,
      `当前活跃: ${this.activeCount}`,
      `总发射次数: ${this.spawnedCount}`,
      `总回收次数: ${this.recycledCount}`,
      `池中可用: ${poolSize - totalUsed}`
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

const game = new Phaser.Game(config);