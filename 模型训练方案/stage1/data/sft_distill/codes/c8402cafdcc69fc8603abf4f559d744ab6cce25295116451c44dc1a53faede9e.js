class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.recycleCount = 0;
    this.totalSpawned = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('cyanBlock', 32, 32);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'cyanBlock',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setCollideWorldBounds(false);
      }
    });

    // 初始化发射5个对象
    for (let i = 0; i < 5; i++) {
      this.spawnObject();
    }

    // 定时发射新对象（每2秒尝试发射一个）
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnObject,
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

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 200);
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(50, 200);

      // 激活并设置属性
      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setVelocity(velocityX, velocityY);

      this.totalSpawned++;
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活动对象
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    this.activeCount = activeObjects.length;

    activeObjects.forEach(obj => {
      // 检查是否离开屏幕边界（上下左右任意方向）
      if (obj.y > 650 || obj.y < -50 || obj.x < -50 || obj.x > 850) {
        // 回收对象到池中
        obj.setActive(false);
        obj.setVisible(false);
        obj.setVelocity(0, 0);
        
        this.recycleCount++;
        this.updateStatusText();
      }
    });
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeInPool = this.objectPool.countActive(true);
    const inactiveInPool = this.objectPool.countActive(false);

    this.statusText.setText([
      `对象池状态:`,
      `总对象数: ${poolSize}/5`,
      `活动对象: ${activeInPool}`,
      `空闲对象: ${inactiveInPool}`,
      `已发射次数: ${this.totalSpawned}`,
      `已回收次数: ${this.recycleCount}`
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