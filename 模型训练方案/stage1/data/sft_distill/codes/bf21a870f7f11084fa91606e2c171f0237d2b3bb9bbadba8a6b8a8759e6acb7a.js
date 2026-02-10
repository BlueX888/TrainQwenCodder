class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建定时器，每4秒生成一个障碍物
    this.time.addEvent({
      delay: 4000, // 4秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.obstacleText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 坐标生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置向下速度为 240
    obstacle.setVelocityY(240);
    
    // 增加障碍物计数
    this.obstacleCount++;
    this.obstacleText.setText('Obstacles: ' + this.obstacleCount);
    
    // 当障碍物离开屏幕底部时销毁（优化性能）
    obstacle.setData('created', true);
  }

  update(time, delta) {
    // 清理离开屏幕的障碍物
    const obstacles = this.physics.world.bodies.entries;
    obstacles.forEach(body => {
      if (body.gameObject && body.gameObject.getData('created')) {
        if (body.gameObject.y > this.scale.height + 50) {
          body.gameObject.destroy();
        }
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