class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：生成的障碍物总数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacleTexture',
      maxSize: 50 // 限制最大数量避免内存泄漏
    });

    // 添加定时器：每1.5秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机X位置（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 从顶部生成障碍物
    const obstacle = this.obstacles.get(randomX, -20);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.setVelocityY(120); // 设置下落速度
      
      // 更新计数
      this.obstacleCount++;
      this.countText.setText('Obstacles: ' + this.obstacleCount);
    }
  }

  update() {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > 650) {
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
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