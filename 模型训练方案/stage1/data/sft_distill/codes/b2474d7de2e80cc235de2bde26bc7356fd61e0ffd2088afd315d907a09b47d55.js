class PooledObject extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'greenBox');
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x, y, velocityX, velocityY) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocity(velocityX, velocityY);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // 检测是否离开屏幕边界
    if (this.x < -50 || this.x > this.scene.game.config.width + 50 ||
        this.y < -50 || this.y > this.scene.game.config.height + 50) {
      this.setActive(false);
      this.setVisible(false);
      this.scene.objectRecycled();
    }
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjectCount = 0;
    this.totalRecycledCount = 0;
    this.totalSpawnedCount = 0;
  }

  preload() {
    // 程序化生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大 10 个对象
    this.objectPool = this.physics.add.group({
      classType: PooledObject,
      maxSize: 10,
      runChildUpdate: true
    });

    // 添加状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 每 800ms 发射一个对象
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

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机从屏幕四边发射
      const side = Phaser.Math.Between(0, 3);
      let x, y, vx, vy;

      switch(side) {
        case 0: // 从左边
          x = -20;
          y = Phaser.Math.Between(50, 550);
          vx = Phaser.Math.Between(100, 200);
          vy = Phaser.Math.Between(-100, 100);
          break;
        case 1: // 从右边
          x = 820;
          y = Phaser.Math.Between(50, 550);
          vx = Phaser.Math.Between(-200, -100);
          vy = Phaser.Math.Between(-100, 100);
          break;
        case 2: // 从上边
          x = Phaser.Math.Between(50, 750);
          y = -20;
          vx = Phaser.Math.Between(-100, 100);
          vy = Phaser.Math.Between(100, 200);
          break;
        case 3: // 从下边
          x = Phaser.Math.Between(50, 750);
          y = 620;
          vx = Phaser.Math.Between(-100, 100);
          vy = Phaser.Math.Between(-200, -100);
          break;
      }

      obj.fire(x, y, vx, vy);
      this.totalSpawnedCount++;
      this.updateStatusText();
    }
  }

  objectRecycled() {
    this.totalRecycledCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    // 计算当前活跃对象数
    this.activeObjectCount = this.objectPool.getChildren().filter(obj => obj.active).length;
    
    this.statusText.setText([
      `对象池状态:`,
      `活跃对象: ${this.activeObjectCount} / 10`,
      `已发射总数: ${this.totalSpawnedCount}`,
      `已回收总数: ${this.totalRecycledCount}`,
      `复用率: ${this.totalSpawnedCount > 0 ? Math.floor(this.totalRecycledCount / this.totalSpawnedCount * 100) : 0}%`
    ]);
  }

  update(time, delta) {
    this.updateStatusText();
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