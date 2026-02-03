class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器：每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    this.updateStatusText();
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距，避免障碍物贴边）
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置物理属性
    obstacle.setVelocityY(360); // 向下速度 360
    obstacle.body.setAllowGravity(false); // 不受重力影响
    
    // 增加计数
    this.obstacleCount++;
    this.updateStatusText();
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
        obstacle.destroy();
      }
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `Obstacles Spawned: ${this.obstacleCount}\n` +
      `Active Obstacles: ${this.obstacles.getLength()}`
    );
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
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);