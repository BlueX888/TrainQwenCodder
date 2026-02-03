class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总发射数
    this.recycledCount = 0;    // 回收次数
  }

  preload() {
    // 创建橙色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xFF6600, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('orangeCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大20个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'orangeCircle',
      maxSize: 20,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 定时发射对象（每500ms发射一个）
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

    // 添加边界提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.strokeRect(0, 0, 800, 600);

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 随机位置和速度
      const spawnSide = Phaser.Math.Between(0, 3);
      let x, y, velocityX, velocityY;
      
      switch(spawnSide) {
        case 0: // 从左边发射
          x = -20;
          y = Phaser.Math.Between(50, 550);
          velocityX = Phaser.Math.Between(100, 200);
          velocityY = Phaser.Math.Between(-100, 100);
          break;
        case 1: // 从右边发射
          x = 820;
          y = Phaser.Math.Between(50, 550);
          velocityX = Phaser.Math.Between(-200, -100);
          velocityY = Phaser.Math.Between(-100, 100);
          break;
        case 2: // 从上边发射
          x = Phaser.Math.Between(50, 750);
          y = -20;
          velocityX = Phaser.Math.Between(-100, 100);
          velocityY = Phaser.Math.Between(100, 200);
          break;
        case 3: // 从下边发射
          x = Phaser.Math.Between(50, 750);
          y = 620;
          velocityX = Phaser.Math.Between(-100, 100);
          velocityY = Phaser.Math.Between(-200, -100);
          break;
      }
      
      obj.setPosition(x, y);
      obj.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.updateStatus();
    }
  }

  update() {
    // 检查所有活跃对象
    const children = this.objectPool.getChildren();
    this.activeCount = 0;
    
    children.forEach((obj) => {
      if (obj.active) {
        this.activeCount++;
        
        // 检测是否离开屏幕边界（带缓冲区）
        const buffer = 50;
        if (obj.x < -buffer || obj.x > 800 + buffer || 
            obj.y < -buffer || obj.y > 600 + buffer) {
          // 回收对象
          obj.setActive(false);
          obj.setVisible(false);
          obj.setVelocity(0, 0);
          this.recycledCount++;
        }
      }
    });
    
    this.updateStatus();
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const maxSize = this.objectPool.maxSize;
    
    this.statusText.setText([
      `对象池状态:`,
      `池大小: ${poolSize}/${maxSize}`,
      `活跃对象: ${this.activeCount}`,
      `总发射数: ${this.totalSpawned}`,
      `回收次数: ${this.recycledCount}`,
      `复用率: ${this.totalSpawned > 0 ? 
        ((this.recycledCount / this.totalSpawned) * 100).toFixed(1) : 0}%`
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