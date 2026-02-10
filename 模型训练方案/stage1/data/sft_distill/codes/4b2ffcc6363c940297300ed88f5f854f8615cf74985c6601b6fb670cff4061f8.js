class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 200;
    this.enemyPatrolSpeed = 160;
    this.enemyChaseSpeed = 200;
    this.detectionRange = 150;
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 },
      { x: 700, y: 100 }, { x: 100, y: 250 }, { x: 300, y: 250 },
      { x: 500, y: 250 }, { x: 700, y: 250 }, { x: 100, y: 400 },
      { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 },
      { x: 200, y: 500 }, { x: 400, y: 500 }, { x: 600, y: 500 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0);
      
      // 设置初始巡逻方向（交替左右）
      const direction = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(this.enemyPatrolSpeed * direction);
      
      // 自定义属性
      enemy.isChasing = false;
      enemy.patrolDirection = direction;
      enemy.minX = Math.max(50, pos.x - 150);
      enemy.maxX = Math.min(750, pos.x + 150);
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
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 敌人AI逻辑
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 检测玩家是否在范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        this.physics.velocityFromRotation(
          angle,
          this.enemyChaseSpeed,
          enemy.body.velocity
        );

      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocity(this.enemyPatrolSpeed * enemy.patrolDirection, 0);
        }

        // 巡逻边界检测与转向
        if (enemy.x <= enemy.minX && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.enemyPatrolSpeed);
        } else if (enemy.x >= enemy.maxX && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.enemyPatrolSpeed);
        }

        // 确保Y轴速度为0（巡逻时只水平移动）
        if (Math.abs(enemy.body.velocity.y) > 0.1) {
          enemy.setVelocityY(0);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Enemies Chasing: ${this.enemiesChasing}/15`,
      `Use Arrow Keys to Move`
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