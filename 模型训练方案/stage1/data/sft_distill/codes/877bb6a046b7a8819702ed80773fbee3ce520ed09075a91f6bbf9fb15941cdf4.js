class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0; // 可验证状态：对象激活总次数
    this.pooledCount = 3; // 可验证状态：池中对象数量
  }

  preload() {
    // 使用 Graphics 生成红色方块纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 3, // 对象池最大容量为 3
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预先创建 3 个对象填充池
    for (let i = 0; i < 3; i++) {
      const obj = this.objectPool.get();
      if (obj) {
        obj.setActive(false);
        obj.setVisible(false);
      }
    }

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时激活对象（每 2 秒）
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始激活一个对象
    this.spawnObject();

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 随机设置初始位置（屏幕左侧）
      obj.setPosition(50, Phaser.Math.Between(50, 550));
      
      // 设置随机速度（向右移动）
      obj.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-50, 50));
      
      // 增加激活计数
      this.activeCount++;
      
      this.updateStatus();
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测对象是否离开屏幕（右侧、上侧或下侧）
        if (obj.x > 850 || obj.y < -50 || obj.y > 650) {
          // 回收对象到池中
          obj.setActive(false);
          obj.setVisible(false);
          obj.setVelocity(0, 0);
          
          this.updateStatus();
          
          console.log(`对象已回收，池中可用对象数: ${this.getAvailableCount()}`);
        }
      }
    });
  }

  getAvailableCount() {
    // 计算池中可用（未激活）的对象数量
    return this.objectPool.getChildren().filter(obj => !obj.active).length;
  }

  getActiveObjectCount() {
    // 计算当前活跃的对象数量
    return this.objectPool.getChildren().filter(obj => obj.active).length;
  }

  updateStatus() {
    const available = this.getAvailableCount();
    const active = this.getActiveObjectCount();
    
    this.statusText.setText([
      `对象池状态:`,
      `总激活次数: ${this.activeCount}`,
      `当前活跃: ${active}`,
      `池中可用: ${available}`,
      `池总容量: ${this.pooledCount}`
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