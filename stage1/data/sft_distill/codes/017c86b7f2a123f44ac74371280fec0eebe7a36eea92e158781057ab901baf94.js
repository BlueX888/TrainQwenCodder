class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('cyanBlock', 32, 32);
    graphics.destroy();

    // 创建对象池 Group，最大 8 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'cyanBlock',
      maxSize: 8,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化发射 8 个对象
    for (let i = 0; i < 8; i++) {
      this.spawnObject(i * 100);
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  spawnObject(delay = 0) {
    this.time.delayedCall(delay, () => {
      // 从对象池获取或创建对象
      const obj = this.objectPool.get(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 150)
      );

      if (obj) {
        obj.setActive(true);
        obj.setVisible(true);
        
        // 设置随机速度
        const velocityX = Phaser.Math.Between(-200, 200);
        const velocityY = Phaser.Math.Between(100, 300);
        obj.setVelocity(velocityX, velocityY);
        
        // 添加旋转效果
        obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
        
        this.activeCount++;
        this.updateStatusText();
      }
    });
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (
          obj.x < -50 || 
          obj.x > 850 || 
          obj.y < -50 || 
          obj.y > 650
        ) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 回收到对象池
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    this.activeCount--;
    this.recycleCount++;
    this.updateStatusText();
    
    // 延迟后重新发射对象
    this.spawnObject(Phaser.Math.Between(500, 1500));
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const activeObjects = this.objectPool.countActive(true);
    
    this.statusText.setText([
      `对象池大小: ${poolSize}/8`,
      `活跃对象: ${activeObjects}`,
      `回收次数: ${this.recycleCount}`,
      `总激活次数: ${this.activeCount + activeObjects}`
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