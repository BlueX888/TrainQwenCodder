class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 用于验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成灰色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每1.5秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机生成 x 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵，位置在顶部
    const obstacle = this.obstacles.create(randomX, -20, 'obstacleTexture');
    
    // 设置向下的速度为 300
    obstacle.setVelocityY(300);
    
    // 增加计数器
    this.obstacleCount++;
    
    // 更新状态文本
    this.statusText.setText(`Obstacles: ${this.obstacleCount}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部50像素
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);