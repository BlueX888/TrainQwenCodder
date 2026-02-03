class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemies = [];
    this.player = null;
    this.cursors = null;
    
    // 可验证的状态信号
    window.__signals__ = {
      playerX: 0,
      playerY: 0,
      enemiesPatrolling: 0,
      enemiesChasing: 0,
      totalEnemies: 8,
      detectionRange: 150,
      patrolSpeed: 80
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0066ff, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建8个敌人，分布在不同位置
    const enemyPositions = [
      { x: 100, y: 100, minX: 50, maxX: 300 },
      { x: 700, y: 100, minX: 500, maxX: 750 },
      { x: 150, y: 250, minX: 50, maxX: 350 },
      { x: 650, y: 250, minX: 450, maxX: 750 },
      { x: 200, y: 400, minX: 50, maxX: 400 },
      { x: 600, y: 400, minX: 400, maxX: 750 },
      { x: 100, y: 550, minX: 50, maxX: 300 },
      { x: 700, y: 550, minX: 500, maxX: 750 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 存储敌人的巡逻数据
      enemy.patrolMinX = pos.minX;
      enemy.patrolMaxX = pos.maxX;
      enemy.patrolSpeed = 80;
      enemy.isChasing = false;
      
      // 设置初始巡逻方向（一半向左，一半向右）
      const initialDirection = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(enemy.patrolSpeed * initialDirection);
      
      this.enemies.push(enemy);
    });

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log('Game initialized:', JSON.stringify({
      playerPosition: { x: this.player.x, y: this.player.y },
      enemyCount: this.enemies.length,
      detectionRange: 150,
      patrolSpeed: 80
    }));
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

    // 更新敌人行为
    let chasingCount = 0;
    let patrollingCount = 0;

    this.enemies.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      const detectionRange = 150;

      if (distance < detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        chasingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度（比巡逻稍快）
        const chaseSpeed = 120;
        enemy.setVelocity(
          Math.cos(angle) * chaseSpeed,
          Math.sin(angle) * chaseSpeed
        );

      } else {
        // 巡逻模式
        enemy.isChasing = false;
        patrollingCount++;

        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolMinX) {
          enemy.setVelocityX(enemy.patrolSpeed);
          enemy.setVelocityY(0);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.setVelocityX(-enemy.patrolSpeed);
          enemy.setVelocityY(0);
        }

        // 如果速度为0（可能被碰撞停止），重新设置
        if (enemy.body.velocity.x === 0 && enemy.body.velocity.y === 0) {
          enemy.setVelocityX(enemy.patrolSpeed);
        }
      }
    });

    // 更新signals
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.enemiesPatrolling = patrollingCount;
    window.__signals__.enemiesChasing = chasingCount;

    // 更新调试文本
    this.debugText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Patrolling: ${patrollingCount}`,
      `Chasing: ${chasingCount}`,
      `Use Arrow Keys to Move`
    ]);

    // 定期输出日志
    if (time % 2000 < delta) {
      console.log('Status:', JSON.stringify(window.__signals__));
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