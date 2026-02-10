class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 100;
    this.enemiesChasing = 0;
    this.enemiesPatrolling = 20;
  }

  preload() {
    // 预加载阶段（无外部资源）
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9933ff, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建20个敌人，随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 自定义属性：巡逻方向和状态
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.isChasing = false;
      enemy.detectionRange = 150; // 检测范围
      enemy.patrolSpeed = 200;
      enemy.chaseSpeed = 250;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 560, 'WASD/方向键移动 | 绿色=玩家 | 紫色=敌人', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 300;
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

    // 重置追踪计数
    this.enemiesChasing = 0;
    this.enemiesPatrolling = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        // 进入追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
          enemy.setTint(0xff0000); // 追踪时变红
        }
        this.enemiesChasing++;

        // 追踪玩家
        this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.clearTint(); // 恢复紫色
        }
        this.enemiesPatrolling++;

        // 巡逻逻辑：左右往返
        // 检测是否碰到世界边界
        if (enemy.x <= 12 && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= 788 && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }

        // 如果速度不正确（可能被碰撞改变），重新设置
        if (Math.abs(enemy.body.velocity.x) < enemy.patrolSpeed - 10) {
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人，生命值减少
    this.playerHealth -= 0.5;
    
    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.gameOver();
    }
  }

  updateStatus() {
    this.statusText.setText([
      `生命值: ${Math.floor(this.playerHealth)}`,
      `追踪中: ${this.enemiesChasing}`,
      `巡逻中: ${this.enemiesPatrolling}`
    ]);
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, '刷新页面重新开始', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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