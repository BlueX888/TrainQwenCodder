class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycledCount = 0;
    this.totalSpawned = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'grayBox',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建显示文本
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

    // 更新状态显示
    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取一个对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机 Y 位置
      const randomY = Phaser.Math.Between(50, 550);
      
      // 激活并设置位置
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(-50, randomY);
      
      // 设置随机速度（向右移动）
      const speed = Phaser.Math.Between(100, 300);
      obj.setVelocityX(speed);
      
      this.totalSpawned++;
      this.activeCount = this.objectPool.getChildren().filter(c => c.active).length;
      this.updateStatus();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕右侧
        if (obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycledCount++;
    this.activeCount = this.objectPool.getChildren().filter(c => c.active).length;
    this.updateStatus();
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    this.statusText.setText([
      `Pool Size: ${poolSize}/12`,
      `Active Objects: ${this.activeCount}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled Count: ${this.recycledCount}`,
      `Reuse Rate: ${this.totalSpawned > 0 ? ((this.recycledCount / this.totalSpawned) * 100).toFixed(1) : 0}%`
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