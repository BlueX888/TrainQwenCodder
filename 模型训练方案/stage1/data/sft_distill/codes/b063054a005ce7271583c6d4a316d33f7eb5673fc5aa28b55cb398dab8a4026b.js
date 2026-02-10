class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
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

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 设置定时器，每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（确保障碍物完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵，从顶部生成
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 80
    obstacle.setVelocityY(80);
    
    // 更新计数器
    this.obstacleCount++;
    
    // 当障碍物离开屏幕底部时销毁
    obstacle.setData('outOfBounds', false);
  }

  update() {
    // 更新状态文本
    this.statusText.setText(
      `Obstacles Generated: ${this.obstacleCount}\n` +
      `Active Obstacles: ${this.obstacles.getChildren().length}`
    );

    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 620) {
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