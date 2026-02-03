class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
    this.obstacles = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40); // 40x40 方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器事件：每 3000 毫秒（3秒）生成一个障碍物
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示障碍物数量（用于验证）
    this.obstacleText = this.add.text(16, 16, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 X 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部上方创建障碍物（Y = -50，避免突然出现）
    const obstacle = this.obstacles.create(randomX, -50, 'obstacleTexture');
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 更新障碍物计数
    this.obstacleCount++;
    this.obstacleText.setText('Obstacles: ' + this.obstacleCount);
    
    console.log(`Obstacle ${this.obstacleCount} spawned at X: ${randomX}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物（优化性能）
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });
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
      gravity: { y: 0 }, // 不使用全局重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);