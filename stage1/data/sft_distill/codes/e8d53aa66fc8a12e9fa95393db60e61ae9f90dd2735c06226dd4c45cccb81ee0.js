class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;  // 当前活跃对象数
    this.recycledCount = 0;  // 总回收次数
    this.launchedCount = 0;  // 总发射次数
  }

  preload() {
    // 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大容量10个
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBox',
      maxSize: 10,
      runChildUpdate: false,
      createCallback: (obj) => {
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

    // 每500ms发射一个对象
    this.time.addEvent({
      delay: 500,
      callback: this.launchObject,
      callbackScope: this,
      loop: true
    });

    // 添加说明文字
    this.add.text(10, 560, '对象池演示：绿色方块离开屏幕后自动回收重用', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  launchObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机起始位置（屏幕左侧）
      const startY = Phaser.Math.Between(50, 550);
      
      obj.setPosition(0, startY);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度（向右移动）
      const velocityX = Phaser.Math.Between(100, 300);
      const velocityY = Phaser.Math.Between(-100, 100);
      obj.setVelocity(velocityX, velocityY);
      
      this.launchedCount++;
      this.activeCount++;
      this.updateStatusText();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.x > 850 || obj.x < -50 || obj.y > 650 || obj.y < -50) {
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
    this.activeCount--;
    this.updateStatusText();
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    const inactiveObjs = this.objectPool.countActive(false);
    
    this.statusText.setText([
      `对象池状态:`,
      `池容量: ${poolSize}/10`,
      `活跃对象: ${activeObjs}`,
      `空闲对象: ${inactiveObjs}`,
      `已发射: ${this.launchedCount}`,
      `已回收: ${this.recycledCount}`
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