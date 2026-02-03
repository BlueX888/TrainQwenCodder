class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
    this.activeObstacles = 0; // 状态信号：当前活跃障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器事件，每2.5秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机x位置生成障碍物
    const randomX = Phaser.Math.Between(40, 760);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');

    // 设置向下速度为200
    obstacle.setVelocityY(200);

    // 更新计数器
    this.obstacleCount++;
    this.activeObstacles = this.obstacles.getChildren().length;

    console.log(`生成障碍物 #${this.obstacleCount} 在位置 (${randomX}, -20)`);
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });

    // 更新活跃障碍物数量
    this.activeObstacles = this.obstacles.getChildren().length;

    // 更新状态显示
    this.statusText.setText([
      `总生成数: ${this.obstacleCount}`,
      `当前活跃: ${this.activeObstacles}`
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);