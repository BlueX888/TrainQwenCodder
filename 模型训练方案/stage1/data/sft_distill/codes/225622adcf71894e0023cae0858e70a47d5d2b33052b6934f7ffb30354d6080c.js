class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyTrackingCount = 0; // 状态信号：正在追踪的敌人数量
    this.totalEnemies = 10; // 状态信号：敌人总数
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 120; // 巡逻速度
    this.chaseSpeed = 180; // 追踪速度
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0099ff, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    // 创建敌人纹理（白色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      key: 'enemy',
      repeat: this.totalEnemies - 1,
      setXY: { 
        x: 100, 
        y: 100, 
        stepX: 70,
        stepY: 60
      }
    });

    // 初始化每个敌人的巡逻状态
    this.enemies.children.entries.forEach((enemy, index) => {
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置初始巡逻方向（随机左右）
      const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(this.patrolSpeed * direction);
      
      // 存储敌人状态
      enemy.setData('isTracking', false);
      enemy.setData('patrolDirection', direction);
      enemy.setData('initialY', enemy.y);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界线以便观察
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.3);
    graphics.strokeRect(0, 0, width, height);
  }

  update(time, delta) {
    // 玩家移动控制
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 重置追踪计数
    this.enemyTrackingCount = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 检测是否在追踪范围内
      if (distance < this.detectionRange) {
        // 进入追踪模式
        enemy.setData('isTracking', true);
        this.enemyTrackingCount++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle,
          this.chaseSpeed,
          enemy.body.velocity
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 退出追踪模式，恢复巡逻
        if (enemy.getData('isTracking')) {
          enemy.setData('isTracking', false);
          enemy.clearTint();
          
          // 恢复巡逻速度
          const direction = enemy.getData('patrolDirection');
          enemy.setVelocityX(this.patrolSpeed * direction);
          enemy.setVelocityY(0);
        }

        // 巡逻模式：检测左右边界碰撞
        if (!enemy.getData('isTracking')) {
          const bounds = this.physics.world.bounds;
          
          // 碰到左边界或右边界时反转方向
          if (enemy.x <= enemy.width / 2 && enemy.body.velocity.x < 0) {
            enemy.setData('patrolDirection', 1);
            enemy.setVelocityX(this.patrolSpeed);
          } else if (enemy.x >= bounds.width - enemy.width / 2 && enemy.body.velocity.x > 0) {
            enemy.setData('patrolDirection', -1);
            enemy.setVelocityX(-this.patrolSpeed);
          }

          // 保持在初始Y轴附近巡逻
          const initialY = enemy.getData('initialY');
          if (Math.abs(enemy.y - initialY) > 5) {
            const yDirection = enemy.y > initialY ? -1 : 1;
            enemy.setVelocityY(yDirection * 50);
          } else {
            enemy.setVelocityY(0);
          }
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Total Enemies: ${this.totalEnemies}`,
      `Tracking: ${this.enemyTrackingCount}`,
      `Patrolling: ${this.totalEnemies - this.enemyTrackingCount}`,
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      '',
      'Use Arrow Keys to Move'
    ]);
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);