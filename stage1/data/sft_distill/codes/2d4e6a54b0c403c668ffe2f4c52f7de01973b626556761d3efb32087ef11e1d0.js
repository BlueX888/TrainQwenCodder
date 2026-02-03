class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证状态：生成的障碍物数量
    this.activeObstacles = 0; // 当前活跃的障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成灰色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 像素的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建障碍物组（用于管理多个障碍物）
    this.obstacles = this.physics.add.group();

    // 添加定时器事件：每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒 = 1500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（确保障碍物完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵，位置在顶部上方
    const obstacle = this.obstacles.create(randomX, -20, 'obstacleTexture');
    
    // 设置向下速度为 300
    obstacle.setVelocityY(300);
    
    // 更新计数器
    this.obstacleCount++;
    this.activeObstacles++;

    // 当障碍物离开屏幕底部时销毁
    obstacle.setData('isActive', true);
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 620 && obstacle.getData('isActive')) {
        obstacle.setData('isActive', false);
        this.activeObstacles--;
        obstacle.destroy();
      }
    });

    // 更新调试信息
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);
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