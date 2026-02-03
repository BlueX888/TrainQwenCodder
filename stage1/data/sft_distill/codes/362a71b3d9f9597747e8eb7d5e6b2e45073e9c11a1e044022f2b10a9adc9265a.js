class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyCount = 15;
    this.trackingCount = 0;
    this.patrolSpeed = 120;
    this.trackingDistance = 150;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0066ff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人
    for (let i = 0; i < this.enemyCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 随机初始巡逻方向（左或右）
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
      
      // 状态标记
      enemy.isTracking = false;
    }

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, 'Use Arrow Keys to Move', {
      fontSize: '14px',
      fill: '#ffffff'
    });
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
    this.trackingCount = 0;

    // 更新每个敌人的行为
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 检测是否应该追踪玩家
      if (distance < this.trackingDistance) {
        // 追踪模式
        if (!enemy.isTracking) {
          enemy.isTracking = true;
        }
        
        this.trackingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );

        // 设置追踪速度（稍快于巡逻速度）
        const trackSpeed = this.patrolSpeed * 1.2;
        enemy.setVelocity(
          Math.cos(angle) * trackSpeed,
          Math.sin(angle) * trackSpeed
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        if (enemy.isTracking) {
          enemy.isTracking = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 恢复蓝色
        enemy.clearTint();

        // 边界检测 - 碰到左右边界时反向
        if (enemy.x <= 15 && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= 785 && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.patrolSpeed);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Total Enemies: ${this.enemyCount}`,
      `Tracking Player: ${this.trackingCount}`,
      `Patrolling: ${this.enemyCount - this.trackingCount}`
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