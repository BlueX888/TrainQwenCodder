class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 8; // 状态信号：巡逻中的敌人数
    this.enemiesChasing = 0; // 状态信号：追踪中的敌人数
    this.playerHealth = 100; // 状态信号：玩家生命值
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

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
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
      { x: 400, y: 100 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 500 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 设置敌人的自定义属性
      enemy.patrolSpeed = 160;
      enemy.chaseSpeed = 160;
      enemy.detectionRange = 200; // 检测范围
      enemy.isChasing = false;
      
      // 设置初始巡逻方向（随机左或右）
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      
      // 设置巡逻边界
      enemy.patrolMinX = pos.x - 150;
      enemy.patrolMaxX = pos.x + 150;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测（玩家碰到敌人减血）
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 添加状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    // 添加说明文本
    this.add.text(16, 560, 'Arrow keys to move. Avoid enemies!', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 重置状态计数
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        
        this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
        this.enemiesChasing++;
        
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.setVelocityY(0);
        }
        
        this.enemiesPatrolling++;

        // 巡逻逻辑：在边界范围内左右移动
        if (enemy.x <= enemy.patrolMinX) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }
        
        // 保持巡逻速度
        if (Math.abs(enemy.body.velocity.x) < enemy.patrolSpeed - 10) {
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态显示
    this.updateStatusText();
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人减少生命值
    this.playerHealth -= 1;
    
    // 击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // 游戏结束检测
    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.gameOver();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Health: ${this.playerHealth}`,
      `Patrolling: ${this.enemiesPatrolling}`,
      `Chasing: ${this.enemiesChasing}`
    ]);
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    
    const restartText = this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);
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