class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 活跃对象数量
    this.launchCount = 0;      // 总发射次数
    this.recycleCount = 0;     // 回收次数
  }

  preload() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'grayBox',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预先创建 5 个对象
    for (let i = 0; i < 5; i++) {
      const obj = this.objectPool.create(0, 0, 'grayBox');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(400, 300, 'Click to Launch Objects', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 点击发射对象
    this.input.on('pointerdown', (pointer) => {
      this.launchObject(pointer.x, pointer.y);
    });

    // 每秒自动发射一个对象（用于演示）
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const x = Phaser.Math.Between(100, 700);
        const y = 100;
        this.launchObject(x, y);
      },
      loop: true
    });

    this.updateStatus();
  }

  launchObject(x, y) {
    // 从对象池获取非活跃对象
    const obj = this.objectPool.getFirstDead(false);
    
    if (obj) {
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.launchCount++;
      this.updateActiveCount();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕
        if (obj.y > 650 || obj.x < -50 || obj.x > 850 || obj.y < -50) {
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
    obj.setAngularVelocity(0);
    obj.setRotation(0);
    
    this.recycleCount++;
    this.updateActiveCount();
  }

  updateActiveCount() {
    // 统计活跃对象数量
    this.activeCount = this.objectPool.countActive(true);
    this.updateStatus();
  }

  updateStatus() {
    // 更新状态显示
    const poolSize = this.objectPool.getLength();
    const availableCount = poolSize - this.activeCount;
    
    this.statusText.setText([
      `Pool Size: ${poolSize}`,
      `Active Objects: ${this.activeCount}`,
      `Available: ${availableCount}`,
      `Total Launched: ${this.launchCount}`,
      `Total Recycled: ${this.recycleCount}`
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