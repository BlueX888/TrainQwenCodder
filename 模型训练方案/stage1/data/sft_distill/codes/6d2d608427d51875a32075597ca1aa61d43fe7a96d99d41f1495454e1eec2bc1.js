class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总生成次数
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
    // 创建物理组作为对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 5,  // 对象池最大容量
      createCallback: (obj) => {
        // 对象创建时的回调
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 每1秒发射一个对象
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射一个对象
    this.spawnObject();

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机X位置，从屏幕顶部上方开始
      const randomX = Phaser.Math.Between(50, 750);
      
      obj.setPosition(randomX, -50);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置向下的速度
      obj.setVelocity(
        Phaser.Math.Between(-50, 50),  // 随机水平速度
        Phaser.Math.Between(100, 200)   // 向下速度
      );
      
      this.spawnedCount++;
      this.activeCount++;
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕（下方、左侧或右侧）
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
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
    this.activeCount--;
    this.updateStatusText();
    
    console.log(`对象已回收 - 总回收: ${this.recycledCount}, 当前活跃: ${this.activeCount}`);
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const totalUsed = this.objectPool.getTotalUsed();
    
    this.statusText.setText([
      `对象池状态:`,
      `池大小: ${poolSize} / 5`,
      `活跃对象: ${this.activeCount}`,
      `总生成: ${this.spawnedCount}`,
      `总回收: ${this.recycledCount}`,
      `对象复用率: ${this.spawnedCount > 0 ? ((this.recycledCount / this.spawnedCount) * 100).toFixed(1) : 0}%`
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
  scene: GameScene
};

new Phaser.Game(config);