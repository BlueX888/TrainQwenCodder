class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0; // 当前活跃对象数
    this.totalLaunched = 0; // 总发射次数
    this.recycledCount = 0; // 回收次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('cyanBlock', 32, 32);
    graphics.destroy();

    // 创建物理对象池，最多15个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'cyanBlock',
      maxSize: 15,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预创建15个对象到池中
    for (let i = 0; i < 15; i++) {
      const obj = this.objectPool.create(0, 0, 'cyanBlock');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 定时发射对象（每500ms发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.launchObject,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, '青色方块从池中获取，离开屏幕后自动回收', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  launchObject() {
    // 从对象池获取一个不活跃的对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机起始位置（屏幕顶部）
      const startX = Phaser.Math.Between(50, 750);
      obj.setPosition(startX, -32);
      
      // 激活并显示对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-200, 200));
      
      this.activeCount++;
      this.totalLaunched++;
      this.updateStatusText();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界（上下左右都检测）
        if (obj.y > 650 || obj.y < -50 || obj.x < -50 || obj.x > 850) {
          // 回收对象到池中
          this.killObject(obj);
        }
      }
    });
  }

  killObject(obj) {
    // 停止物理运动
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    // 取消激活和隐藏
    obj.setActive(false);
    obj.setVisible(false);
    
    this.activeCount--;
    this.recycledCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `对象池大小: 15`,
      `活跃对象: ${this.activeCount}`,
      `可用对象: ${15 - this.activeCount}`,
      `总发射次数: ${this.totalLaunched}`,
      `回收次数: ${this.recycledCount}`
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