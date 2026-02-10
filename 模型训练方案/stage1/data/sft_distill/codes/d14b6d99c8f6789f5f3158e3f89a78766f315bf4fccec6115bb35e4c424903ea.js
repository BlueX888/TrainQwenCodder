class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.detectionRange = 150; // 检测玩家的距离
    this.patrolSpeed = 80;
    this.chaseSpeed = 120;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建8个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 200, y: 250 },
      { x: 600, y: 250 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 初始化巡逻方向（随机左右）
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
      
      // 标记状态
      enemy.isChasing = false;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化信号
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      enemiesChasing: 0,
      enemiesPatrolling: 8,
      totalEnemies: 8,
      detectionRange: this.detectionRange
    };

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const playerSpeed = 160;
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

    // 敌人AI逻辑
    let chasingCount = 0;
    
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        chasingCount++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        this.physics.velocityFromRotation(
          angle,
          this.chaseSpeed,
          enemy.body.velocity
        );
      } else {
        // 巡逻模式
        enemy.isChasing = false;

        // 检测是否碰到世界边界
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          enemy.patrolDirection *= -1;
        }

        // 设置巡逻速度
        enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        enemy.setVelocityY(0);
      }
    });

    // 更新信号
    window.__signals__ = {
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      enemiesChasing: chasingCount,
      enemiesPatrolling: 8 - chasingCount,
      totalEnemies: 8,
      detectionRange: this.detectionRange,
      timestamp: time
    };

    // 更新状态文本
    this.statusText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Chasing: ${chasingCount} | Patrolling: ${8 - chasingCount}`,
      `Detection Range: ${this.detectionRange}px`,
      `Use Arrow Keys to Move`
    ]);

    // 输出验证日志
    if (Math.floor(time) % 1000 < 20) {
      console.log(JSON.stringify(window.__signals__));
    }
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