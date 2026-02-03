class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器事件，每1.5秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于调试和验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机X坐标生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边距
    const obstacle = this.obstacles.create(randomX, -20, 'obstacleTexture');
    
    // 设置障碍物属性
    obstacle.setVelocityY(80); // 向下速度为80
    
    // 增加计数器
    this.obstacleCount++;
    
    console.log(`Obstacle spawned at x=${randomX}, total count: ${this.obstacleCount}`);
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText(`Obstacles spawned: ${this.obstacleCount}`);

    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 650) { // 超出屏幕底部50像素
        obstacle.destroy();
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
      gravity: { y: 0 }, // 不使用全局重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);