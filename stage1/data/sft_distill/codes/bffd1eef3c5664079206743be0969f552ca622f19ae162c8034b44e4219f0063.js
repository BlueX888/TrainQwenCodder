class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器事件，每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示障碍物计数（用于调试和验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 从顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边距
    
    // 创建物理精灵
    const obstacle = this.obstacles.create(randomX, -20, 'obstacleTexture');
    
    // 设置向下速度为 80
    obstacle.setVelocityY(80);
    
    // 更新计数器
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);

    // 当障碍物离开屏幕底部时销毁（避免内存泄漏）
    obstacle.setData('spawnTime', this.time.now);
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 620) { // 超出屏幕底部
        obstacle.destroy();
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);