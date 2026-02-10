// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(16, 16, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建 4 秒循环定时器生成障碍物
    this.time.addEvent({
      delay: 4000, // 4 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const x = Phaser.Math.Between(50, 750); // 随机 x 坐标（留边距）
    const y = -20; // 从屏幕顶部上方开始

    // 创建物理精灵
    const obstacle = this.physics.add.sprite(x, y, 'obstacle');
    
    // 设置向下速度为 200
    obstacle.setVelocityY(200);

    // 添加到障碍物组
    this.obstacles.add(obstacle);

    // 更新计数器
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);

    // 当障碍物离开屏幕底部时销毁（避免内存泄漏）
    obstacle.setData('checkDestroy', true);
  }

  update(time, delta) {
    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);