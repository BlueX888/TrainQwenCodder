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
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大容量为3
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 3,
      runChildUpdate: false
    });

    // 初始化3个对象
    for (let i = 0; i < 3; i++) {
      this.spawnObject();
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加点击事件手动触发回收测试
    this.input.on('pointerdown', () => {
      this.spawnObject();
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取对象（如果池已满会复用已有对象）
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕中央区域）
      const x = Phaser.Math.Between(200, 600);
      const y = Phaser.Math.Between(100, 300);
      
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      obj.setVelocity(velocityX, velocityY);
      
      // 设置边界反弹
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(false); // 不反弹，让其离开屏幕
      
      this.activeCount++;
    }
  }

  update(time, delta) {
    // 检查所有活动对象
    const children = this.objectPool.getChildren();
    
    children.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界（增加一些缓冲区）
        const buffer = 50;
        const outOfBounds = 
          obj.x < -buffer || 
          obj.x > this.scale.width + buffer ||
          obj.y < -buffer || 
          obj.y > this.scale.height + buffer;

        if (outOfBounds) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatusText();
  }

  recycleObject(obj) {
    // 停止物理运动
    obj.setVelocity(0, 0);
    
    // 回收到对象池
    obj.setActive(false);
    obj.setVisible(false);
    
    this.recycleCount++;
    
    // 延迟后重新生成对象（模拟复用）
    this.time.delayedCall(500, () => {
      this.spawnObject();
    });
  }

  updateStatusText() {
    const activeObjects = this.objectPool.countActive(true);
    this.statusText.setText([
      `Active Objects: ${activeObjects}`,
      `Pool Size: ${this.objectPool.getLength()}`,
      `Max Size: ${this.objectPool.maxSize}`,
      `Total Recycled: ${this.recycleCount}`,
      `Click to spawn more objects`
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