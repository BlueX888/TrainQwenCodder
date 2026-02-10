class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建青色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器事件，每2.5秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示生成数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机X位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 考虑障碍物宽度，避免超出边界
    
    // 创建障碍物精灵
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为200
    obstacle.setVelocityY(200);
    
    // 增加计数
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);

    // 当障碍物离开屏幕底部时销毁（优化性能）
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;
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
      gravity: { y: 0 }, // 不使用重力，通过速度控制
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);