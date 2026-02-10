class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器，每4秒生成一个障碍物
    this.time.addEvent({
      delay: 4000, // 4秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const x = Phaser.Math.Between(20, 780); // 留出边距
    const y = -20; // 从屏幕上方开始

    // 创建障碍物精灵
    const obstacle = this.obstacles.create(x, y, 'obstacle');
    
    // 设置垂直速度为 240（向下）
    obstacle.setVelocityY(240);

    // 更新计数器
    this.obstacleCount++;
    this.statusText.setText(`Obstacles: ${this.obstacleCount}`);

    console.log(`Obstacle spawned at x=${x}, total count: ${this.obstacleCount}`);
  }

  update(time, delta) {
    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
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
      gravity: { y: 0 }, // 不使用全局重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);