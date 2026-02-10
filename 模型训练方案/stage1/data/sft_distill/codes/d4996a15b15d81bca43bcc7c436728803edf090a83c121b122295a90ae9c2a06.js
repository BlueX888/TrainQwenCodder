class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：生成的障碍物总数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建灰色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 设置定时器：每 0.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（确保障碍物完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物（从顶部生成，y = -20 确保从屏幕外进入）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 360
    obstacle.setVelocityY(360);
    
    // 增加计数器
    this.obstacleCount++;
    
    // 当障碍物离开屏幕底部时销毁（避免内存泄漏）
    obstacle.setCollideWorldBounds(false);
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText(`Obstacles Created: ${this.obstacleCount}`);

    // 清理离开屏幕的障碍物
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
  backgroundColor: '#000000',
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