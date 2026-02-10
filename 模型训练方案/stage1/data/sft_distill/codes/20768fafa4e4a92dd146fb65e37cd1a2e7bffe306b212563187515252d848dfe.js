class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 累计回收次数
    this.spawnedCount = 0;     // 累计生成次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 程序化生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBlock', 32, 32);
    graphics.destroy();

    // 2. 创建物理对象池，最大容量 20
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBlock',
      maxSize: 20,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 3. 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 4. 定时生成对象（每 500ms 生成一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 5. 添加说明文本
    this.add.text(10, 560, '绿色方块会从上方生成并向下移动，离屏后自动回收', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  spawnObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get();
    
    if (obj) {
      // 随机 X 位置，从屏幕上方生成
      const x = Phaser.Math.Between(50, 750);
      const y = -50;
      
      // 激活并显示对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(x, y);
      
      // 设置随机向下速度
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(0, velocityY);
      
      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕底部
        if (obj.y > 650) {
          // 回收对象
          obj.setActive(false);
          obj.setVisible(false);
          obj.setVelocity(0, 0);
          
          this.recycledCount++;
        }
      }
    });

    // 更新状态显示
    this.activeCount = this.objectPool.countActive(true);
    const poolSize = this.objectPool.getLength();
    
    this.statusText.setText([
      `对象池容量: ${poolSize}/20`,
      `活跃对象: ${this.activeCount}`,
      `累计生成: ${this.spawnedCount}`,
      `累计回收: ${this.recycledCount}`,
      `复用率: ${this.spawnedCount > 0 ? ((this.recycledCount / this.spawnedCount) * 100).toFixed(1) : 0}%`
    ]);
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);