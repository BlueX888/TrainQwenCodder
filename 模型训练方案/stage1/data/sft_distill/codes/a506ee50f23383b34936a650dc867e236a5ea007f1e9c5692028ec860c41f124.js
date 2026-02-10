class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.poolSize = 20;
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('orangeCircle', 32, 32);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'orangeCircle',
      maxSize: this.poolSize,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预创建对象池中的所有对象
    for (let i = 0; i < this.poolSize; i++) {
      const obj = this.objectPool.create(0, 0, 'orangeCircle');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 定时发射对象
    this.time.addEvent({
      delay: 500,
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

    // 添加说明文字
    this.add.text(10, 550, '橙色圆球会从上方落下，离开屏幕后自动回收重用', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取一个非活动对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 重置对象位置和状态
      const x = Phaser.Math.Between(50, 750);
      obj.setPosition(x, -50);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      const velocityY = Phaser.Math.Between(100, 300);
      const velocityX = Phaser.Math.Between(-50, 50);
      obj.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活动对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          // 回收对象
          obj.setActive(false);
          obj.setVisible(false);
          obj.setVelocity(0, 0);
          
          this.totalRecycled++;
          this.activeCount = this.objectPool.countActive(true);
          this.updateStatusText();
        }
      }
    });
  }

  updateStatusText() {
    const poolUsage = this.objectPool.countActive(true);
    const poolAvailable = this.poolSize - poolUsage;
    
    this.statusText.setText([
      `对象池大小: ${this.poolSize}`,
      `活动对象: ${poolUsage}`,
      `可用对象: ${poolAvailable}`,
      `总发射数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`
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