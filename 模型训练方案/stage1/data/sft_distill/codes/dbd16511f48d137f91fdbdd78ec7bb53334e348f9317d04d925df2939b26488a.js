class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.recycledCount = 0;
    this.totalSpawned = 0;
  }

  preload() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('grayBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'grayBox',
      maxSize: 12,
      runChildUpdate: true,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预创建 12 个对象到池中
    for (let i = 0; i < 12; i++) {
      const obj = this.objectPool.create(0, 0, 'grayBox');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加点击重置功能
    this.input.on('pointerdown', () => {
      this.recycledCount = 0;
      this.totalSpawned = 0;
    });

    // 添加说明文本
    this.add.text(10, 550, 'Click to reset counters', {
      fontSize: '14px',
      fill: '#cccccc'
    });
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置生成（顶部）
      const x = Phaser.Math.Between(50, 750);
      obj.setPosition(x, -20);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      this.totalSpawned++;
    }
  }

  update() {
    // 更新活跃对象计数
    this.activeCount = 0;
    
    // 检查所有对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        this.activeCount++;
        
        // 检查是否离开屏幕
        if (obj.y > 620 || obj.x < -50 || obj.x > 850) {
          // 回收对象
          obj.setActive(false);
          obj.setVisible(false);
          obj.setVelocity(0, 0);
          this.recycledCount++;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Pool Size: 12`,
      `Active Objects: ${this.activeCount}`,
      `Recycled Count: ${this.recycledCount}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Available in Pool: ${12 - this.activeCount}`
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