class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示障碍物计数（用于验证）
    this.countText = this.add.text(16, 16, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加底部边界检测，障碍物超出屏幕后销毁
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && body.gameObject.texture.key === 'obstacle') {
        body.gameObject.destroy();
      }
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（在屏幕宽度范围内，留出障碍物宽度）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部生成障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 200
    obstacle.setVelocityY(200);
    
    // 启用世界边界碰撞（用于检测离开屏幕）
    obstacle.setCollideWorldBounds(false);
    obstacle.body.onWorldBounds = true;
    
    // 更新计数
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);
    
    console.log(`Obstacle #${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);