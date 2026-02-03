class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总发射次数（验证复用）
    this.recycledCount = 0;    // 回收次数
  }

  preload() {
    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBox',
      maxSize: 12,
      runChildUpdate: true,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始发射一些对象
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnObject();
      });
    }

    // 定时发射新对象（展示对象池复用）
    this.time.addEvent({
      delay: 1000,
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
    this.add.text(10, 560, '白色方块离开屏幕后会被回收并重新使用', {
      fontSize: '14px',
      fill: '#cccccc'
    });
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机从屏幕四边发射
      const side = Phaser.Math.Between(0, 3);
      let x, y, velocityX, velocityY;

      switch (side) {
        case 0: // 从左边
          x = -20;
          y = Phaser.Math.Between(50, 550);
          velocityX = Phaser.Math.Between(100, 200);
          velocityY = Phaser.Math.Between(-50, 50);
          break;
        case 1: // 从右边
          x = 820;
          y = Phaser.Math.Between(50, 550);
          velocityX = Phaser.Math.Between(-200, -100);
          velocityY = Phaser.Math.Between(-50, 50);
          break;
        case 2: // 从上边
          x = Phaser.Math.Between(50, 750);
          y = -20;
          velocityX = Phaser.Math.Between(-50, 50);
          velocityY = Phaser.Math.Between(100, 200);
          break;
        case 3: // 从下边
          x = Phaser.Math.Between(50, 750);
          y = 620;
          velocityX = Phaser.Math.Between(-50, 50);
          velocityY = Phaser.Math.Between(-200, -100);
          break;
      }

      // 激活并设置属性
      obj.setPosition(x, y);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setAlpha(1);
      
      this.totalSpawned++;
    }
  }

  update() {
    // 更新活跃对象计数
    this.activeCount = this.objectPool.countActive(true);

    // 检查并回收离开屏幕的对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        const bounds = 100; // 边界缓冲区
        if (obj.x < -bounds || obj.x > 800 + bounds || 
            obj.y < -bounds || obj.y > 600 + bounds) {
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
      `对象池大小: 12`,
      `当前活跃: ${this.activeCount}`,
      `总发射次数: ${this.totalSpawned}`,
      `回收次数: ${this.recycledCount}`,
      `复用率: ${this.totalSpawned > 0 ? 
        ((this.recycledCount / this.totalSpawned * 100).toFixed(1)) : 0}%`
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