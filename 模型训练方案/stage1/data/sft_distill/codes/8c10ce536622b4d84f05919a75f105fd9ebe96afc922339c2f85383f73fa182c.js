class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总生成次数
  }

  preload() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 20,
      runChildUpdate: false,
      createCallback: (obj) => {
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

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get();
    
    if (obj) {
      // 随机起始位置（屏幕顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = -32;
      
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      this.spawnedCount++;
      this.activeCount++;
    }
  }

  update() {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    
    activeObjects.forEach(obj => {
      // 检查是否离开屏幕
      if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
        this.recycleObject(obj);
      }
    });

    this.updateStatus();
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycledCount++;
    this.activeCount--;
  }

  updateStatus() {
    // 更新状态显示
    const poolSize = this.objectPool.getLength();
    const activeInPool = this.objectPool.countActive(true);
    
    this.statusText.setText([
      `对象池大小: ${poolSize}/20`,
      `活跃对象: ${this.activeCount}`,
      `总生成数: ${this.spawnedCount}`,
      `总回收数: ${this.recycledCount}`,
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);