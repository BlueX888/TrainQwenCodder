class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总生成次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();

    // 创建对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 20,
      createCallback: (sprite) => {
        // 对象创建时的初始化
        sprite.setActive(false);
        sprite.setVisible(false);
      }
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每500ms发射一个）
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
      // 随机从屏幕左侧或顶部生成
      const spawnFromTop = Math.random() > 0.5;
      
      if (spawnFromTop) {
        obj.setPosition(Phaser.Math.Between(50, 750), -32);
        obj.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(100, 200));
      } else {
        obj.setPosition(-32, Phaser.Math.Between(50, 550));
        obj.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-50, 50));
      }

      obj.setActive(true);
      obj.setVisible(true);
      
      this.spawnedCount++;
      this.activeCount++;
      this.updateStatus();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    const children = this.objectPool.getChildren();
    
    children.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界（增加缓冲区）
        const outOfBounds = 
          obj.x < -50 || 
          obj.x > 850 || 
          obj.y < -50 || 
          obj.y > 650;

        if (outOfBounds) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 停止物理运动
    obj.setVelocity(0, 0);
    obj.setActive(false);
    obj.setVisible(false);
    
    this.recycledCount++;
    this.activeCount--;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `对象池状态:`,
      `活跃对象: ${this.activeCount} / 20`,
      `总生成数: ${this.spawnedCount}`,
      `总回收数: ${this.recycledCount}`,
      `池中可用: ${this.objectPool.getLength() - this.activeCount}`
    ]);
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);