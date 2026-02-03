class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器，每1秒生成一个障碍物
    this.time.addEvent({
      delay: 1000, // 1秒 = 1000毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    console.log('游戏开始：障碍物将每秒从顶部随机位置生成');
  }

  spawnObstacle() {
    // 随机 x 位置（在屏幕宽度范围内，留出边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 从顶部上方创建障碍物（y = -20，确保从屏幕外进入）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 360
    obstacle.setVelocityY(360);
    
    // 增加计数
    this.obstacleCount++;
    
    console.log(`生成障碍物 #${this.obstacleCount}，位置: (${randomX}, -20)，速度: 360`);
    
    // 当障碍物离开屏幕底部时销毁（优化内存）
    obstacle.setData('outOfBounds', false);
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText(`已生成障碍物: ${this.obstacleCount}`);

    // 清理离开屏幕的障碍物
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
      gravity: { y: 0 }, // 不使用重力，直接设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);