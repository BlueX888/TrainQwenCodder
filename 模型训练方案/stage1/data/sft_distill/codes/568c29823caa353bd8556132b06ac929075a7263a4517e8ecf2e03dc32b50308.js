class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.recycleCount = 0; // 记录回收次数
    this.activeCount = 0; // 记录当前活跃对象数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径 16 的圆形
    graphics.generateTexture('cyanBall', 32, 32);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'cyanBall',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化 5 个对象
    for (let i = 0; i < 5; i++) {
      this.spawnObject();
    }

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
    // 从对象池获取或创建对象
    let obj = this.objectPool.get();
    
    if (!obj) {
      return; // 对象池已满
    }

    // 随机位置（屏幕上边缘或左边缘）
    const spawnSide = Phaser.Math.Between(0, 1);
    let x, y;
    
    if (spawnSide === 0) {
      // 从上边缘生成
      x = Phaser.Math.Between(50, 750);
      y = -20;
    } else {
      // 从左边缘生成
      x = -20;
      y = Phaser.Math.Between(50, 550);
    }

    obj.setPosition(x, y);
    obj.setActive(true);
    obj.setVisible(true);

    // 设置随机速度
    const velocityX = Phaser.Math.Between(50, 150);
    const velocityY = Phaser.Math.Between(50, 150);
    obj.setVelocity(velocityX, velocityY);

    // 设置边界
    obj.setBounce(0);
    obj.setCollideWorldBounds(false);

    this.activeCount++;
  }

  recycleObject(obj) {
    // 回收对象
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycleCount++;
    this.activeCount--;

    // 重新生成对象
    this.time.delayedCall(100, () => {
      this.spawnObject();
    });
  }

  update(time, delta) {
    // 检查所有活跃对象是否离开屏幕
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.x < -50 || obj.x > 850 || obj.y < -50 || obj.y > 650) {
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      'Object Pool Demo',
      `Recycle Count: ${this.recycleCount}`,
      `Active Objects: ${this.activeCount}`,
      `Pool Size: ${this.objectPool.getLength()}`,
      `Max Size: ${this.objectPool.maxSize}`
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