class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 已回收次数
    this.spawnedCount = 0;     // 已生成次数
  }

  preload() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('redBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 5,           // 最大对象数为 5
      runChildUpdate: false,
      createCallback: (obj) => {
        // 对象创建时的回调
        obj.setCollideWorldBounds(false);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 每 1 秒发射一个对象
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射 3 个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnObject();
      });
    }

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取对象（如果池中有可用对象则复用，否则创建新对象）
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = 100;
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(100, 300);

      // 重置对象状态
      obj.setPosition(startX, startY);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setAlpha(1);

      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (obj.x < -50 || obj.x > 850 || obj.y > 650) {
          // 回收对象到对象池
          this.objectPool.killAndHide(obj);
          obj.setActive(false);
          
          this.recycledCount++;
          this.activeCount = this.objectPool.countActive(true);
          this.updateStatusText();
          
          console.log(`对象已回收，总回收次数: ${this.recycledCount}`);
        }
      }
    });
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    const inactiveObjs = this.objectPool.countActive(false);
    
    this.statusText.setText([
      `对象池状态 (最大: 5)`,
      `总对象数: ${poolSize}`,
      `活跃对象: ${activeObjs}`,
      `可复用对象: ${inactiveObjs}`,
      `已生成次数: ${this.spawnedCount}`,
      `已回收次数: ${this.recycledCount}`
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