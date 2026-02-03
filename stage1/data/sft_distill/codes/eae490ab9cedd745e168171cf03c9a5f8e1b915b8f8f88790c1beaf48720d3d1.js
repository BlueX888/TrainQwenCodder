class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 活跃对象数
    this.recycledCount = 0;    // 已回收对象数
    this.launchCount = 0;      // 总发射次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBlock', 32, 32);
    graphics.destroy();

    // 创建对象池（Physics Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBlock',
      maxSize: 12,              // 最大对象数量
      runChildUpdate: false,    // 不自动调用子对象的 update
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 500ms 发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.launchObject,
      callbackScope: this,
      loop: true
    });

    // 更新状态显示
    this.updateStatus();
  }

  launchObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get(
      Phaser.Math.Between(50, 750),  // 随机 X 位置
      -50                             // 屏幕上方
    );

    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      obj.setVelocity(
        Phaser.Math.Between(-100, 100),  // X 方向速度
        Phaser.Math.Between(100, 200)    // Y 方向速度（向下）
      );

      this.launchCount++;
      this.updateStatus();
    }
  }

  update() {
    // 检查并回收离开屏幕的对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatus();
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setPosition(-100, -100);  // 移到屏幕外
    
    this.recycledCount++;
  }

  updateStatus() {
    // 计算当前活跃对象数
    this.activeCount = this.objectPool.countActive(true);
    
    // 更新状态显示
    this.statusText.setText([
      `Pool Size: ${this.objectPool.maxSize}`,
      `Active Objects: ${this.activeCount}`,
      `Total Launched: ${this.launchCount}`,
      `Total Recycled: ${this.recycledCount}`,
      `Pool Usage: ${this.activeCount}/${this.objectPool.maxSize}`
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
  scene: PoolScene
};

// 启动游戏
new Phaser.Game(config);