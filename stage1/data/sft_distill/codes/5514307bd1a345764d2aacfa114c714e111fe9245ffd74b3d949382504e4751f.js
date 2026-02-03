class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号
    this.playerHealth = 100;
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，分布在不同位置
    const enemyData = [
      { x: 150, y: 150, minX: 50, maxX: 350 },
      { x: 400, y: 250, minX: 250, maxX: 550 },
      { x: 650, y: 150, minX: 500, maxX: 750 }
    ];

    enemyData.forEach(data => {
      const enemy = this.enemies.create(data.x, data.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 存储巡逻数据
      enemy.patrolMinX = data.minX;
      enemy.patrolMaxX = data.maxX;
      enemy.patrolSpeed = 160;
      enemy.chaseSpeed = 160;
      enemy.detectionRange = 200;
      enemy.isChasing = false;
      
      // 初始向右移动
      enemy.setVelocityX(enemy.patrolSpeed);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(10, 10, 'Arrow Keys: Move Player\nGreen enemies patrol and chase when close', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    // 状态显示文本
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 重置状态计数
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 检测玩家是否在追踪范围内
      if (distance < enemy.detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle,
          enemy.chaseSpeed,
          enemy.body.velocity
        );

      } else {
        // 巡逻模式
        enemy.isChasing = false;
        this.enemiesPatrolling++;

        // 左右巡逻逻辑
        if (enemy.body.velocity.x > 0) {
          // 向右移动
          if (enemy.x >= enemy.patrolMaxX) {
            enemy.setVelocityX(-enemy.patrolSpeed);
          }
        } else {
          // 向左移动
          if (enemy.x <= enemy.patrolMinX) {
            enemy.setVelocityX(enemy.patrolSpeed);
          }
        }

        // 保持y轴速度为0（纯水平巡逻）
        enemy.setVelocityY(0);
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}) | ` +
      `Patrolling: ${this.enemiesPatrolling} | Chasing: ${this.enemiesChasing}`
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);