class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;  // 验证状态：当前活跃对象数
    this.recycleCount = 0; // 验证状态：总回收次数
  }

  preload() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'purpleBox',
      maxSize: 5,
      runChildUpdate: false
    });

    // 初始化5个对象
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

    // 添加点击重置功能
    this.input.on('pointerdown', () => {
      this.recycleCount = 0;
    });

    console.log('对象池初始化完成，共5个紫色对象');
    console.log('对象离开屏幕底部后会自动回收并从顶部重新出现');
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get(
      Phaser.Math.Between(50, 750),  // 随机X位置
      -50                             // 从屏幕上方开始
    );

    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机下落速度
      obj.body.setVelocity(
        Phaser.Math.Between(-50, 50),   // 随机水平速度
        Phaser.Math.Between(100, 200)   // 向下速度
      );

      // 添加旋转效果
      obj.body.setAngularVelocity(Phaser.Math.Between(-100, 100));

      this.activeCount++;
    }
  }

  recycleObject(obj) {
    // 回收对象
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.setVelocity(0, 0);
    obj.body.setAngularVelocity(0);
    
    this.activeCount--;
    this.recycleCount++;

    // 立即重新生成
    this.spawnObject();
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach(obj => {
      if (obj.active) {
        // 检查是否离开屏幕底部
        if (obj.y > 650) {
          this.recycleObject(obj);
        }
        // 检查是否离开屏幕左右边界
        else if (obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    const poolSize = this.objectPool.getLength();
    const activeObjects = this.objectPool.countActive(true);
    
    this.statusText.setText([
      `对象池大小: ${poolSize}`,
      `活跃对象: ${activeObjects}`,
      `回收次数: ${this.recycleCount}`,
      ``,
      '点击屏幕重置计数器'
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