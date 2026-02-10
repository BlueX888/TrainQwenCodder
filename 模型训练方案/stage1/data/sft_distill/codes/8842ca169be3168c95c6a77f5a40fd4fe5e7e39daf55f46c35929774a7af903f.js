class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器事件，每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒 = 1500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边界空间
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');

    // 设置向下速度为 80
    obstacle.setVelocityY(80);

    // 增加计数
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);

    // 当障碍物离开屏幕底部时销毁（避免内存泄漏）
    obstacle.setData('created', true);
  }

  update(time, delta) {
    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部
        obstacle.destroy();
      }
    });
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);