class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.recycleCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 创建红色方块纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建对象池 Group，最大 15 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 15,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 500ms）
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
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机生成位置（从屏幕顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = -50;
      
      // 激活并设置属性
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 设置旋转速度
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.spawnCount++;
      this.updateActiveCount();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    
    activeObjects.forEach(obj => {
      // 检查是否离开屏幕边界（包含所有方向）
      if (obj.y > 650 || obj.y < -50 || obj.x < -50 || obj.x > 850) {
        this.recycleObject(obj);
      }
    });
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    this.recycleCount++;
    this.updateActiveCount();
  }

  updateActiveCount() {
    this.activeCount = this.objectPool.getChildren().filter(obj => obj.active).length;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `对象池大小: ${this.objectPool.getLength()}/${this.objectPool.maxSize}`,
      `活跃对象: ${this.activeCount}`,
      `已发射: ${this.spawnCount}`,
      `已回收: ${this.recycleCount}`,
      `回收率: ${this.spawnCount > 0 ? Math.round(this.recycleCount / this.spawnCount * 100) : 0}%`
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