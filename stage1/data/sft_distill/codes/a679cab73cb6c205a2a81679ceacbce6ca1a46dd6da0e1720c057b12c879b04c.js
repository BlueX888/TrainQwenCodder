class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器，每 0.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    // 从顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边界空间
    const obstacle = this.obstacles.create(randomX, -20, 'obstacleTexture');

    // 设置向下速度为 360
    obstacle.setVelocityY(360);

    // 增加计数
    this.obstacleCount++;

    console.log(`障碍物已生成 #${this.obstacleCount} at x=${randomX}`);
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText(
      `障碍物数量: ${this.obstacleCount}\n` +
      `活跃障碍物: ${this.obstacles.getChildren().length}`
    );

    // 清理超出屏幕底部的障碍物
    this.obstacles.getChildren().forEach(obstacle => {
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