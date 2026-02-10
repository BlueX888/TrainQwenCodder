class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 3;
    this.enemiesChasing = 0;
    this.detectionRange = 150;
    this.patrolSpeed = 160;
    this.chaseSpeed = 200;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, direction: 1 },
      { x: 650, y: 300, direction: -1 },
      { x: 400, y: 500, direction: 1 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性：巡逻方向和状态
      enemy.patrolDirection = pos.direction;
      enemy.isChasing = false;
      enemy.patrolMinX = 50;
      enemy.patrolMaxX = 750;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
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

    // 重置计数器
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
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

        // 设置追踪速度
        enemy.setVelocity(
          Math.cos(angle) * this.chaseSpeed,
          Math.sin(angle) * this.chaseSpeed
        );

        this.enemiesChasing++;
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 巡逻边界检测和方向反转
        if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        this.enemiesPatrolling++;
      }
    });

    // 更新状态文本
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Patrolling Enemies: ${this.enemiesPatrolling}`,
      `Chasing Enemies: ${this.enemiesChasing}`,
      `Detection Range: ${this.detectionRange}px`,
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