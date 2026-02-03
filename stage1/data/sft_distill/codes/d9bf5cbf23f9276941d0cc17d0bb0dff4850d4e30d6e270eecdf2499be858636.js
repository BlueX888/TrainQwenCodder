class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1); // 白色
    graphics.fillRect(0, 0, 32, 32); // 32x32 的方块
    graphics.generateTexture('obstacle', 32, 32);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.updateStatusText();
  }

  spawnObstacle() {
    const { width } = this.cameras.main;

    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(32, width - 32);
    const obstacle = this.obstacles.create(randomX, -32, 'obstacle');

    // 设置向下速度为 120
    obstacle.setVelocityY(120);

    // 增加计数器
    this.obstacleCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `Obstacles Spawned: ${this.obstacleCount}\n` +
      `Active Obstacles: ${this.obstacles.getChildren().length}`
    );
  }

  update() {
    const { height } = this.cameras.main;

    // 清理超出屏幕底部的障碍物
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.y > height + 50) {
        obstacle.destroy();
        this.updateStatusText();
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
      gravity: { y: 0 }, // 不使用重力，通过速度控制下落
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);