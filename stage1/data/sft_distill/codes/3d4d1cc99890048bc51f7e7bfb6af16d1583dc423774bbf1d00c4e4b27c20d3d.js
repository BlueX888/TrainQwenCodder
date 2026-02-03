class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.recycleCount = 0;
  }

  preload() {
    // 程序化生成红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('redBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大容量为3
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 3,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化3个对象
    for (let i = 0; i < 3; i++) {
      this.spawnObject(i * 150 + 100);
    }

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  spawnObject(x) {
    // 从对象池获取对象
    const obj = this.objectPool.get(x, -50);
    
    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置向下移动速度
      obj.body.setVelocity(0, 150);
      
      this.activeCount++;
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active && obj.y > this.cameras.main.height + 50) {
        // 对象离开屏幕底部，回收
        this.recycleObject(obj);
      }
    });
  }

  recycleObject(obj) {
    // 记录回收次数
    this.recycleCount++;
    
    // 回收对象（隐藏并标记为不活跃）
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.setVelocity(0, 0);
    
    // 立即从池中重新获取并重置位置
    const randomX = Phaser.Math.Between(50, 750);
    this.spawnObject(randomX);
    
    this.updateStatusText();
  }

  updateStatusText() {
    const activeObjects = this.objectPool.countActive(true);
    this.statusText.setText([
      `Active Objects: ${activeObjects}/3`,
      `Total Recycled: ${this.recycleCount}`,
      `Pool Size: ${this.objectPool.getLength()}`
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