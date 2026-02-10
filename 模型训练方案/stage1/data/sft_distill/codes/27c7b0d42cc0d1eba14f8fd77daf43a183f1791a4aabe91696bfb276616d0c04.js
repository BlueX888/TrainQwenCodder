class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 160;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成8个敌人，分布在场景不同位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 150 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 450 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置初始巡逻方向（随机左右）
      enemy.patrolDirection = Math.random() > 0.5 ? 1 : -1;
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
      
      // 标记状态
      enemy.isChasing = false;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(10, 10, 'Arrow keys to move\nEnemies patrol and chase when near', {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 状态显示
    this.statusText = this.add.text(10, 70, '', {
      fontSize: '14px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 初始化状态
    this.enemiesPatrolling = 8;
    this.enemiesChasing = 0;
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

    // 重置状态计数
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        this.physics.velocityFromRotation(angle, this.patrolSpeed, enemy.body.velocity);
        this.enemiesChasing++;
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 检测边界碰撞，反向移动
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          enemy.patrolDirection *= -1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        this.enemiesPatrolling++;
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `Patrolling: ${this.enemiesPatrolling}\n` +
      `Chasing: ${this.enemiesChasing}`
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