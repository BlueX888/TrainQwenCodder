class PooledObject extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'blueBox');
  }

  fire(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    
    // 设置随机速度
    const angle = Phaser.Math.Between(-30, 30);
    const speed = Phaser.Math.Between(100, 200);
    this.setVelocity(
      Math.cos(Phaser.Math.DegToRad(angle)) * speed,
      Math.sin(Phaser.Math.DegToRad(angle)) * speed
    );
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // 检测是否离开屏幕
    const bounds = this.scene.physics.world.bounds;
    if (this.x < bounds.x - 50 || 
        this.x > bounds.right + 50 || 
        this.y < bounds.y - 50 || 
        this.y > bounds.bottom + 50) {
      this.setActive(false);
      this.setVisible(false);
      this.body.enable = false;
    }
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.totalFired = 0;
    this.recycledCount = 0;
  }

  preload() {
    // 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0x0044cc, 1);
    graphics.strokeRect(0, 0, 32, 32);
    graphics.generateTexture('blueBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建对象池，最大20个对象
    this.objectPool = this.physics.add.group({
      classType: PooledObject,
      maxSize: 20,
      runChildUpdate: true
    });

    // 定时发射对象
    this.time.addEvent({
      delay: 500,
      callback: this.launchObject,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 60, 'Objects are pooled and recycled\nwhen they leave the screen', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  launchObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 从屏幕底部中央发射
      obj.fire(400, 550);
      this.totalFired++;
    }
  }

  update(time, delta) {
    // 统计活跃对象数
    this.activeCount = this.objectPool.countActive(true);
    
    // 计算回收数
    this.recycledCount = this.totalFired - this.activeCount;

    // 更新状态显示
    this.statusText.setText([
      `Pool Size: ${this.objectPool.getLength()} / 20`,
      `Active: ${this.activeCount}`,
      `Total Fired: ${this.totalFired}`,
      `Recycled: ${this.recycledCount}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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