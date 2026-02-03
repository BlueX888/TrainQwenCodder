class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数量
    this.recycledCount = 0;    // 总回收次数
    this.launchedCount = 0;    // 总发射次数
  }

  preload() {
    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('cyanBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大 8 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'cyanBall',
      maxSize: 8,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 每 800ms 发射一个对象
    this.time.addEvent({
      delay: 800,
      callback: this.launchObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射几个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => {
        this.launchObject();
      });
    }

    this.updateStatusText();
  }

  launchObject() {
    // 从对象池获取一个对象
    const obj = this.objectPool.get(
      Phaser.Math.Between(50, 750),  // 随机 x 位置
      -50                             // 屏幕上方
    );

    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      obj.setVelocity(
        Phaser.Math.Between(-100, 100),  // x 方向速度
        Phaser.Math.Between(150, 300)    // y 方向速度（向下）
      );

      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-200, 200));

      this.launchedCount++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850 || obj.y < -50) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatusText();
  }

  recycleObject(obj) {
    // 停止物理运动
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    // 回收到对象池
    this.objectPool.killAndHide(obj);
    obj.setActive(false);

    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    const inactiveObjs = this.objectPool.countActive(false);

    this.statusText.setText([
      `Pool Size: ${poolSize} / 8`,
      `Active: ${activeObjs}`,
      `Inactive: ${inactiveObjs}`,
      `Launched: ${this.launchedCount}`,
      `Recycled: ${this.recycledCount}`,
      '',
      'Objects auto-recycle when',
      'they leave the screen'
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