class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyStates = []; // 存储敌人状态信息
    this.detectionRange = 200; // 检测范围
    this.patrolSpeed = 160; // 巡逻速度
    this.chaseSpeed = 160; // 追踪速度（与巡逻速度相同）
    
    // 可验证的状态信号
    this.gameState = {
      enemiesPatrolling: 0,
      enemiesChasing: 0,
      playerX: 0,
      playerY: 0
    };
  }

  preload() {
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
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, patrolLeft: 50, patrolRight: 250 },
      { x: 400, y: 450, patrolLeft: 300, patrolRight: 500 },
      { x: 650, y: 250, patrolLeft: 550, patrolRight: 750 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 存储敌人的巡逻状态
      this.enemyStates[index] = {
        sprite: enemy,
        patrolLeft: pos.patrolLeft,
        patrolRight: pos.patrolRight,
        isChasing: false,
        direction: 1 // 1为向右，-1为向左
      };

      // 设置初始速度
      enemy.setVelocityX(this.patrolSpeed);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(10, 10, 'Use Arrow Keys to Move\nEnemies chase when you get close', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 状态显示文本
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);
    
    const playerSpeed = 200;
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

    // 更新状态信号
    this.gameState.playerX = Math.round(this.player.x);
    this.gameState.playerY = Math.round(this.player.y);
    this.gameState.enemiesPatrolling = 0;
    this.gameState.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemyStates.forEach((enemyState, index) => {
      const enemy = enemyState.sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 追踪模式
        enemyState.isChasing = true;
        this.gameState.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置速度朝向玩家
        enemy.setVelocity(
          Math.cos(angle) * this.chaseSpeed,
          Math.sin(angle) * this.chaseSpeed
        );
      } else {
        // 巡逻模式
        enemyState.isChasing = false;
        this.gameState.enemiesPatrolling++;

        // 重置Y轴速度，只在X轴巡逻
        enemy.setVelocityY(0);

        // 检查是否到达巡逻边界
        if (enemy.x <= enemyState.patrolLeft && enemyState.direction === -1) {
          enemyState.direction = 1;
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= enemyState.patrolRight && enemyState.direction === 1) {
          enemyState.direction = -1;
          enemy.setVelocityX(-this.patrolSpeed);
        } else {
          // 保持当前方向的速度
          enemy.setVelocityX(this.patrolSpeed * enemyState.direction);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `Patrolling: ${this.gameState.enemiesPatrolling} | ` +
      `Chasing: ${this.gameState.enemiesChasing} | ` +
      `Player: (${this.gameState.playerX}, ${this.gameState.playerY})`
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