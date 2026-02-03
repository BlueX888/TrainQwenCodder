class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 验证信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建障碍物组（用于管理多个障碍物）
    this.obstacles = this.physics.add.group();

    // 添加定时器事件，每4秒生成一个障碍物
    this.time.addEvent({
      delay: 4000, // 4秒 = 4000毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 从顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');

    // 设置垂直速度为 200（向下移动）
    obstacle.setVelocityY(200);

    // 添加到障碍物组
    this.obstacles.add(obstacle);

    // 更新计数器
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);

    console.log(`障碍物 #${this.obstacleCount} 已生成，位置: (${randomX}, -20)`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
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