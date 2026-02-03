class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.enemyData = [];
    
    // 可验证的状态信号
    window.__signals__ = {
      playerX: 0,
      playerY: 0,
      enemiesPatrolling: 0,
      enemiesChasing: 0,
      totalEnemies: 10
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建10个敌人，分布在不同位置
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 300;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 为每个敌人存储巡逻数据
      this.enemyData.push({
        sprite: enemy,
        patrolMinX: x - 100,
        patrolMaxX: x + 100,
        patrolSpeed: 160,
        chaseSpeed: 160,
        chaseRange: 150,
        isChasing: false,
        direction: 1 // 1为右，-1为左
      });

      // 设置初始速度
      enemy.setVelocityX(160);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测（可选，防止玩家和敌人重叠）
    this.physics.add.collider(this.player, this.enemies);

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
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

    // 更新每个敌人的行为
    let patrollingCount = 0;
    let chasingCount = 0;

    this.enemyData.forEach(data => {
      const enemy = data.sprite;
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 判断是否进入追踪模式
      if (distance < data.chaseRange) {
        // 追踪模式
        data.isChasing = true;
        chasingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家
        this.physics.velocityFromRotation(
          angle,
          data.chaseSpeed,
          enemy.body.velocity
        );

      } else {
        // 巡逻模式
        data.isChasing = false;
        patrollingCount++;

        // 左右巡逻
        if (enemy.x >= data.patrolMaxX) {
          data.direction = -1;
          enemy.setVelocityX(-data.patrolSpeed);
        } else if (enemy.x <= data.patrolMinX) {
          data.direction = 1;
          enemy.setVelocityX(data.patrolSpeed);
        } else {
          enemy.setVelocityX(data.direction * data.patrolSpeed);
        }

        // 保持Y轴速度为0（巡逻时只水平移动）
        enemy.setVelocityY(0);
      }
    });

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.enemiesPatrolling = patrollingCount;
    window.__signals__.enemiesChasing = chasingCount;

    // 更新调试文本
    this.debugText.setText([
      'Use Arrow Keys to Move',
      `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `Patrolling: ${patrollingCount}`,
      `Chasing: ${chasingCount}`,
      `Total Enemies: ${window.__signals__.totalEnemies}`
    ]);

    // 输出日志JSON（每秒一次）
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log(JSON.stringify({
        timestamp: time,
        signals: window.__signals__
      }));
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