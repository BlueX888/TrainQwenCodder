class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.poolStats = {
      activeCount: 0,
      recycleCount: 0,
      totalSpawns: 0
    };
  }

  preload() {
    // 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大容量为 3
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBox',
      maxSize: 3,
      runChildUpdate: false
    });

    // 初始化 3 个对象
    for (let i = 0; i < 3; i++) {
      this.spawnObject();
    }

    // 显示状态信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatsDisplay();

    // 添加说明文本
    this.add.text(10, 550, '绿色方块离开屏幕后会自动回收并重新生成', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕内）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      // 激活并设置位置
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加边界碰撞反弹
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(false); // 不使用世界边界碰撞，手动检测
      
      // 更新统计
      this.poolStats.totalSpawns++;
      this.poolStats.activeCount = this.objectPool.countActive(true);
      
      this.updateStatsDisplay();
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    // 更新统计
    this.poolStats.recycleCount++;
    this.poolStats.activeCount = this.objectPool.countActive(true);
    
    this.updateStatsDisplay();
    
    // 立即重新生成一个新对象
    this.time.delayedCall(100, () => {
      this.spawnObject();
    });
  }

  update(time, delta) {
    // 检查所有活动对象是否离开屏幕
    this.objectPool.getChildren().forEach(obj => {
      if (obj.active) {
        const outOfBounds = 
          obj.x < -50 || 
          obj.x > 850 || 
          obj.y < -50 || 
          obj.y > 650;
        
        if (outOfBounds) {
          this.recycleObject(obj);
        }
      }
    });
  }

  updateStatsDisplay() {
    this.statsText.setText([
      `对象池状态:`,
      `激活对象: ${this.poolStats.activeCount} / 3`,
      `回收次数: ${this.poolStats.recycleCount}`,
      `总生成次数: ${this.poolStats.totalSpawns}`
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