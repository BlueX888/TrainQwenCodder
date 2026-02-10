class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器：每2秒生成一个障碍物
    this.time.addEvent({
      delay: 2000, // 2秒 = 2000毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 坐标生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边界空间
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');

    // 设置速度：向下移动，速度为 120
    obstacle.setVelocityY(120);

    // 更新计数器
    this.obstacleCount++;
    this.statusText.setText(`Obstacles: ${this.obstacleCount}`);

    // 当障碍物离开屏幕底部时销毁（优化性能）
    obstacle.setData('created', true);
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
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
      gravity: { y: 0 }, // 不使用重力，通过速度控制下落
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);