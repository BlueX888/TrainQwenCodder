class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 使用 Graphics 创建黄色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的矩形
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 设置定时器，每 4 秒生成一个障碍物
    this.time.addEvent({
      delay: 4000, // 4 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.obstacleText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 120
    obstacle.setVelocityY(120);
    
    // 增加计数
    this.obstacleCount++;
    this.obstacleText.setText('Obstacles: ' + this.obstacleCount);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
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