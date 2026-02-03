class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycleCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('cyanCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.pool = this.physics.add.group({
      defaultKey: 'cyanCircle',
      maxSize: 8,
      createCallback: (sprite) => {
        sprite.setActive(false);
        sprite.setVisible(false);
      }
    });

    // 预先创建 8 个对象
    for (let i = 0; i < 8; i++) {
      const obj = this.pool.create(0, 0, 'cyanCircle');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 800ms）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射几个对象
    this.time.delayedCall(100, () => this.spawnObject());
    this.time.delayedCall(300, () => this.spawnObject());
  }

  spawnObject() {
    // 从对象池获取一个未激活的对象
    const obj = this.pool.getFirstDead(false);
    
    if (obj) {
      // 随机生成位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = -50;
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      // 激活对象
      obj.setPosition(startX, startY);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));

      this.spawnCount++;
      this.activeCount++;
    }
  }

  update() {
    // 检查所有活跃对象
    this.pool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          // 回收对象
          obj.setActive(false);
          obj.setVisible(false);
          obj.setVelocity(0, 0);
          obj.setAngularVelocity(0);
          
          this.recycleCount++;
          this.activeCount--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Pool Size: 8`,
      `Active Objects: ${this.activeCount}`,
      `Total Spawned: ${this.spawnCount}`,
      `Total Recycled: ${this.recycleCount}`,
      `Available: ${this.pool.countDead(false)}`
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