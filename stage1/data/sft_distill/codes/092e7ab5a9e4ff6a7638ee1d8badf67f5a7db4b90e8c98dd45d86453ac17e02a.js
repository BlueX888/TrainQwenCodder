class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总发射数
    this.totalRecycled = 0;    // 总回收数
    this.poolSize = 15;        // 对象池大小
  }

  preload() {
    // 使用 Graphics 创建红色方块纹理
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
      maxSize: this.poolSize,
      runChildUpdate: true,
      createCallback: (obj) => {
        // 对象创建时的回调
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预创建池中的所有对象
    for (let i = 0; i < this.poolSize; i++) {
      const obj = this.objectPool.create(0, 0, 'redBox');
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

    // 定时发射对象（每0.5秒）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 鼠标点击也可以发射对象
    this.input.on('pointerdown', () => {
      this.spawnObject();
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取一个非活跃对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = 0;
      
      // 激活并显示对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度（向下和随机水平方向）
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 200);
      obj.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.activeCount++;
      this.updateStatusText();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.totalRecycled++;
    this.activeCount--;
    this.updateStatusText();
  }

  updateStatusText() {
    const poolUsage = `${this.activeCount}/${this.poolSize}`;
    this.statusText.setText([
      `对象池使用: ${poolUsage}`,
      `总发射数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `可复用次数: ${this.totalSpawned - this.poolSize}`,
      '',
      '点击屏幕发射对象'
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

const game = new Phaser.Game(config);