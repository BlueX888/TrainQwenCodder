class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 验证信号：生成的障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 1. 使用 Graphics 生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 2. 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacleTexture',
      maxSize: 50 // 限制最大数量避免内存溢出
    });

    // 3. 设置定时器每1.5秒生成障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(16, 16, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 4. 在顶部随机 x 坐标生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边距
    const obstacle = this.obstacles.get(randomX, -40); // 从顶部上方生成

    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 5. 设置向下速度为 80
      obstacle.setVelocityY(80);
      
      // 6. 更新计数器
      this.obstacleCount++;
      this.countText.setText('Obstacles: ' + this.obstacleCount);
    }
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > 650) {
        this.obstacles.killAndHide(obstacle);
        obstacle.setVelocity(0);
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
      gravity: { y: 0 }, // 无重力，通过速度控制下落
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);