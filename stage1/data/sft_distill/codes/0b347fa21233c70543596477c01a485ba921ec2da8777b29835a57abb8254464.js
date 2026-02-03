class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总生成次数
  }

  preload() {
    // 程序化生成紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9933ff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'purpleBox',
      maxSize: 5,
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

    // 定时发射对象（每1秒）
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射几个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnObject();
      });
    }

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 重置对象状态
      obj.setActive(true);
      obj.setVisible(true);
      
      // 随机位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = -50;
      obj.setPosition(startX, startY);
      
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.spawnedCount++;
      this.activeCount++;
      this.updateStatus();
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    this.recycledCount++;
    this.activeCount--;
    this.updateStatus();
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });
  }

  updateStatus() {
    // 更新状态显示
    const poolSize = this.objectPool.getLength();
    const activeInPool = this.objectPool.countActive(true);
    
    this.statusText.setText([
      `对象池大小: ${poolSize}/5`,
      `活跃对象: ${this.activeCount}`,
      `总生成次数: ${this.spawnedCount}`,
      `总回收次数: ${this.recycledCount}`,
      `池中活跃: ${activeInPool}`
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);