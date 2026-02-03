class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 验证信号：记录生成的障碍物数量
  }

  preload() {
    // 使用 Graphics 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建障碍物组
    this.obstacles = this.physics.add.group();

    // 添加定时器：每4秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 4000, // 4秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示生成计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加提示文本
    this.add.text(400, 300, 'Yellow obstacles spawn every 4 seconds', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(40, 760);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 120
    obstacle.setVelocityY(120);
    
    // 增加计数
    this.obstacleCount++;
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);

    // 当障碍物离开屏幕底部时销毁（避免内存泄漏）
    obstacle.setData('checkBounds', true);
  }

  update(time, delta) {
    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.getData('checkBounds') && obstacle.y > 650) {
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);