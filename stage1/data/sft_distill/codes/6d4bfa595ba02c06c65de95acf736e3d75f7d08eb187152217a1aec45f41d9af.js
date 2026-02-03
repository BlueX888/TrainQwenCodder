class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证状态：生成的障碍物数量
  }

  preload() {
    // 使用 Graphics 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9933ff, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 40, 'Purple obstacles spawn every 2.5s', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  spawnObstacle() {
    // 从顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(50, 750);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 200
    obstacle.setVelocityY(200);
    
    // 增加计数器
    this.obstacleCount++;
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);
    
    // 当障碍物离开屏幕底部时销毁（避免内存泄漏）
    obstacle.setData('spawned', true);
  }

  update() {
    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 650) {
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
      gravity: { y: 0 }, // 不使用重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);