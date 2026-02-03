class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycleCount = 0;     // 总回收次数
    this.launchCount = 0;      // 总发射次数
  }

  preload() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建对象池 (使用 Physics Group)
    this.objectPool = this.physics.add.group({
      defaultKey: 'grayBox',
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

    // 定时发射对象 (每1秒发射一个)
    this.time.addEvent({
      delay: 1000,
      callback: this.launchObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射一个对象
    this.launchObject();

    this.updateStatusText();
  }

  launchObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(-50, -20)
    );

    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度向下移动
      obj.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(100, 200)
      );

      this.launchCount++;
      this.activeCount = this.objectPool.countActive(true);
      this.updateStatusText();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕 (下方、左侧或右侧)
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
    
    this.recycleCount++;
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
      `闲置对象: ${inactiveObjs}`,
      `总发射次数: ${this.launchCount}`,
      `总回收次数: ${this.recycleCount}`,
      ``,
      '灰色方块会自动下落',
      '离开屏幕后自动回收'
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