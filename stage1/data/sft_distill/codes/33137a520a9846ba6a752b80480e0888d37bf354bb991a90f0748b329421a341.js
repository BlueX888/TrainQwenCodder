class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总发射次数
  }

  preload() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('yellowBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 启用世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.on('worldbounds', this.onWorldBounds, this);

    // 创建对象池（Physics Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBlock',
      maxSize: 8,
      runChildUpdate: false,
      createCallback: (obj) => {
        // 设置物理体属性
        obj.body.onWorldBounds = true;
        obj.body.setCollideWorldBounds(false);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每0.8秒）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射几个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => this.spawnObject());
    }

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机从顶部或左侧发射
      const fromTop = Math.random() > 0.5;
      
      if (fromTop) {
        // 从顶部向下发射
        obj.setPosition(
          Phaser.Math.Between(50, 750),
          -20
        );
        obj.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(100, 200)
        );
      } else {
        // 从左侧向右发射
        obj.setPosition(
          -20,
          Phaser.Math.Between(50, 550)
        );
        obj.setVelocity(
          Phaser.Math.Between(100, 200),
          Phaser.Math.Between(-50, 50)
        );
      }

      obj.setActive(true);
      obj.setVisible(true);
      
      this.spawnedCount++;
      this.activeCount++;
      this.updateStatus();
    }
  }

  onWorldBounds(body) {
    // 检查是否是我们池中的对象
    const obj = body.gameObject;
    if (obj && this.objectPool.contains(obj)) {
      // 回收对象到池中
      this.objectPool.killAndHide(obj);
      obj.body.stop();
      
      this.recycledCount++;
      this.activeCount--;
      this.updateStatus();

      console.log(`对象已回收 - 活跃:${this.activeCount}, 总回收:${this.recycledCount}`);
    }
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const activeInPool = this.objectPool.countActive(true);
    
    this.statusText.setText([
      `对象池状态:`,
      `池大小: ${poolSize}/8`,
      `活跃对象: ${this.activeCount}`,
      `已发射: ${this.spawnedCount}`,
      `已回收: ${this.recycledCount}`,
      ``,
      `黄色方块离开屏幕后自动回收`
    ]);
  }

  update(time, delta) {
    // 检查是否有对象需要回收（额外的安全检查）
    this.objectPool.children.entries.forEach(obj => {
      if (obj.active) {
        const bounds = this.physics.world.bounds;
        if (obj.x < -50 || obj.x > bounds.width + 50 ||
            obj.y < -50 || obj.y > bounds.height + 50) {
          // 对象超出边界太远，强制回收
          this.objectPool.killAndHide(obj);
          obj.body.stop();
          this.activeCount--;
          this.recycledCount++;
          this.updateStatus();
        }
      }
    });
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