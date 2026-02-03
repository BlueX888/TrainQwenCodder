class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 100 // 限制最大数量防止内存溢出
    });

    // 创建定时器，每1秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  spawnObstacle() {
    // 在顶部随机位置生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');

    if (obstacle) {
      // 设置向下速度为 360
      obstacle.setVelocityY(360);
      
      // 增加计数
      this.obstacleCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Obstacles Spawned: ${this.obstacleCount}\n` +
      `Active Obstacles: ${this.obstacles.getLength()}`
    );
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
        this.obstacles.killAndHide(obstacle);
        obstacle.body.enable = false;
      }
    });

    this.updateStatusText();
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);