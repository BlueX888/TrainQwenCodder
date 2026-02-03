class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;  // 当前活跃对象数量
    this.totalSpawned = 0; // 总发射次数
    this.recycledCount = 0; // 回收次数
  }

  preload() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大容量 12
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBox',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (obj) => {
        // 对象创建时的回调
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 500ms 发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加边界检测
    this.physics.world.on('worldbounds', (body) => {
      // 当对象碰到世界边界时触发
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取一个对象
    const obj = this.objectPool.get();

    if (obj) {
      // 随机从屏幕顶部或左侧生成
      const spawnFromTop = Math.random() > 0.5;
      
      if (spawnFromTop) {
        // 从顶部生成，向下移动
        obj.setPosition(
          Phaser.Math.Between(50, 750),
          -32
        );
        obj.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(100, 200)
        );
      } else {
        // 从左侧生成，向右移动
        obj.setPosition(
          -32,
          Phaser.Math.Between(50, 550)
        );
        obj.setVelocity(
          Phaser.Math.Between(100, 200),
          Phaser.Math.Between(-100, 100)
        );
      }

      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      this.totalSpawned++;
      this.activeCount++;
      this.updateStatusText();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检查对象是否离开屏幕
        if (obj.x < -50 || obj.x > 850 || obj.y < -50 || obj.y > 650) {
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
    
    this.activeCount--;
    this.recycledCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeObjects = this.objectPool.countActive(true);
    const inactiveObjects = this.objectPool.countActive(false);

    this.statusText.setText([
      `Pool Size: ${poolSize}/12`,
      `Active Objects: ${activeObjects}`,
      `Inactive Objects: ${inactiveObjects}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled: ${this.recycledCount}`
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